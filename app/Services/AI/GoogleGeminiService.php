<?php

namespace App\Services\AI;

use App\DTOs\MoralAssessmentInput;
use App\DTOs\MoralAssessmentResult;
use App\Services\AI\Exceptions\AiAssessmentException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class GoogleGeminiService implements MoralAssessmentService
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
        private readonly string $baseUrl,
        private readonly string $promptVersion,
        private readonly string $systemPrompt,
        private readonly array $jsonSchema,
        private readonly int $timeout,
    ) {}

    public function assess(MoralAssessmentInput $input): MoralAssessmentResult
    {
        $userPrompt = $this->buildUserPrompt($input);

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $this->apiKey,
            ])
                ->contentType('application/json')
                ->timeout($this->timeout)
                ->post("{$this->baseUrl}/models/{$this->model}:generateContent", [
                    'system_instruction' => [
                        'parts' => [['text' => $this->systemPrompt]],
                    ],
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [['text' => $userPrompt]],
                        ],
                    ],
                    'generationConfig' => [
                        'response_mime_type' => 'application/json',
                        'response_schema' => $this->jsonSchema,
                    ],
                ]);

            $response->throw();
        } catch (ConnectionException $exception) {
            throw new AiAssessmentException('AI provider connection failed: '.$exception->getMessage(), previous: $exception);
        } catch (RequestException $exception) {
            throw new AiAssessmentException('AI provider returned an error: '.$exception->getMessage(), previous: $exception);
        }

        $payload = $response->json();

        if (! is_array($payload)) {
            throw new AiAssessmentException('AI provider returned an unexpected response shape.');
        }

        $text = $payload['output'] ?? $payload['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if ($text === null) {
            $blockReason = $payload['promptFeedback']['blockReason'] ?? 'unknown';
            throw new AiAssessmentException("AI response blocked or empty. Reason: {$blockReason}");
        }

        $result = json_decode($text, true);

        if (! is_array($result)) {
            throw new AiAssessmentException('AI provider returned invalid JSON in response content.');
        }

        $this->validateResultShape($result);

        return new MoralAssessmentResult(
            moralLevel: $result['moral_level'],
            confidence: $result['confidence'] ?? null,
            indicators: $result['indicators'] ?? [],
            reasoningSummary: $result['reasoning_summary'] ?? '',
            warningSignals: $result['warning_signals'] ?? [],
            suggestedIntervention: $result['suggested_intervention'] ?? null,
            provider: 'google_gemini',
            model: $this->model,
            promptVersion: $this->promptVersion,
            rawResponse: $payload,
        );
    }

    /**
     * @param  array<string, mixed>  $result
     */
    private function validateResultShape(array $result): void
    {
        if (! isset($result['moral_level'])) {
            throw new AiAssessmentException('AI response missing required field: moral_level');
        }

        $validLevels = ['pre_conventional', 'conventional', 'post_conventional'];

        if (! in_array($result['moral_level'], $validLevels, true)) {
            throw new AiAssessmentException("Invalid moral_level: [{$result['moral_level']}]. Must be one of: ".implode(', ', $validLevels));
        }
    }

    private function buildUserPrompt(MoralAssessmentInput $input): string
    {
        $answerText = $input->studentAnswer['transcript']
            ?? $input->studentAnswer['typed_reason']
            ?? '';

        return "Kasus: {$input->case['title']}\n\n"
            ."Cerita: {$input->case['story']}\n\n"
            ."Pilihan santri: {$input->case['selected_option']}\n\n"
            ."Alasan santri: {$answerText}\n\n"
            ."Indikator yang diizinkan: ".implode(', ', $input->allowedIndicators);
    }
}

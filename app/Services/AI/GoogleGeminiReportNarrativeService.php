<?php

namespace App\Services\AI;

use App\DTOs\ReportNarrativeInput;
use App\DTOs\ReportNarrativeResult;
use App\Services\AI\Exceptions\AiAssessmentException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class GoogleGeminiReportNarrativeService implements ReportNarrativeService
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

    public function generate(ReportNarrativeInput $input): ReportNarrativeResult
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

        if (! isset($result['narrative'])) {
            throw new AiAssessmentException('AI response missing required field: narrative');
        }

        return new ReportNarrativeResult(
            narrative: (string) $result['narrative'],
            recommendation: (string) ($result['recommendation'] ?? ''),
            provider: 'google_gemini',
            model: $this->model,
            promptVersion: $this->promptVersion,
            rawResponse: $payload,
        );
    }

    private function buildUserPrompt(ReportNarrativeInput $input): string
    {
        return "Santri: {$input->studentName}\n\n"
            ."Periode: {$input->periodStart} s.d. {$input->periodEnd}\n\n"
            .'Rekap tes: '.json_encode($input->testSummary, JSON_UNESCAPED_UNICODE)."\n\n"
            .'Rekap observasi: '.json_encode($input->observationSummary, JSON_UNESCAPED_UNICODE)."\n\n"
            .'Skor gabungan: '.json_encode($input->combined, JSON_UNESCAPED_UNICODE);
    }
}

<?php

namespace App\Jobs;

use App\DTOs\MoralAssessmentInput;
use App\Enums\AssessmentStatus;
use App\Models\AiAssessment;
use App\Models\TestAnswer;
use App\Services\AI\Exceptions\AiAssessmentException;
use App\Services\AI\FakeMoralAssessmentService;
use App\Services\AI\GoogleGeminiService;
use App\Services\AI\MoralAssessmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class AiAssessmentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries;

    public function __construct(
        public readonly int $testAnswerId,
    ) {
        $this->tries = (int) config('ai.retry.tries', 3);
    }

    public function backoff(): array
    {
        return config('ai.retry.backoff_seconds', [10, 30, 60]);
    }

    public function handle(): void
    {
        $testAnswer = TestAnswer::query()
            ->with(['moralCase.options', 'selectedOption', 'transcriptions'])
            ->find($this->testAnswerId);

        if ($testAnswer === null) {
            Log::warning('AiAssessmentJob: test answer not found, skipping.', [
                'test_answer_id' => $this->testAnswerId,
            ]);

            return;
        }

        $assessment = AiAssessment::query()->updateOrCreate(
            ['test_answer_id' => $this->testAnswerId],
            [
                'provider' => config('ai.provider'),
                'model' => config('ai.google_gemini.model'),
                'status' => AssessmentStatus::Processing->value,
            ],
        );

        try {
            $input = $this->buildInput($testAnswer);

            $result = $this->resolveService()->assess($input);

            $assessment->forceFill([
                'provider' => $result->provider,
                'model' => $result->model,
                'moral_level' => $result->moralLevel,
                'confidence' => $result->confidence,
                'reasoning_summary' => $result->reasoningSummary,
                'suggested_intervention' => $result->suggestedIntervention,
                'warning_signals_json' => $result->warningSignals,
                'indicators_json' => $result->indicators,
                'prompt_version' => $result->promptVersion,
                'raw_response_json' => $result->rawResponse,
                'status' => AssessmentStatus::Completed->value,
                'error_message' => null,
                'processed_at' => now(),
            ])->save();

            Log::info('AiAssessmentJob: assessment completed.', [
                'test_answer_id' => $this->testAnswerId,
                'provider' => $result->provider,
                'moral_level' => $result->moralLevel,
                'confidence' => $result->confidence,
            ]);
        } catch (AiAssessmentException $exception) {
            Log::error('AiAssessmentJob: assessment failed.', [
                'test_answer_id' => $this->testAnswerId,
                'attempt' => $this->attempts(),
                'max_tries' => $this->tries,
                'error' => $exception->getMessage(),
            ]);

            $assessment->forceFill([
                'status' => AssessmentStatus::Failed->value,
                'error_message' => $exception->getMessage(),
                'processed_at' => now(),
            ])->save();

            throw $exception;
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('AiAssessmentJob: all retry attempts exhausted.', [
            'test_answer_id' => $this->testAnswerId,
            'error' => $exception?->getMessage(),
        ]);

        AiAssessment::query()
            ->where('test_answer_id', $this->testAnswerId)
            ->first()
            ?->forceFill([
                'status' => AssessmentStatus::Failed->value,
                'error_message' => $exception?->getMessage() ?? 'Assessment job failed after all retry attempts.',
                'processed_at' => now(),
            ])->save();
    }

    private function resolveService(): MoralAssessmentService
    {
        $provider = config('ai.provider', 'fake');

        return match ($provider) {
            'google_gemini' => new GoogleGeminiService(
                apiKey: config('ai.google_gemini.api_key', ''),
                model: config('ai.google_gemini.model', 'gemini-2.0-flash'),
                baseUrl: config('ai.google_gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'),
                promptVersion: config('ai.prompt_version', 'moral-classifier-v1'),
                systemPrompt: $this->loadPrompt(),
                jsonSchema: config('ai.json_schema', []),
                timeout: (int) config('ai.timeout', 60),
            ),
            'fake' => new FakeMoralAssessmentService,
            default => throw new \InvalidArgumentException("Unsupported AI provider: [{$provider}]"),
        };
    }

    private function loadPrompt(): string
    {
        $path = config('ai.prompt_file');

        if ($path === null || ! file_exists($path)) {
            return 'Anda membantu ustadz mengklasifikasikan kualitas penalaran moral anak usia 6-10 tahun. Klasifikasikan alasan, bukan hanya pilihan tindakan. Gunakan hanya kategori: pre_conventional, conventional, post_conventional. Jangan melakukan diagnosis psikologis. Jangan memberikan label permanen. Gunakan bahasa netral. Hasil adalah rekomendasi yang harus dikonfirmasi ustadz. Kembalikan JSON sesuai schema.';
        }

        $content = file_get_contents($path);

        if ($content === false) {
            Log::error('AiAssessmentJob: failed to read prompt file.', ['path' => $path]);

            throw new \RuntimeException("Failed to read AI prompt file at: {$path}");
        }

        return $content;
    }

    private function buildInput(TestAnswer $testAnswer): MoralAssessmentInput
    {
        $moralCase = $testAnswer->moralCase;
        $selectedOption = $testAnswer->selectedOption;
        $transcription = $testAnswer->transcriptions->firstWhere('status', 'completed');

        $transcriptText = $transcription?->edited_text ?? $transcription?->original_text;

        $indicatorCodes = $moralCase->indicators->pluck('code')->toArray();

        return new MoralAssessmentInput(
            case: [
                'title' => $moralCase->title,
                'story' => $moralCase->story,
                'selected_option' => $selectedOption?->label ?? '',
            ],
            studentAnswer: [
                'typed_reason' => $testAnswer->typed_reason,
                'transcript' => $transcriptText,
            ],
            rubric: [
                'levels' => ['pre_conventional', 'conventional', 'post_conventional'],
            ],
            allowedIndicators: $indicatorCodes,
        );
    }
}

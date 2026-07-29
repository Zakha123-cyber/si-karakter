<?php

namespace App\Jobs;

use App\Enums\TranscriptionStatus;
use App\Models\AnswerAudioFile;
use App\Models\Transcription;
use App\Services\Speech\Exceptions\SpeechToTextException;
use App\Services\Speech\SpeechToTextService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class TranscribeAnswerJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries;

    public function __construct(
        public readonly int $answerAudioFileId,
    ) {
        $this->tries = (int) config('speech.retry.tries', 3);
    }

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return config('speech.retry.backoff_seconds', [30, 60, 120]);
    }

    public function handle(SpeechToTextService $speechToTextService): void
    {
        $audioFile = AnswerAudioFile::query()->find($this->answerAudioFileId);

        if ($audioFile === null) {
            return;
        }

        $transcription = Transcription::query()->updateOrCreate(
            ['test_answer_id' => $audioFile->test_answer_id],
            [
                'provider' => config('speech.provider'),
                'model' => config('speech.groq.model'),
                'status' => TranscriptionStatus::Processing->value,
            ],
        );

        try {
            $result = $speechToTextService->transcribe($audioFile->file_path);

            $transcription->forceFill([
                'provider' => $result->provider,
                'model' => $result->model,
                'original_text' => $result->text,
                'language' => $result->language,
                'confidence' => $result->confidence,
                'status' => TranscriptionStatus::Completed->value,
                'error_message' => null,
                'raw_response_json' => $result->rawResponse,
                'processed_at' => now(),
            ])->save();
        } catch (SpeechToTextException $exception) {
            $transcription->forceFill([
                'status' => TranscriptionStatus::Failed->value,
                'error_message' => $exception->getMessage(),
                'processed_at' => now(),
            ])->save();

            throw $exception;
        }
    }

    public function failed(?Throwable $exception): void
    {
        $audioFile = AnswerAudioFile::query()->find($this->answerAudioFileId);

        if ($audioFile === null) {
            return;
        }

        Transcription::query()
            ->where('test_answer_id', $audioFile->test_answer_id)
            ->first()
            ?->forceFill([
                'status' => TranscriptionStatus::Failed->value,
                'error_message' => $exception?->getMessage() ?? 'Transcription job failed after all retry attempts.',
                'processed_at' => now(),
            ])->save();
    }
}

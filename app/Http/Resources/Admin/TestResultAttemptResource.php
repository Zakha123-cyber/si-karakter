<?php

namespace App\Http\Resources\Admin;

use App\Models\Student;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property TestAttempt $resource
 *
 * @mixin TestAttempt
 */
class TestResultAttemptResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var TestAttempt $attempt */
        $attempt = $this->resource;
        /** @var Student|null $student */
        $student = $attempt->student;
        /** @var TestPackage|null $testPackage */
        $testPackage = $attempt->testPackage;

        $answersCount = (int) ($attempt->answers_count ?? 0);
        $audioCount = (int) ($attempt->answers_audio_files_count ?? 0);
        $completedTranscriptions = (int) ($attempt->answers_completed_transcriptions_count ?? 0);
        $failedTranscriptions = (int) ($attempt->answers_failed_transcriptions_count ?? 0);
        $processingTranscriptions = (int) ($attempt->answers_processing_transcriptions_count ?? 0);
        $pendingTranscriptions = max(0, $audioCount - $completedTranscriptions - $failedTranscriptions - $processingTranscriptions);
        $validatedAnswers = (int) ($attempt->answers_teacher_validations_count ?? 0);

        return [
            'id' => $attempt->id,
            'attempt_number' => $attempt->attempt_number,
            'status' => $attempt->status,
            'started_at' => $attempt->started_at?->toISOString(),
            'submitted_at' => $attempt->submitted_at?->toISOString(),
            'completed_at' => $attempt->completed_at?->toISOString(),
            'student' => $student ? [
                'id' => $student->id,
                'name' => $student->user?->name,
                'username' => $student->user?->username,
                'student_code' => $student->student_code,
            ] : null,
            'group' => $student?->currentGroup ? [
                'id' => $student->currentGroup->id,
                'name' => $student->currentGroup->name,
            ] : null,
            'test_package' => $testPackage ? [
                'id' => $testPackage->id,
                'title' => $testPackage->title,
            ] : null,
            'summary' => [
                'answers_count' => $answersCount,
                'audio_count' => $audioCount,
                'completed_transcriptions' => $completedTranscriptions,
                'failed_transcriptions' => $failedTranscriptions,
                'processing_transcriptions' => $processingTranscriptions,
                'pending_transcriptions' => $pendingTranscriptions,
                'validated_answers' => $validatedAnswers,
            ],
        ];
    }
}

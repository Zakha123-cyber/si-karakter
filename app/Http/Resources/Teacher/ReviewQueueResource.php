<?php

namespace App\Http\Resources\Teacher;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewQueueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $latestValidation = $this->teacherValidations->first();
        $aiAssessment = $this->aiAssessments->first();
        $transcription = $this->transcriptions->first();
        $student = $this->testAttempt?->student;
        $group = $student?->currentGroup;
        $testPackage = $this->testAttempt?->testPackage;

        $validationStatus = 'pending_review';
        if ($latestValidation) {
            $validationStatus = $latestValidation->decision;
        }

        return [
            'id' => $this->id,
            'test_attempt_id' => $this->test_attempt_id,
            'answer_status' => $this->answer_status,
            'submitted_at' => $this->testAttempt?->submitted_at?->toIso8601String(),
            'student' => [
                'id' => $student?->id,
                'name' => $student?->user?->name,
                'student_code' => $student?->student_code,
            ],
            'group' => [
                'id' => $group?->id,
                'name' => $group?->name,
            ],
            'test_package' => [
                'id' => $testPackage?->id,
                'title' => $testPackage?->title,
            ],
            'moral_case' => [
                'id' => $this->moralCase?->id,
                'title' => $this->moralCase?->title,
            ],
            'audio' => [
                'has_audio' => $this->audioFiles->isNotEmpty(),
                'file_count' => $this->audioFiles->count(),
            ],
            'transcription' => [
                'status' => $transcription?->status,
                'confidence' => $transcription?->confidence,
            ],
            'ai_assessment' => [
                'moral_level' => $aiAssessment?->moral_level,
                'confidence' => $aiAssessment?->confidence,
                'status' => $aiAssessment?->status,
            ],
            'validation' => [
                'status' => $validationStatus,
                'decision' => $latestValidation?->decision,
                'final_moral_level' => $latestValidation?->final_moral_level,
                'validated_at' => $latestValidation?->validated_at?->toIso8601String(),
            ],
        ];
    }
}

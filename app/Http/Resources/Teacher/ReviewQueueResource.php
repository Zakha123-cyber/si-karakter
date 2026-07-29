<?php

namespace App\Http\Resources\Teacher;

use App\Models\AiAssessment;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\Transcription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property TestAnswer $resource
 *
 * @mixin TestAnswer
 */
class ReviewQueueResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var TestAnswer $answer */
        $answer = $this->resource;

        /** @var TeacherValidation|null $latestValidation */
        $latestValidation = $answer->teacherValidations->first();
        /** @var AiAssessment|null $aiAssessment */
        $aiAssessment = $answer->aiAssessments->first();
        /** @var Transcription|null $transcription */
        $transcription = $answer->transcriptions->first();
        /** @var TestAttempt|null $attempt */
        $attempt = $answer->testAttempt;
        /** @var Student|null $student */
        $student = $attempt?->student;
        /** @var Group|null $group */
        $group = $student?->currentGroup;
        /** @var TestPackage|null $testPackage */
        $testPackage = $attempt?->testPackage;
        /** @var MoralCase|null $moralCase */
        $moralCase = $answer->moralCase;

        $validationStatus = 'pending_review';
        if ($latestValidation) {
            $validationStatus = $latestValidation->decision;
        }

        return [
            'id' => $answer->id,
            'test_attempt_id' => $answer->test_attempt_id,
            'answer_status' => $answer->answer_status,
            'submitted_at' => $attempt?->submitted_at,
            'student' => $student ? [
                'id' => $student->id,
                'name' => $student->user?->name,
                'student_code' => $student->student_code,
            ] : null,
            'group' => $group ? [
                'id' => $group->id,
                'name' => $group->name,
            ] : null,
            'test_package' => $testPackage ? [
                'id' => $testPackage->id,
                'title' => $testPackage->title,
            ] : null,
            'moral_case' => $moralCase ? [
                'id' => $moralCase->id,
                'title' => $moralCase->title,
            ] : null,
            'audio' => [
                'has_audio' => $answer->audioFiles->isNotEmpty(),
                'file_count' => $answer->audioFiles->count(),
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
                'validated_at' => $latestValidation?->validated_at,
            ],
        ];
    }
}

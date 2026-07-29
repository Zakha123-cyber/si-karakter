<?php

namespace App\Http\Resources\Admin;

use App\Models\AiAssessment;
use App\Models\AnswerAudioFile;
use App\Models\MoralCaseOption;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\Transcription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property TestAttempt $resource
 *
 * @mixin TestAttempt
 */
class TestResultDetailResource extends JsonResource
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

        $answers = $attempt->answers->map(function (TestAnswer $answer) {
            /** @var AnswerAudioFile|null $audioFile */
            $audioFile = $answer->audioFiles->first();
            /** @var Transcription|null $transcription */
            $transcription = $answer->transcriptions->first();
            /** @var AiAssessment|null $aiAssessment */
            $aiAssessment = $answer->aiAssessments->first();
            /** @var TeacherValidation|null $validation */
            $validation = $answer->teacherValidations->first();
            /** @var MoralCaseOption|null $selectedOption */
            $selectedOption = $answer->selectedOption;

            return [
                'id' => $answer->id,
                'answer_status' => $answer->answer_status,
                'typed_reason' => $answer->typed_reason,
                'final_transcript' => $answer->final_transcript,
                'moral_case' => $answer->moralCase ? [
                    'id' => $answer->moralCase->id,
                    'title' => $answer->moralCase->title,
                    'story' => $answer->moralCase->story,
                    'options' => $answer->moralCase->options->map(fn (MoralCaseOption $option) => [
                        'id' => $option->id,
                        'label' => $option->label,
                        'text' => $option->text,
                        'internal_value' => $option->internal_value,
                    ])->values(),
                ] : null,
                'selected_option' => $selectedOption ? [
                    'id' => $selectedOption->id,
                    'label' => $selectedOption->label,
                    'text' => $selectedOption->text,
                    'internal_value' => $selectedOption->internal_value,
                ] : null,
                'audio' => $audioFile ? [
                    'id' => $audioFile->id,
                    'original_name' => $audioFile->original_name,
                    'mime_type' => $audioFile->mime_type,
                    'file_size' => $audioFile->file_size,
                    'duration_seconds' => $audioFile->duration_seconds,
                    'url' => route('admin.test-results.answers.audio', $answer),
                ] : null,
                'transcription' => $transcription ? [
                    'id' => $transcription->id,
                    'provider' => $transcription->provider,
                    'model' => $transcription->model,
                    'original_text' => $transcription->original_text,
                    'edited_text' => $transcription->edited_text,
                    'language' => $transcription->language,
                    'confidence' => $transcription->confidence === null ? null : (float) $transcription->confidence,
                    'status' => $transcription->status,
                    'error_message' => $transcription->error_message,
                    'processed_at' => $transcription->processed_at?->toISOString(),
                    'updated_at' => $transcription->updated_at?->toISOString(),
                ] : null,
                'ai_assessment' => $aiAssessment ? [
                    'id' => $aiAssessment->id,
                    'provider' => $aiAssessment->provider,
                    'model' => $aiAssessment->model,
                    'moral_level' => $aiAssessment->moral_level,
                    'confidence' => (float) $aiAssessment->confidence,
                    'reasoning_summary' => $aiAssessment->reasoning_summary,
                    'suggested_intervention' => $aiAssessment->suggested_intervention,
                    'warning_signals' => $aiAssessment->warning_signals_json ?? [],
                    'indicators' => $aiAssessment->indicators_json ?? [],
                    'status' => $aiAssessment->status,
                    'error_message' => $aiAssessment->error_message,
                    'processed_at' => $aiAssessment->processed_at?->toISOString(),
                ] : null,
                'validation' => $validation ? [
                    'id' => $validation->id,
                    'decision' => $validation->decision,
                    'final_moral_level' => $validation->final_moral_level,
                    'final_indicators' => $validation->final_indicators_json ?? [],
                    'teacher_note' => $validation->teacher_note,
                    'override_reason' => $validation->override_reason,
                    'teacher_name' => $validation->teacher?->name,
                    'validated_at' => $validation->validated_at?->toISOString(),
                ] : null,
                'created_at' => $answer->created_at?->toISOString(),
                'updated_at' => $answer->updated_at?->toISOString(),
            ];
        })->values();

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
                'gender' => $student->gender,
                'status' => $student->status,
            ] : null,
            'group' => $student?->currentGroup ? [
                'id' => $student->currentGroup->id,
                'name' => $student->currentGroup->name,
            ] : null,
            'test_package' => $testPackage ? [
                'id' => $testPackage->id,
                'title' => $testPackage->title,
                'description' => $testPackage->description,
            ] : null,
            'answers' => $answers,
            'summary' => [
                'answers_count' => $answers->count(),
                'audio_count' => $answers->whereNotNull('audio')->count(),
                'completed_transcriptions' => $answers->where('transcription.status', 'completed')->count(),
                'failed_transcriptions' => $answers->where('transcription.status', 'failed')->count(),
                'processing_transcriptions' => $answers->where('transcription.status', 'processing')->count(),
                'validated_answers' => $answers->whereNotNull('validation')->count(),
            ],
        ];
    }
}

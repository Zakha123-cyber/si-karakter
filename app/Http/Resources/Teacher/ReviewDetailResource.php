<?php

namespace App\Http\Resources\Teacher;

use App\Models\AiAssessment;
use App\Models\AnswerAudioFile;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\MoralCaseOption;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\Transcription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property TestAnswer $resource
 *
 * @mixin TestAnswer
 */
class ReviewDetailResource extends JsonResource
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
        /** @var AnswerAudioFile|null $audioFile */
        $audioFile = $answer->audioFiles->first();
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
        /** @var MoralCaseOption|null $selectedOption */
        $selectedOption = $answer->selectedOption;
        /** @var User|null $teacher */
        $teacher = $latestValidation?->teacher;

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
                'gender' => $student->gender,
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
                'story' => $moralCase->story,
                'options' => $moralCase->options->map(fn (mixed $opt) => [
                    'id' => data_get($opt, 'id'),
                    'label' => data_get($opt, 'label'),
                    'text' => data_get($opt, 'text'),
                    'internal_value' => data_get($opt, 'internal_value'),
                ]),
            ] : null,
            'selected_option' => $selectedOption ? [
                'id' => $selectedOption->id,
                'label' => $selectedOption->label,
                'text' => $selectedOption->text,
                'internal_value' => $selectedOption->internal_value,
            ] : null,
            'typed_reason' => $answer->typed_reason,
            'final_transcript' => $answer->final_transcript,
            'audio' => $audioFile ? [
                'id' => $audioFile->id,
                'file_path' => $audioFile->file_path,
                'original_name' => $audioFile->original_name,
                'duration_seconds' => $audioFile->duration_seconds,
                'url' => route('teacher.reviews.audio', $answer),
            ] : null,
            'transcription' => $transcription ? [
                'id' => $transcription->id,
                'provider' => $transcription->provider,
                'model' => $transcription->model,
                'original_text' => $transcription->original_text,
                'edited_text' => $transcription->edited_text,
                'confidence' => $transcription->confidence,
                'status' => $transcription->status,
                'processed_at' => $transcription->processed_at,
            ] : null,
            'ai_assessment' => $aiAssessment ? [
                'id' => $aiAssessment->id,
                'provider' => $aiAssessment->provider,
                'model' => $aiAssessment->model,
                'moral_level' => $aiAssessment->moral_level,
                'confidence' => $aiAssessment->confidence,
                'reasoning_summary' => $aiAssessment->reasoning_summary,
                'suggested_intervention' => $aiAssessment->suggested_intervention,
                'warning_signals' => $aiAssessment->warning_signals_json ?? [],
                'indicators' => $aiAssessment->indicators_json ?? [],
                'prompt_version' => $aiAssessment->prompt_version,
                'raw_response' => $aiAssessment->raw_response_json,
                'status' => $aiAssessment->status,
                'processed_at' => $aiAssessment->processed_at,
            ] : null,
            'validation' => [
                'status' => $validationStatus,
                'id' => $latestValidation?->id,
                'decision' => $latestValidation?->decision,
                'final_moral_level' => $latestValidation?->final_moral_level,
                'final_indicators' => $latestValidation ? $latestValidation->final_indicators_json : [],
                'teacher_note' => $latestValidation?->teacher_note,
                'override_reason' => $latestValidation?->override_reason,
                'teacher_name' => $teacher?->name,
                'validated_at' => $latestValidation?->validated_at,
            ],
            'audit_trail' => array_filter([
                $attempt?->submitted_at ? [
                    'event' => 'Jawaban Santri Dikirim',
                    'timestamp' => (string) $attempt->submitted_at,
                    'actor' => $student && $student->user ? $student->user->name : 'Santri',
                    'description' => 'Jawaban pilihan ganda dan rekaman audio berhasil diunggah.',
                ] : null,
                $transcription?->processed_at ? [
                    'event' => 'Transkripsi STT Selesai',
                    'timestamp' => (string) $transcription->processed_at,
                    'actor' => "AI STT ({$transcription->provider})",
                    'description' => 'Transkripsi audio berhasil dibuat dengan keyakinan '.number_format(($transcription->confidence ?? 0) * 100, 1).'%',
                ] : null,
                $transcription?->edited_text ? [
                    'event' => 'Revisi Transkripsi Suara',
                    'timestamp' => (string) $transcription->updated_at,
                    'actor' => 'Ustadz',
                    'description' => 'Teks transkripsi suara berhasil diperbaiki oleh Ustadz.',
                ] : null,
                $aiAssessment?->processed_at ? [
                    'event' => 'Penilaian AI Assessment',
                    'timestamp' => (string) $aiAssessment->processed_at,
                    'actor' => "LLM ({$aiAssessment->provider} {$aiAssessment->model})",
                    'description' => "Rekomendasi tingkat moral: {$aiAssessment->moral_level}",
                ] : null,
                $latestValidation?->validated_at ? [
                    'event' => $latestValidation->decision === 'approved' ? 'Validasi: Disetujui (Approved)' : 'Validasi: Dioverride (Overridden)',
                    'timestamp' => (string) $latestValidation->validated_at,
                    'actor' => $teacher->name ?? 'Ustadz',
                    'description' => $latestValidation->decision === 'approved'
                        ? "Menyetujui level: {$latestValidation->final_moral_level}"
                        : "Mengubah level ke: {$latestValidation->final_moral_level}. Alasan: {$latestValidation->override_reason}",
                ] : null,
            ]),
        ];
    }
}

<?php

namespace App\Http\Resources\Teacher;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $latestValidation = $this->teacherValidations->first();
        $aiAssessment = $this->aiAssessments->first();
        $transcription = $this->transcriptions->first();
        $audioFile = $this->audioFiles->first();
        $student = $this->testAttempt?->student;
        $group = $student?->currentGroup;
        $testPackage = $this->testAttempt?->testPackage;
        $moralCase = $this->moralCase;

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
                'gender' => $student?->gender,
            ],
            'group' => [
                'id' => $group?->id,
                'name' => $group?->name,
            ],
            'test_package' => [
                'id' => $testPackage?->id,
                'title' => $testPackage?->title,
                'description' => $testPackage?->description,
            ],
            'moral_case' => [
                'id' => $moralCase?->id,
                'title' => $moralCase?->title,
                'story' => $moralCase?->story,
                'options' => $moralCase?->options->map(fn ($opt) => [
                    'id' => $opt->id,
                    'label' => $opt->label,
                    'text' => $opt->text,
                    'internal_value' => $opt->internal_value,
                ]),
            ],
            'selected_option' => $this->selectedOption ? [
                'id' => $this->selectedOption->id,
                'label' => $this->selectedOption->label,
                'text' => $this->selectedOption->text,
                'internal_value' => $this->selectedOption->internal_value,
            ] : null,
            'typed_reason' => $this->typed_reason,
            'final_transcript' => $this->final_transcript,
            'audio' => $audioFile ? [
                'id' => $audioFile->id,
                'file_path' => $audioFile->file_path,
                'original_name' => $audioFile->original_name,
                'duration_seconds' => $audioFile->duration_seconds,
                'url' => asset('storage/' . $audioFile->file_path),
            ] : null,
            'transcription' => $transcription ? [
                'id' => $transcription->id,
                'provider' => $transcription->provider,
                'model' => $transcription->model,
                'original_text' => $transcription->original_text,
                'edited_text' => $transcription->edited_text,
                'confidence' => $transcription->confidence,
                'status' => $transcription->status,
                'processed_at' => $transcription->processed_at?->toIso8601String(),
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
                'processed_at' => $aiAssessment->processed_at?->toIso8601String(),
            ] : null,
            'validation' => [
                'status' => $validationStatus,
                'id' => $latestValidation?->id,
                'decision' => $latestValidation?->decision,
                'final_moral_level' => $latestValidation?->final_moral_level,
                'final_indicators' => $latestValidation?->final_indicators_json ?? [],
                'teacher_note' => $latestValidation?->teacher_note,
                'override_reason' => $latestValidation?->override_reason,
                'teacher_name' => $latestValidation?->teacher?->name,
                'validated_at' => $latestValidation?->validated_at?->toIso8601String(),
            ],
            'audit_trail' => array_filter([
                $this->submitted_at ? [
                    'event' => 'Jawaban Santri Dikirim',
                    'timestamp' => $this->submitted_at->toIso8601String(),
                    'actor' => $this->testAttempt?->student?->name ?? 'Santri',
                    'description' => 'Jawaban pilihan ganda dan rekaman audio berhasil diunggah.',
                ] : null,
                $transcription?->processed_at ? [
                    'event' => 'Transkripsi STT Selesai',
                    'timestamp' => $transcription->processed_at->toIso8601String(),
                    'actor' => "AI STT ({$transcription->provider})",
                    'description' => "Transkripsi audio berhasil dibuat dengan keyakinan " . number_format(($transcription->confidence ?? 0) * 100, 1) . "%",
                ] : null,
                $transcription?->edited_text ? [
                    'event' => 'Revisi Transkripsi Suara',
                    'timestamp' => $transcription->updated_at->toIso8601String(),
                    'actor' => 'Ustadz',
                    'description' => 'Teks transkripsi suara berhasil diperbaiki oleh Ustadz.',
                ] : null,
                $aiAssessment?->processed_at ? [
                    'event' => 'Penilaian AI Assessment',
                    'timestamp' => $aiAssessment->processed_at->toIso8601String(),
                    'actor' => "LLM ({$aiAssessment->provider} {$aiAssessment->model})",
                    'description' => "Rekomendasi tingkat moral: {$aiAssessment->moral_level}",
                ] : null,
                $latestValidation?->validated_at ? [
                    'event' => $latestValidation->decision === 'approved' ? 'Validasi: Disetujui (Approved)' : 'Validasi: Dioverride (Overridden)',
                    'timestamp' => $latestValidation->validated_at->toIso8601String(),
                    'actor' => $latestValidation->teacher?->name ?? 'Ustadz',
                    'description' => $latestValidation->decision === 'approved'
                        ? "Menyetujui level: {$latestValidation->final_moral_level}"
                        : "Mengubah level ke: {$latestValidation->final_moral_level}. Alasan: {$latestValidation->override_reason}",
                ] : null,
            ]),
        ];
    }
}

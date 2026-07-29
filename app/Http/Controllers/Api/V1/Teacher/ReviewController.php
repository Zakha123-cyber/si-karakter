<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\Teacher\ReviewDetailResource;
use App\Http\Resources\Teacher\ReviewQueueResource;
use App\Models\TestAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = TestAnswer::query()
            ->with([
                'testAttempt.student.user',
                'testAttempt.student.currentGroup',
                'testAttempt.testPackage',
                'moralCase',
                'audioFiles',
                'transcriptions' => fn ($q) => $q->latest(),
                'aiAssessments' => fn ($q) => $q->latest(),
                'teacherValidations' => fn ($q) => $q->latest(),
            ])
            ->whereHas('testAttempt', function ($attemptQuery) use ($user) {
                $attemptQuery->where('status', 'submitted');
                if ($user->role->value === 'teacher') {
                    $attemptQuery->whereHas('student.currentGroup', function ($groupQuery) use ($user) {
                        $groupQuery->where('teacher_id', $user->id);
                    });
                }
            });

        if ($search = $request->string('search')->toString()) {
            $query->whereHas('testAttempt.student.user', function ($uQuery) use ($search) {
                $uQuery->where('name', 'like', "%{$search}%");
            });
        }

        if ($groupId = $request->integer('group_id')) {
            $query->whereHas('testAttempt.student', function ($sQuery) use ($groupId) {
                $sQuery->where('current_group_id', $groupId);
            });
        }

        if ($packageId = $request->integer('test_package_id')) {
            $query->whereHas('testAttempt', function ($tQuery) use ($packageId) {
                $tQuery->where('test_package_id', $packageId);
            });
        }

        $status = $request->string('status')->toString() ?: 'pending';
        if ($status === 'pending') {
            $query->doesntHave('teacherValidations');
        } elseif ($status === 'approved') {
            $query->whereHas('teacherValidations', fn ($v) => $v->where('decision', 'approved'));
        } elseif ($status === 'overridden') {
            $query->whereHas('teacherValidations', fn ($v) => $v->where('decision', 'overridden'));
        }

        $reviews = $query->latest()->paginate($request->integer('per_page', 15));

        return $this->success('Review queue retrieved', ReviewQueueResource::collection($reviews));
    }

    public function show(Request $request, TestAnswer $answer): JsonResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                return $this->error('Unauthorized to view review for this student', 403);
            }
        }

        $answer->load([
            'testAttempt.student.user',
            'testAttempt.student.currentGroup',
            'testAttempt.testPackage',
            'moralCase.options',
            'selectedOption',
            'audioFiles',
            'transcriptions' => fn ($q) => $q->latest(),
            'aiAssessments' => fn ($q) => $q->latest(),
            'teacherValidations' => fn ($q) => $q->latest(),
        ]);

        return $this->success('Review detail retrieved', [
            'review' => new ReviewDetailResource($answer),
        ]);
    }

    public function audio(Request $request, TestAnswer $answer)
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                return $this->error('Unauthorized to access audio for this student', 403);
            }
        }

        $audioFile = $answer->audioFiles()->first();
        if (! $audioFile) {
            return $this->error('Audio file not found', 404);
        }

        $filePath = storage_path('app/' . $audioFile->file_path);
        if (! file_exists($filePath)) {
            $filePath = storage_path('app/public/' . $audioFile->file_path);
        }

        if (! file_exists($filePath)) {
            return $this->error('Audio file storage path does not exist on disk', 404);
        }

        return response()->file($filePath, [
            'Content-Type' => $audioFile->mime_type ?: 'audio/mpeg',
            'Content-Disposition' => 'inline; filename="' . $audioFile->original_name . '"',
        ]);
    }

    public function updateTranscript(\App\Http\Requests\Teacher\Reviews\UpdateTranscriptRequest $request, TestAnswer $answer): JsonResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                return $this->error('Unauthorized to edit transcript for this student', 403);
            }
        }

        $editedText = $request->validated('edited_text');

        $transcription = $answer->transcriptions()->latest()->first();
        if ($transcription) {
            $transcription->update([
                'edited_text' => $editedText,
            ]);
        } else {
            $transcription = $answer->transcriptions()->create([
                'provider' => 'manual',
                'model' => 'teacher-input',
                'original_text' => $answer->final_transcript ?: $editedText,
                'edited_text' => $editedText,
                'confidence' => 1.0,
                'status' => 'completed',
                'processed_at' => now(),
            ]);
        }

        $answer->update([
            'final_transcript' => $editedText,
        ]);

        return $this->success('Transcript updated successfully', [
            'transcription' => $transcription ? $transcription->refresh() : null,
            'final_transcript' => $editedText,
        ]);
    }

    public function approve(\App\Http\Requests\Teacher\Reviews\ApproveValidationRequest $request, TestAnswer $answer): JsonResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                return $this->error('Unauthorized to validate review for this student', 403);
            }
        }

        $aiAssessment = $answer->aiAssessments()->latest()->first();
        $moralLevel = $aiAssessment?->moral_level ?? $answer->selectedOption?->indicative_level ?? 'Belum Ditentukan';
        $indicators = $aiAssessment?->indicators_json ?? [];

        $validation = \App\Models\TeacherValidation::query()->updateOrCreate(
            ['test_answer_id' => $answer->id],
            [
                'ai_assessment_id' => $aiAssessment?->id,
                'teacher_id' => $user->id,
                'decision' => 'approved',
                'final_moral_level' => $moralLevel,
                'final_indicators_json' => $indicators,
                'teacher_note' => $request->validated('teacher_note'),
                'override_reason' => null,
                'validated_at' => now(),
            ]
        );

        return $this->success('AI Assessment approved successfully', [
            'validation' => $validation->refresh(),
        ]);
    }

    public function override(\App\Http\Requests\Teacher\Reviews\OverrideValidationRequest $request, TestAnswer $answer): JsonResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                return $this->error('Unauthorized to validate review for this student', 403);
            }
        }

        $aiAssessment = $answer->aiAssessments()->latest()->first();
        $indicators = $request->validated('final_indicators') ?? $aiAssessment?->indicators_json ?? [];

        $validation = \App\Models\TeacherValidation::query()->updateOrCreate(
            ['test_answer_id' => $answer->id],
            [
                'ai_assessment_id' => $aiAssessment?->id,
                'teacher_id' => $user->id,
                'decision' => 'overridden',
                'final_moral_level' => $request->validated('final_moral_level'),
                'final_indicators_json' => $indicators,
                'teacher_note' => $request->validated('teacher_note'),
                'override_reason' => $request->validated('override_reason'),
                'validated_at' => now(),
            ]
        );

        return $this->success('AI Assessment overridden successfully', [
            'validation' => $validation->refresh(),
        ]);
    }
}

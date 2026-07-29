<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Resources\Teacher\ReviewDetailResource;
use App\Http\Resources\Teacher\ReviewQueueResource;
use App\Models\Group;
use App\Models\TestAnswer;
use App\Models\TestPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
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

        $reviews = $query->latest()->paginate($request->integer('per_page', 10))->withQueryString();

        $groups = Group::query()
            ->when($user->role->value === 'teacher', fn ($q) => $q->where('teacher_id', $user->id))
            ->select('id', 'name')
            ->get();

        $testPackages = TestPackage::query()->select('id', 'title')->get();

        return Inertia::render('teacher/reviews/index', [
            'reviews' => ReviewQueueResource::collection($reviews),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $status,
                'group_id' => $request->integer('group_id') ?: null,
                'test_package_id' => $request->integer('test_package_id') ?: null,
            ],
            'groups' => $groups,
            'testPackages' => $testPackages,
        ]);
    }

    public function show(Request $request, TestAnswer $answer): Response
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to view review for this student.');
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

        return Inertia::render('teacher/reviews/show', [
            'review' => (new ReviewDetailResource($answer))->resolve(),
        ]);
    }

    public function audio(Request $request, TestAnswer $answer)
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to access audio for this student.');
            }
        }

        $audioFile = $answer->audioFiles()->first();
        if (! $audioFile) {
            abort(404, 'Audio file not found.');
        }

        $filePath = storage_path('app/' . $audioFile->file_path);
        if (! file_exists($filePath)) {
            $filePath = storage_path('app/public/' . $audioFile->file_path);
        }

        if (! file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'Audio file storage path does not exist on disk',
                'file_path' => $audioFile->file_path,
            ], 404);
        }

        return response()->file($filePath, [
            'Content-Type' => $audioFile->mime_type ?: 'audio/mpeg',
            'Content-Disposition' => 'inline; filename="' . $audioFile->original_name . '"',
        ]);
    }

    public function updateTranscript(\App\Http\Requests\Teacher\Reviews\UpdateTranscriptRequest $request, TestAnswer $answer)
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to edit transcript for this student.');
            }
        }

        $editedText = $request->validated('edited_text');

        $transcription = $answer->transcriptions()->latest()->first();
        if ($transcription) {
            $transcription->update([
                'edited_text' => $editedText,
            ]);
        } else {
            $answer->transcriptions()->create([
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

        return back()->with('success', 'Transkripsi berhasil diperbarui.');
    }

    public function approve(\App\Http\Requests\Teacher\Reviews\ApproveValidationRequest $request, TestAnswer $answer)
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to validate review for this student.');
            }
        }

        $aiAssessment = $answer->aiAssessments()->latest()->first();
        $moralLevel = $aiAssessment?->moral_level ?? $answer->selectedOption?->indicative_level ?? 'Belum Ditentukan';
        $indicators = $aiAssessment?->indicators_json ?? [];

        \App\Models\TeacherValidation::query()->updateOrCreate(
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

        return back()->with('success', 'Rekomendasi AI berhasil disetujui.');
    }

    public function override(\App\Http\Requests\Teacher\Reviews\OverrideValidationRequest $request, TestAnswer $answer)
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            $studentGroupTeacherId = $answer->testAttempt?->student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to validate review for this student.');
            }
        }

        $aiAssessment = $answer->aiAssessments()->latest()->first();
        $indicators = $request->validated('final_indicators') ?? $aiAssessment?->indicators_json ?? [];

        \App\Models\TeacherValidation::query()->updateOrCreate(
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

        return back()->with('success', 'Penilaian berhasil dioverride dengan catatan perbaikan.');
    }
}

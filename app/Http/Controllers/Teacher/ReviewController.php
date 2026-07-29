<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Reviews\ApproveValidationRequest;
use App\Http\Requests\Teacher\Reviews\OverrideValidationRequest;
use App\Http\Requests\Teacher\Reviews\UpdateTranscriptRequest;
use App\Http\Resources\Teacher\ReviewDetailResource;
use App\Http\Resources\Teacher\ReviewQueueResource;
use App\Jobs\TranscribeAnswerJob;
use App\Models\AiAssessment;
use App\Models\AnswerAudioFile;
use App\Models\Group;
use App\Models\MoralCaseOption;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\Transcription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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
            /** @var TestAttempt|null $attempt */
            $attempt = $answer->testAttempt;
            /** @var Student|null $student */
            $student = $attempt?->student;
            $studentGroupTeacherId = $student?->currentGroup?->teacher_id;
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

    public function audio(Request $request, TestAnswer $answer): BinaryFileResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            /** @var TestAttempt|null $attempt */
            $attempt = $answer->testAttempt;
            /** @var Student|null $student */
            $student = $attempt?->student;
            $studentGroupTeacherId = $student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to access audio for this student.');
            }
        }

        /** @var AnswerAudioFile|null $audioFile */
        $audioFile = $answer->audioFiles()->first();
        if (! $audioFile) {
            abort(404, 'Audio file not found.');
        }

        $filePath = storage_path('app/'.$audioFile->file_path);
        if (! file_exists($filePath)) {
            $filePath = storage_path('app/public/'.$audioFile->file_path);
        }

        if (! file_exists($filePath)) {
            abort(404, 'Audio physical file does not exist.');
        }

        return response()->file($filePath, [
            'Content-Type' => $audioFile->mime_type ?: 'audio/mpeg',
            'Content-Disposition' => 'inline; filename="'.$audioFile->original_name.'"',
        ]);
    }

    public function updateTranscript(UpdateTranscriptRequest $request, TestAnswer $answer): RedirectResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            /** @var TestAttempt|null $attempt */
            $attempt = $answer->testAttempt;
            /** @var Student|null $student */
            $student = $attempt?->student;
            $studentGroupTeacherId = $student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to edit transcript for this student.');
            }
        }

        $editedText = $request->validated('edited_text');

        /** @var Transcription|null $transcription */
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

    public function approve(ApproveValidationRequest $request, TestAnswer $answer): RedirectResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            /** @var TestAttempt|null $attempt */
            $attempt = $answer->testAttempt;
            /** @var Student|null $student */
            $student = $attempt?->student;
            $studentGroupTeacherId = $student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to validate review for this student.');
            }
        }

        /** @var AiAssessment|null $aiAssessment */
        $aiAssessment = $answer->aiAssessments()->latest()->first();
        /** @var MoralCaseOption|null $selectedOption */
        $selectedOption = $answer->selectedOption;
        $moralLevel = $aiAssessment ? $aiAssessment->moral_level : ($selectedOption ? $selectedOption->internal_value : 'Belum Ditentukan');
        $indicators = $aiAssessment ? $aiAssessment->indicators_json : [];

        TeacherValidation::query()->updateOrCreate(
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

    public function override(OverrideValidationRequest $request, TestAnswer $answer): RedirectResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            /** @var TestAttempt|null $attempt */
            $attempt = $answer->testAttempt;
            /** @var Student|null $student */
            $student = $attempt?->student;
            $studentGroupTeacherId = $student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to validate review for this student.');
            }
        }

        /** @var AiAssessment|null $aiAssessment */
        $aiAssessment = $answer->aiAssessments()->latest()->first();
        $indicators = $request->validated('final_indicators') ?: ($aiAssessment ? $aiAssessment->indicators_json : []);

        TeacherValidation::query()->updateOrCreate(
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

    public function retryTranscription(Request $request, TestAnswer $answer): RedirectResponse
    {
        $user = $request->user();

        if ($user->role->value === 'teacher') {
            /** @var TestAttempt|null $attempt */
            $attempt = $answer->testAttempt;
            /** @var Student|null $student */
            $student = $attempt?->student;
            $studentGroupTeacherId = $student?->currentGroup?->teacher_id;
            if ($studentGroupTeacherId !== $user->id) {
                abort(403, 'Unauthorized to retry transcription for this student.');
            }
        }

        /** @var AnswerAudioFile|null $audioFile */
        $audioFile = $answer->audioFiles()->first();
        if (! $audioFile) {
            return back()->with('error', 'Tidak ada file audio untuk jawaban ini.');
        }

        TranscribeAnswerJob::dispatch($audioFile->id);

        return back()->with('success', 'Job transkripsi ulang berhasil diantrekan.');
    }
}

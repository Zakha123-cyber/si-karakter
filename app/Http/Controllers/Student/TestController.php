<?php

namespace App\Http\Controllers\Student;

use App\Enums\TestPackageStatus;
use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestController extends Controller
{
    public function index(Request $request): Response
    {
        $student = $this->studentForUser($request->user());

        $packages = TestPackage::query()
            ->where('status', TestPackageStatus::Published)
            ->whereHas('groups', fn ($query) => $query->where('groups.id', $student?->current_group_id))
            ->withCount('cases')
            ->get()
            ->filter(fn (TestPackage $package) => $this->isVisibleToStudent($student, $package))
            ->map(fn (TestPackage $package) => $this->packagePayload($package, $student))
            ->values();

        return Inertia::render('student/tests/index', [
            'packages' => $packages,
        ]);
    }

    public function startAttempt(Request $request, TestPackage $testPackage): RedirectResponse
    {
        $student = $this->studentForUser($request->user());

        if ($student === null || ! $this->isVisibleToStudent($student, $testPackage)) {
            abort(403);
        }

        $attemptCount = TestAttempt::query()
            ->where('test_package_id', $testPackage->id)
            ->where('student_id', $student->id)
            ->count();

        if ($attemptCount >= max(1, $testPackage->attempt_limit)) {
            return back()->withErrors([
                'attempt' => 'Batas percobaan paket sudah terpenuhi.',
            ]);
        }

        $attempt = TestAttempt::query()->create([
            'test_package_id' => $testPackage->id,
            'student_id' => $student->id,
            'attempt_number' => $attemptCount + 1,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return redirect()->route('student.tests.attempts.show', [
            'testPackage' => $testPackage,
            'testAttempt' => $attempt,
        ])->with('status', 'Percobaan tes dimulai.');
    }

    public function showAttempt(Request $request, TestPackage $testPackage, TestAttempt $testAttempt): Response
    {
        $student = $this->studentForUser($request->user());

        if ($student === null || ! $this->canAccessAttempt($student, $testPackage, $testAttempt)) {
            abort(403);
        }

        $testPackage->load(['cases' => function ($query) {
            $query->orderBy('test_package_cases.sort_order')
                ->with(['options' => function ($optionQuery) {
                    $optionQuery->where('is_active', true)->orderBy('sort_order');
                }]);
        }]);

        $cases = $testPackage->cases->map(fn ($case) => [
            'id' => $case->id,
            'title' => $case->title,
            'story' => $case->story,
            'options' => $case->options->map(fn ($option) => [
                'id' => $option->id,
                'label' => $option->label,
                'text' => $option->text,
            ])->values(),
        ])->values();

        $caseIndex = max(0, min((int) $request->query('case', 0), max(0, $cases->count() - 1)));
        $currentCase = $cases->get($caseIndex);
        $answers = TestAnswer::query()
            ->where('test_attempt_id', $testAttempt->id)
            ->get()
            ->mapWithKeys(fn (TestAnswer $answer) => [
                (string) $answer->moral_case_id => [
                    'selected_option_id' => $answer->selected_option_id,
                    'typed_reason' => $answer->typed_reason,
                ],
            ])
            ->all();

        return Inertia::render('student/tests/work', [
            'package' => [
                'id' => $testPackage->id,
                'title' => $testPackage->title,
                'description' => $testPackage->description,
            ],
            'attempt' => [
                'id' => $testAttempt->id,
                'status' => $testAttempt->status,
                'attempt_number' => $testAttempt->attempt_number,
            ],
            'current_case' => $currentCase,
            'case_index' => $caseIndex,
            'total_cases' => $cases->count(),
            'answers' => $answers,
        ]);
    }

    public function storeAnswer(Request $request, TestPackage $testPackage, TestAttempt $testAttempt): RedirectResponse
    {
        $student = $this->studentForUser($request->user());

        if ($student === null || ! $this->canAccessAttempt($student, $testPackage, $testAttempt)) {
            abort(403);
        }

        // Prevent updating answers if the attempt has already been submitted.
        if ($testAttempt->status === 'submitted') {
            return back()->withErrors([
                'attempt' => 'Percobaan sudah dikirim dan tidak dapat diubah.',
            ]);
        }

        if ($testAttempt->status === 'submitted') {
            return back()->withErrors([
                'attempt' => 'Percobaan sudah dikirim dan tidak dapat diubah.',
            ]);
        }

        $data = $request->validate([
            'moral_case_id' => ['required', 'exists:moral_cases,id'],
            'selected_option_id' => ['nullable', 'exists:moral_case_options,id'],
            'typed_reason' => ['nullable', 'string'],
            'final_transcript' => ['nullable', 'string'],
            'audio' => ['nullable', 'file', 'mimes:mp3,wav,m4a,ogg', 'max:20480'],
        ]);

        $caseBelongsToPackage = $testPackage->cases()->whereKey($data['moral_case_id'])->exists();
        if (! $caseBelongsToPackage) {
            return back()->withErrors([
                'moral_case_id' => 'Kasus ini tidak tersedia untuk paket ini.',
            ]);
        }

        $answer = TestAnswer::query()->updateOrCreate(
            [
                'test_attempt_id' => $testAttempt->id,
                'moral_case_id' => $data['moral_case_id'],
            ],
            [
                'selected_option_id' => $data['selected_option_id'] ?? null,
                'typed_reason' => $data['typed_reason'] ?? null,
                'final_transcript' => $data['final_transcript'] ?? null,
                'answer_status' => 'draft',
            ],
        );

        if ($request->hasFile('audio')) {
            $audioFile = $request->file('audio');
            $path = $audioFile->store('student-audio', 'local');

            $answer->audioFiles()->create([
                'file_path' => $path,
                'original_name' => $audioFile->getClientOriginalName(),
                'mime_type' => $audioFile->getClientMimeType(),
                'file_size' => $audioFile->getSize(),
                'duration_seconds' => null,
                'checksum' => md5_file($audioFile->getRealPath()),
            ]);
        }

        return back()->with('status', 'Jawaban tersimpan.');
    }

    public function submitAttempt(Request $request, TestPackage $testPackage, TestAttempt $testAttempt): RedirectResponse
    {
        $student = $this->studentForUser($request->user());

        if ($student === null || ! $this->canAccessAttempt($student, $testPackage, $testAttempt)) {
            abort(403);
        }

        TestAnswer::query()
            ->where('test_attempt_id', $testAttempt->id)
            ->update(['answer_status' => 'submitted']);

        $testAttempt->forceFill([
            'status' => 'submitted',
            'submitted_at' => now(),
            'completed_at' => now(),
        ])->save();

        return redirect()->route('student.tests.index')->with('status', 'Jawaban berhasil dikirim.');
    }

    private function studentForUser(?User $user): ?Student
    {
        if ($user === null) {
            return null;
        }

        return Student::query()->where('user_id', $user->id)->first();
    }

    private function isVisibleToStudent(?Student $student, TestPackage $package): bool
    {
        if ($student === null || $student->current_group_id === null) {
            return false;
        }

        if (! $package->groups()->where('groups.id', $student->current_group_id)->exists()) {
            return false;
        }

        $startAt = $package->start_at;
        $endAt = $package->end_at;

        if ($startAt !== null && $startAt->isFuture()) {
            return false;
        }

        if ($endAt !== null && $endAt->isPast()) {
            return false;
        }

        return true;
    }

    private function canAccessAttempt(Student $student, TestPackage $testPackage, TestAttempt $testAttempt): bool
    {
        return $this->isVisibleToStudent($student, $testPackage)
            && $testAttempt->test_package_id === $testPackage->id
            && $testAttempt->student_id === $student->id;
    }

    private function packagePayload(TestPackage $package, ?Student $student): array
    {
        $activeAttempt = TestAttempt::query()
            ->where('test_package_id', $package->id)
            ->where('student_id', $student?->id)
            ->whereIn('status', ['in_progress', 'submitted'])
            ->latest('id')
            ->first();

        $attemptsUsed = TestAttempt::query()
            ->where('test_package_id', $package->id)
            ->where('student_id', $student?->id)
            ->count();

        $hasInProgress = $activeAttempt !== null && $activeAttempt->status === 'in_progress';
        $hasReachedLimit = $attemptsUsed >= max(1, $package->attempt_limit);

        return [
            'id' => $package->id,
            'title' => $package->title,
            'description' => $package->description,
            'attempt_limit' => $package->attempt_limit,
            'attempts_used' => $attemptsUsed,
            'cases_count' => $package->cases_count,
            'active_attempt' => $activeAttempt === null ? null : [
                'id' => $activeAttempt->id,
                'status' => $activeAttempt->status,
                'attempt_number' => $activeAttempt->attempt_number,
            ],
            'can_resume' => $hasInProgress,
            'can_start' => ! $hasInProgress && ! $hasReachedLimit,
        ];
    }
}

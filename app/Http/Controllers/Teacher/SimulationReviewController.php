<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\SimulationReviews\ReviewSimulationAttemptRequest;
use App\Http\Resources\Teacher\SimulationReviewDetailResource;
use App\Http\Resources\Teacher\SimulationReviewQueueResource;
use App\Models\Group;
use App\Models\SimulationAttempt;
use App\Models\SimulationAttemptReview;
use App\Models\SimulationScenario;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SimulationReviewController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $query = SimulationAttempt::query()
            ->with([
                'student.user:id,name,username',
                'student.currentGroup:id,name,teacher_id',
                'scenario.options:id,simulation_scenario_id,score',
                'selectedOption:id,text',
                'review.teacher:id,name',
            ])
            ->when($user->role->value === 'teacher', function ($attemptQuery) use ($user) {
                $attemptQuery->whereHas('student.currentGroup', function ($groupQuery) use ($user) {
                    $groupQuery->where('teacher_id', $user->id);
                });
            });

        if ($search = $request->string('search')->toString()) {
            $query->whereHas('student.user', function ($userQuery) use ($search) {
                $userQuery->where('name', 'like', "%{$search}%");
            });
        }

        if ($scenarioId = $request->integer('scenario_id')) {
            $query->where('simulation_scenario_id', $scenarioId);
        }

        if ($groupId = $request->integer('group_id')) {
            $query->whereHas('student', function ($studentQuery) use ($groupId) {
                $studentQuery->where('current_group_id', $groupId);
            });
        }

        $status = $request->string('status')->toString() ?: 'all';
        if ($status === 'pending') {
            $query->doesntHave('review');
        } elseif ($status === 'reviewed') {
            $query->whereHas('review');
        }

        $attempts = $query
            ->latest('completed_at')
            ->latest('id')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        $scenarios = SimulationScenario::query()
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        $groups = Group::query()
            ->when($user->role->value === 'teacher', fn ($groupQuery) => $groupQuery->where('teacher_id', $user->id))
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('teacher/simulation-reviews/index', [
            'attempts' => SimulationReviewQueueResource::collection($attempts),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $status,
                'scenario_id' => $request->integer('scenario_id') ?: null,
                'group_id' => $request->integer('group_id') ?: null,
            ],
            'scenarios' => $scenarios,
            'groups' => $groups,
        ]);
    }

    public function show(Request $request, SimulationAttempt $attempt): Response
    {
        /** @var User $user */
        $user = $request->user();

        $this->ensureCanAccess($user, $attempt);

        $attempt->load([
            'student.user:id,name,username',
            'student.currentGroup:id,name,teacher_id',
            'scenario.options',
            'selectedOption',
            'review.teacher:id,name',
        ]);

        return Inertia::render('teacher/simulation-reviews/show', [
            'attempt' => (new SimulationReviewDetailResource($attempt))->resolve(),
        ]);
    }

    public function review(ReviewSimulationAttemptRequest $request, SimulationAttempt $attempt): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->ensureCanAccess($user, $attempt);

        SimulationAttemptReview::query()->updateOrCreate(
            ['simulation_attempt_id' => $attempt->id],
            [
                'teacher_id' => $user->id,
                'teacher_note' => $request->validated('teacher_note'),
                'reviewed_at' => now(),
            ],
        );

        return back()->with('success', 'Hasil simulasi berhasil ditandai sudah direview.');
    }

    public function unreview(Request $request, SimulationAttempt $attempt): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->ensureCanAccess($user, $attempt);

        $attempt->review()->delete();

        return back()->with('success', 'Tanda review berhasil dibatalkan.');
    }

    private function ensureCanAccess(User $user, SimulationAttempt $attempt): void
    {
        if ($user->role->value !== 'teacher') {
            return;
        }

        $teacherId = $attempt->student->currentGroup?->teacher_id;

        if ($teacherId !== $user->id) {
            abort(403, 'Unauthorized to review this simulation attempt.');
        }
    }
}

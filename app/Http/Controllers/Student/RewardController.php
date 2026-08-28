<?php

namespace App\Http\Controllers\Student;

use App\Domain\GoodnessTree\BadgeService;
use App\Domain\GoodnessTree\GoodnessTreeService;
use App\Domain\GoodnessTree\StudentStatsService;
use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RewardController extends Controller
{
    public function __construct(
        private readonly BadgeService $badgeService,
        private readonly GoodnessTreeService $treeService,
        private readonly StudentStatsService $statsService,
    ) {}

    public function __invoke(Request $request): Response
    {
        $student = Student::query()
            ->with('currentGroup:id,name')
            ->where('user_id', $request->user()->id)
            ->first();

        $points = $this->statsService->positivePointsFor($student);
        $treeProgress = $this->treeService->progressForPoints($points);
        $badges = $this->badgeService->badgesFor($student);

        return Inertia::render('student/rewards', [
            'student' => [
                'name' => $request->user()->name,
                'group' => $student?->currentGroup?->name,
                'points' => $points,
                'tree_level' => $treeProgress->currentLevel?->name,
            ],
            'badges' => $badges,
        ]);
    }
}

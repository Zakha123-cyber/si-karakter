<?php

namespace App\Http\Controllers\Student;

use App\Domain\GoodnessTree\DailyMissionService;
use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    public function __construct(
        private readonly DailyMissionService $missionService,
    ) {}

    public function __invoke(Request $request): Response
    {
        $student = Student::query()
            ->with('currentGroup:id,name')
            ->where('user_id', $request->user()->id)
            ->first();

        return Inertia::render('student/missions', [
            'student' => [
                'name' => $request->user()->name,
                'group' => $student?->currentGroup?->name,
            ],
            'missions' => $this->missionService->missionsFor($student),
        ]);
    }
}

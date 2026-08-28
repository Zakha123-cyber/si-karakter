<?php

namespace App\Domain\GoodnessTree;

use App\Models\ContentInteraction;
use App\Models\GoodnessPointTransaction;
use App\Models\SimulationAttempt;
use App\Models\Student;
use App\Models\TestAttempt;
use Illuminate\Support\Carbon;

class StudentStatsService
{
    public function streakFor(?Student $student): int
    {
        if ($student === null) {
            return 0;
        }

        $days = GoodnessPointTransaction::query()
            ->where('student_id', $student->id)
            ->where('points', '>', 0)
            ->distinct()
            ->pluck('created_at');

        if ($days->isEmpty()) {
            return 0;
        }

        $today = now()->startOfDay();
        $validDays = $days
            ->map(fn ($date) => Carbon::parse($date)->startOfDay()->format('Y-m-d'))
            ->unique()
            ->values();

        $cursor = $validDays->contains($today->format('Y-m-d'))
            ? $today->copy()
            : $today->copy()->subDay();

        $streak = 0;
        while ($validDays->contains($cursor->format('Y-m-d'))) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    public function starCountFor(?Student $student): int
    {
        if ($student === null) {
            return 0;
        }

        return (int) TestAttempt::query()
            ->where('student_id', $student->id)
            ->where('status', 'submitted')
            ->count();
    }

    public function completedContentsCount(?Student $student): int
    {
        if ($student === null) {
            return 0;
        }

        return (int) ContentInteraction::query()
            ->where('student_id', $student->id)
            ->whereNotNull('completed_at')
            ->distinct('educational_content_id')
            ->count('educational_content_id');
    }

    public function submittedTestsCount(?Student $student): int
    {
        if ($student === null) {
            return 0;
        }

        return (int) TestAttempt::query()
            ->where('student_id', $student->id)
            ->where('status', 'submitted')
            ->count();
    }

    public function simulationAttemptsCount(?Student $student): int
    {
        if ($student === null) {
            return 0;
        }

        return (int) SimulationAttempt::query()
            ->where('student_id', $student->id)
            ->count();
    }

    public function positivePointsFor(?Student $student): int
    {
        if ($student === null) {
            return 0;
        }

        return (int) GoodnessPointTransaction::query()
            ->where('student_id', $student->id)
            ->where('points', '>', 0)
            ->sum('points');
    }
}

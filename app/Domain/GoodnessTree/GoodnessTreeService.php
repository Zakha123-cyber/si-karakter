<?php

namespace App\Domain\GoodnessTree;

use App\Models\GoodnessPointTransaction;
use App\Models\GoodnessTreeLevel;
use App\Models\Student;

class GoodnessTreeService
{
    public function progressForStudent(Student $student): GoodnessTreeProgress
    {
        return $this->progressForPoints($this->positivePointsForStudent($student));
    }

    public function progressForPoints(int $points): GoodnessTreeProgress
    {
        $points = max(0, $points);

        /** @var array<int, GoodnessTreeLevel> $levels */
        $levels = GoodnessTreeLevel::query()
            ->orderBy('minimum_points')
            ->orderBy('level')
            ->get()
            ->all();

        $currentLevel = null;
        $nextLevel = null;

        foreach ($levels as $level) {
            if ($points >= $level->minimum_points) {
                $currentLevel = $level;

                continue;
            }

            $nextLevel = $level;
            break;
        }

        if ($currentLevel === null && $levels !== []) {
            $nextLevel = $levels[0];
        }

        $progressPercent = $this->progressPercent($points, $currentLevel, $nextLevel);
        $pointsToNextLevel = $nextLevel === null
            ? 0
            : max(0, $nextLevel->minimum_points - $points);

        return new GoodnessTreeProgress(
            points: $points,
            currentLevel: $currentLevel,
            nextLevel: $nextLevel,
            progressPercent: $progressPercent,
            pointsToNextLevel: $pointsToNextLevel,
            levels: $levels,
        );
    }

    public function positivePointsForStudent(Student $student): int
    {
        return (int) GoodnessPointTransaction::query()
            ->where('student_id', $student->id)
            ->where('points', '>', 0)
            ->sum('points');
    }

    private function progressPercent(int $points, ?GoodnessTreeLevel $currentLevel, ?GoodnessTreeLevel $nextLevel): int
    {
        if ($nextLevel === null) {
            return $currentLevel === null ? 0 : 100;
        }

        if ($currentLevel === null) {
            $target = max(1, $nextLevel->minimum_points);

            return (int) round(min(100, ($points / $target) * 100));
        }

        $span = max(1, $nextLevel->minimum_points - $currentLevel->minimum_points);
        $position = max(0, $points - $currentLevel->minimum_points);

        return (int) round(min(100, ($position / $span) * 100));
    }
}

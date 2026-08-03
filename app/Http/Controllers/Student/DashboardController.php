<?php

namespace App\Http\Controllers\Student;

use App\Enums\TestPackageStatus;
use App\Http\Controllers\Controller;
use App\Models\EducationalContent;
use App\Models\GoodnessPointTransaction;
use App\Models\GoodnessTreeLevel;
use App\Models\SimulationScenario;
use App\Models\Student;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $student = Student::query()->where('user_id', $request->user()->id)->first();

        $points = $this->pointsFor($student);
        $treeLevels = GoodnessTreeLevel::query()
            ->orderBy('level')
            ->get(['id', 'level', 'name', 'minimum_points', 'description']);
        $currentLevel = $treeLevels->filter(fn ($level) => $points >= $level->minimum_points)->last();
        $nextLevel = $treeLevels->filter(function ($level) use ($points) {
            return $level->minimum_points !== null && $level->minimum_points > $points;
        })->first();

        $streak = $this->streakFor($student);
        $starCount = $this->starCountFor($student);

        $testPackages = $this->visiblePackages($student);

        $contents = EducationalContent::query()
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get(['id', 'title', 'description', 'thumbnail_path', 'duration_seconds'])
            ->map(fn (EducationalContent $content) => [
                'id' => $content->id,
                'title' => $content->title,
                'description' => $content->description,
                'thumbnail' => $content->thumbnail_path,
                'duration_seconds' => $content->duration_seconds,
            ]);

        $scenarios = SimulationScenario::query()
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get(['id', 'title', 'description', 'opening_text', 'image_path'])
            ->map(fn (SimulationScenario $scenario) => [
                'id' => $scenario->id,
                'title' => $scenario->title,
                'description' => $scenario->description,
                'opening_text' => $scenario->opening_text,
                'image' => $scenario->image_path,
            ]);

        return Inertia::render('student/dashboard', [
            'student' => [
                'name' => $request->user()->name,
                'gender' => $student?->gender,
                'group' => $student?->currentGroup?->name,
                'points' => $points,
                'streak' => $streak,
                'stars' => $starCount,
                'tree_level' => $currentLevel === null ? null : [
                    'level' => $currentLevel->level,
                    'name' => $currentLevel->name,
                    'description' => $currentLevel->description,
                ],
                'tree_progress' => $this->treeProgress($points, $currentLevel, $nextLevel),
                'next_level' => $nextLevel === null ? null : [
                    'level' => $nextLevel->level,
                    'name' => $nextLevel->name,
                    'minimum_points' => $nextLevel->minimum_points,
                ],
            ],
            'test_packages' => $testPackages,
            'contents' => $contents,
            'scenarios' => $scenarios,
            'missions' => $this->missions(),
        ]);
    }

    private function pointsFor(?Student $student): int
    {
        if ($student === null) {
            return 0;
        }

        return (int) GoodnessPointTransaction::query()
            ->where('student_id', $student->id)
            ->sum('points');
    }

    private function streakFor(?Student $student): int
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

        $cursor = clone $validDays->contains($today->format('Y-m-d'))
            ? $today
            : $today->copy()->subDay();

        $streak = 0;
        while ($validDays->contains($cursor->format('Y-m-d'))) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    private function starCountFor(?Student $student): int
    {
        if ($student === null) {
            return 0;
        }

        return (int) TestAttempt::query()
            ->where('student_id', $student->id)
            ->where('status', 'submitted')
            ->count();
    }

    private function treeProgress(int $points, ?object $currentLevel, ?object $nextLevel): int
    {
        if ($currentLevel === null) {
            return 0;
        }

        if ($nextLevel === null) {
            return 100;
        }

        $span = max(1, $nextLevel->minimum_points - $currentLevel->minimum_points);
        $position = max(0, $points - $currentLevel->minimum_points);

        return (int) round(min(100, ($position / $span) * 100));
    }

    private function visiblePackages(?Student $student): array
    {
        if ($student === null || $student->current_group_id === null) {
            return [];
        }

        return TestPackage::query()
            ->where('status', TestPackageStatus::Published)
            ->whereHas('groups', fn ($query) => $query->where('groups.id', $student->current_group_id))
            ->withCount('cases')
            ->get()
            ->filter(fn (TestPackage $package) => $this->isVisibleTo($student, $package))
            ->map(fn (TestPackage $package) => [
                'id' => $package->id,
                'title' => $package->title,
                'description' => $package->description,
                'cases_count' => $package->cases_count,
                'can_start' => ! TestAttempt::query()
                    ->where('test_package_id', $package->id)
                    ->where('student_id', $student->id)
                    ->whereIn('status', ['in_progress', 'submitted'])
                    ->exists(),
            ])
            ->values()
            ->all();
    }

    private function isVisibleTo(Student $student, TestPackage $package): bool
    {
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

    private function missions(): array
    {
        return [
            [
                'id' => 'sholat',
                'icon' => '🕌',
                'title' => 'Kerjakan Misi Baik',
                'description' => 'Selesaikan satu misi baikmu hari ini',
                'reward' => 10,
                'completed' => false,
            ],
            [
                'id' => 'baca',
                'icon' => '📖',
                'title' => 'Tonton Bioskop Teladan',
                'description' => 'Saksikan satu kisah teladan',
                'reward' => 15,
                'completed' => false,
            ],
            [
                'id' => 'tes',
                'icon' => '🧭',
                'title' => 'Selesaikan Pilih Jalanmu',
                'description' => 'Selasaikan satu kasus moral',
                'reward' => 20,
                'completed' => false,
            ],
        ];
    }
}
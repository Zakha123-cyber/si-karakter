<?php

namespace App\Domain\GoodnessTree;

use App\Models\Student;

class BadgeService
{
    public function __construct(
        private readonly StudentStatsService $statsService,
        private readonly GoodnessTreeService $treeService,
        private readonly DailyMissionService $missionService,
    ) {}

    /**
     * @return array<int, array{id: string, emoji: string, title: string, description: string, unlocked: bool, progress_current: int, progress_target: int}>
     */
    public function badgesFor(?Student $student): array
    {
        $points = $this->statsService->positivePointsFor($student);
        $streak = $this->statsService->streakFor($student);
        $stars = $this->statsService->starCountFor($student);
        $contents = $this->statsService->completedContentsCount($student);
        $tests = $this->statsService->submittedTestsCount($student);
        $simulations = $this->statsService->simulationAttemptsCount($student);

        $missions = $this->missionService->missionsFor($student);
        $completedMissions = count(array_filter($missions, fn (array $mission) => $mission['completed']));

        $treeProgress = $this->treeService->progressForPoints($points);
        $treeTarget = $treeProgress->nextLevel?->minimum_points ?? 25;

        return [
            [
                'id' => 'langkah_pertama',
                'emoji' => '🌟',
                'title' => 'Langkah Pertama',
                'description' => 'Dapatkan poin kebaikan pertamamu',
                'unlocked' => $points >= 1,
                'progress_current' => min($points, 1),
                'progress_target' => 1,
            ],
            [
                'id' => 'penonton_teladan',
                'emoji' => '📖',
                'title' => 'Penonton Teladan',
                'description' => 'Selesaikan 3 konten di Bioskop Teladan',
                'unlocked' => $contents >= 3,
                'progress_current' => min($contents, 3),
                'progress_target' => 3,
            ],
            [
                'id' => 'pemecah_kasus',
                'emoji' => '🧭',
                'title' => 'Pemecah Kasus',
                'description' => 'Selesaikan satu kasus di Pilih Jalanmu',
                'unlocked' => $tests >= 1,
                'progress_current' => min($tests, 1),
                'progress_target' => 1,
            ],
            [
                'id' => 'berani_menolak',
                'emoji' => '🛡️',
                'title' => 'Berani Menolak',
                'description' => 'Selesaikan satu Simulasi Berani Menolak',
                'unlocked' => $simulations >= 1,
                'progress_current' => min($simulations, 1),
                'progress_target' => 1,
            ],
            [
                'id' => 'semangat_beruntun',
                'emoji' => '🔥',
                'title' => 'Semangat 3 Hari',
                'description' => 'Kumpulkan poin kebaikan 3 hari berturut-turut',
                'unlocked' => $streak >= 3,
                'progress_current' => min($streak, 3),
                'progress_target' => 3,
            ],
            [
                'id' => 'kolektor_bintang',
                'emoji' => '⭐',
                'title' => 'Kolektor Bintang',
                'description' => 'Kumpulkan 5 bintang dari Pilih Jalanmu',
                'unlocked' => $stars >= 5,
                'progress_current' => min($stars, 5),
                'progress_target' => 5,
            ],
            [
                'id' => 'penjaga_pohon',
                'emoji' => '🌳',
                'title' => 'Penjaga Pohon',
                'description' => 'Tumbuhkan Pohon Kebaikanmu ke level berikutnya',
                'unlocked' => $points >= $treeTarget,
                'progress_current' => min($points, $treeTarget),
                'progress_target' => $treeTarget,
            ],
            [
                'id' => 'master_misi',
                'emoji' => '🏆',
                'title' => 'Master Misi',
                'description' => 'Selesaikan semua misi harian di satu hari',
                'unlocked' => $missions !== [] && $completedMissions === count($missions),
                'progress_current' => $completedMissions,
                'progress_target' => count($missions),
            ],
        ];
    }
}

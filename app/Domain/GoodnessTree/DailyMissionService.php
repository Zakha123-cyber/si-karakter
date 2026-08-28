<?php

namespace App\Domain\GoodnessTree;

use App\Models\ContentInteraction;
use App\Models\SimulationAttempt;
use App\Models\Student;
use App\Models\TestAttempt;

class DailyMissionService
{
    /**
     * @return array<int, array{id: string, icon: string, title: string, description: string, reward: int, completed: bool, href: string}>
     */
    public function missionsFor(?Student $student): array
    {
        $today = now()->toDateString();

        return [
            [
                'id' => 'simulasi',
                'icon' => '🛡️',
                'title' => 'Simulasi Berani Menolak',
                'description' => 'Latih keberanianmu pada satu skenario simulasi',
                'reward' => 10,
                'completed' => $this->hasSimulationToday($student, $today),
                'href' => '/student/simulations',
            ],
            [
                'id' => 'baca',
                'icon' => '📖',
                'title' => 'Tonton Bioskop Teladan',
                'description' => 'Saksikan satu kisah teladan sampai selesai',
                'reward' => 15,
                'completed' => $this->hasCompletedContentToday($student, $today),
                'href' => '/student/contents',
            ],
            [
                'id' => 'tes',
                'icon' => '🧭',
                'title' => 'Selesaikan Pilih Jalanmu',
                'description' => 'Selesaikan satu kasus moral hari ini',
                'reward' => 20,
                'completed' => $this->hasSubmittedTestToday($student, $today),
                'href' => '/student/tests',
            ],
        ];
    }

    private function hasSimulationToday(?Student $student, string $today): bool
    {
        if ($student === null) {
            return false;
        }

        return SimulationAttempt::query()
            ->where('student_id', $student->id)
            ->whereDate('completed_at', $today)
            ->exists();
    }

    private function hasCompletedContentToday(?Student $student, string $today): bool
    {
        if ($student === null) {
            return false;
        }

        return ContentInteraction::query()
            ->where('student_id', $student->id)
            ->whereNotNull('completed_at')
            ->whereDate('completed_at', $today)
            ->exists();
    }

    private function hasSubmittedTestToday(?Student $student, string $today): bool
    {
        if ($student === null) {
            return false;
        }

        return TestAttempt::query()
            ->where('student_id', $student->id)
            ->where('status', 'submitted')
            ->whereDate('submitted_at', $today)
            ->exists();
    }
}

<?php

namespace Database\Seeders;

use App\Enums\SimulationScenarioStatus;
use App\Enums\UserRole;
use App\Models\SimulationScenario;
use App\Models\User;
use Illuminate\Database\Seeder;

class SimulationScenarioSeeder extends Seeder
{
    /**
     * Seed assertiveness simulation scenarios for the student portal.
     */
    public function run(): void
    {
        $creatorId = $this->creatorId();

        $scenarios = [
            [
                'title' => 'Teman Minta Mengerjakan Tugas',
                'description' => 'Latihan menyampaikan batasan dengan sopan saat teman meminta bantuan di waktu yang tidak tepat.',
                'opening_text' => "Saat jam istirahat, temanmu meminta bantuan mengerjakan tugas, padahal kamu sedang menyelesaikan tugasmu sendiri.\n\nApa yang akan kamu lakukan?",
                'options' => [
                    [
                        'text' => 'Tidak bisa, jangan ganggu saya!',
                        'feedback_text' => 'Kamu berani menolak, tetapi cara mengatakannya masih kasar. Coba sampaikan dengan nada yang lebih lembut dan tetap menghargai temanmu.',
                        'score' => 40,
                        'reward_points' => 2,
                        'sort_order' => 1,
                    ],
                    [
                        'text' => 'Maaf, saya sedang ada pekerjaan. Kita bisa membahasnya nanti.',
                        'feedback_text' => 'Hebat! Kamu menyampaikan batasan dengan jelas, sopan, dan tetap peduli dengan menawarkan bantuan di lain waktu. Itulah cara yang asertif!',
                        'score' => 100,
                        'reward_points' => 10,
                        'sort_order' => 2,
                    ],
                    [
                        'text' => 'Ya, saya kerjakan semuanya untukmu.',
                        'feedback_text' => 'Kamu baik hati, tetapi mengerjakan semuanya untuk teman bisa membuat tugasmu sendiri terbengkalai. Coba ajak temanmu mengerjakan bersama, ya.',
                        'score' => 60,
                        'reward_points' => 5,
                        'sort_order' => 3,
                    ],
                ],
            ],
            [
                'title' => 'Ajak Bermain Saat Waktu Belajar',
                'description' => 'Latihan berkata tidak dengan sopan saat diajak bermain di waktu yang seharusnya dipakai belajar.',
                'opening_text' => "Temanmu mengajak bermain di halaman, padahal sebentar lagi kamu harus belajar mengaji di kelas.\n\nApa yang akan kamu lakukan?",
                'options' => [
                    [
                        'text' => 'Tunggu aku, aku kabur dulu dari kelas!',
                        'feedback_text' => 'Meninggalkan kelas bukan pilihan yang baik, ya. Belajar mengaji itu penting dan akan lebih menyenangkan jika kamu tetap hadir.',
                        'score' => 30,
                        'reward_points' => 2,
                        'sort_order' => 1,
                    ],
                    [
                        'text' => 'Maaf, aku harus belajar dulu. Ayo main setelah selesai!',
                        'feedback_text' => 'Keren! Kamu bisa menolak ajakan tanpa menyakiti perasaan teman, bahkan menawarkan waktu lain untuk bermain. Sikap asertif yang patut dicontoh!',
                        'score' => 100,
                        'reward_points' => 10,
                        'sort_order' => 2,
                    ],
                    [
                        'text' => 'Aku ikut, tapi jangan bilang siapa-siapa ya.',
                        'feedback_text' => 'Menurutkan ajakan dengan cara sembunyi-sembunyi bisa membuatmu ketinggalan pelajaran. Coba sampaikan keinginanmu dengan jujur dan tenang.',
                        'score' => 50,
                        'reward_points' => 5,
                        'sort_order' => 3,
                    ],
                ],
            ],
        ];

        foreach ($scenarios as $scenario) {
            $options = $scenario['options'];
            unset($scenario['options']);

            $saved = SimulationScenario::query()->updateOrCreate(
                ['title' => $scenario['title']],
                [
                    ...$scenario,
                    'status' => SimulationScenarioStatus::Published->value,
                    'created_by' => $creatorId,
                ],
            );

            foreach ($options as $option) {
                $saved->options()->updateOrCreate(
                    [
                        'text' => $option['text'],
                    ],
                    [
                        'feedback_text' => $option['feedback_text'],
                        'score' => $option['score'],
                        'reward_points' => $option['reward_points'],
                        'sort_order' => $option['sort_order'],
                    ],
                );
            }
        }
    }

    private function creatorId(): ?int
    {
        $teacher = User::query()->where('username', 'ustadz')->first()
            ?? User::query()->where('role', UserRole::Teacher->value)->first();

        return $teacher?->id;
    }
}

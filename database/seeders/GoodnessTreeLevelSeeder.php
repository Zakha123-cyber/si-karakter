<?php

namespace Database\Seeders;

use App\Models\GoodnessTreeLevel;
use Illuminate\Database\Seeder;

class GoodnessTreeLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            [
                'level' => 1,
                'name' => 'Benih Kebaikan',
                'minimum_points' => 0,
                'asset_path' => 'goodness-tree/level-1-seed.svg',
                'description' => 'Setiap kebaikan kecil adalah awal pohon yang indah.',
            ],
            [
                'level' => 2,
                'name' => 'Tunas Semangat',
                'minimum_points' => 25,
                'asset_path' => 'goodness-tree/level-2-sprout.svg',
                'description' => 'Tunas mulai tumbuh saat santri terus berlatih melakukan hal baik.',
            ],
            [
                'level' => 3,
                'name' => 'Pohon Muda',
                'minimum_points' => 60,
                'asset_path' => 'goodness-tree/level-3-young-tree.svg',
                'description' => 'Kebiasaan baik mulai terlihat kuat dan menyenangkan.',
            ],
            [
                'level' => 4,
                'name' => 'Pohon Rindang',
                'minimum_points' => 120,
                'asset_path' => 'goodness-tree/level-4-leafy-tree.svg',
                'description' => 'Kebaikan yang konsisten membuat hati semakin teduh.',
            ],
            [
                'level' => 5,
                'name' => 'Pohon Berbuah',
                'minimum_points' => 200,
                'asset_path' => 'goodness-tree/level-5-fruit-tree.svg',
                'description' => 'Kebaikan santri mulai memberi manfaat untuk teman dan lingkungan.',
            ],
        ];

        foreach ($levels as $level) {
            GoodnessTreeLevel::query()->updateOrCreate(
                ['level' => $level['level']],
                $level,
            );
        }
    }
}

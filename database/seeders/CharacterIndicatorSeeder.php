<?php

namespace Database\Seeders;

use App\Models\CharacterIndicator;
use Illuminate\Database\Seeder;

class CharacterIndicatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $indicators = [
            [
                'code' => 'honesty',
                'name' => 'Kejujuran',
                'description' => 'Menyampaikan kebenaran dan bertindak sesuai fakta tanpa manipulasi.',
                'category' => 'moral_reasoning',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'empathy',
                'name' => 'Empati & Kepedulian',
                'description' => 'Mampu merasakan dan memahami perasaan serta kondisi orang lain.',
                'category' => 'social',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'responsibility',
                'name' => 'Tanggung Jawab',
                'description' => 'Menjalankan kewajiban dan menerima konsekuensi dari keputusan yang diambil.',
                'category' => 'responsibility',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'peer_pressure_resistance',
                'name' => 'Ketahanan Tekanan Teman',
                'description' => 'Mampu mempertahankan nilai kebaikan meskipun mendapat tekanan dari teman sebaya.',
                'category' => 'moral_reasoning',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'dishonesty_warning',
                'name' => 'Kecenderungan Manipulatif',
                'description' => 'Indikator peringatan jika terdapat pola ketidakjujuran atau pengalihan fakta.',
                'category' => 'moral_reasoning',
                'is_warning_indicator' => true,
                'is_active' => true,
            ],
            [
                'code' => 'attendance',
                'name' => 'Kehadiran',
                'description' => 'Kehadiran dan ketepatan waktu dalam kegiatan harian.',
                'category' => 'responsibility',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'discipline',
                'name' => 'Kedisiplinan',
                'description' => 'Kepatuhan terhadap aturan dan tata tertib.',
                'category' => 'responsibility',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'memorization',
                'name' => 'Hafalan',
                'description' => 'Perkembangan hafalan dan ketekunan mengulang pelajaran.',
                'category' => 'worship',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'adab',
                'name' => 'Adab & Sopan Santun',
                'description' => 'Adab kepada guru, orang tua, dan teman.',
                'category' => 'worship',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'cleanliness',
                'name' => 'Kebersihan',
                'description' => 'Kebersihan diri, kamar, dan lingkungan sekitar.',
                'category' => 'responsibility',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'worship',
                'name' => 'Ibadah',
                'description' => 'Keistiqomahan dan kualitas ibadah harian.',
                'category' => 'worship',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
            [
                'code' => 'daily_tasks',
                'name' => 'Tugas Harian',
                'description' => 'Penyelesaian tugas harian dan piket sesuai jadwal.',
                'category' => 'responsibility',
                'is_warning_indicator' => false,
                'is_active' => true,
            ],
        ];

        foreach ($indicators as $indicator) {
            CharacterIndicator::updateOrCreate(
                ['code' => $indicator['code']],
                $indicator
            );
        }

        CharacterIndicator::factory()->count(5)->create();
    }
}

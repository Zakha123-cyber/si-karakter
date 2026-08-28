<?php

namespace Database\Seeders;

use App\Enums\EducationalContentStatus;
use App\Enums\EducationalContentType;
use App\Enums\UserRole;
use App\Models\CharacterIndicator;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Database\Seeder;

class EducationalContentSeeder extends Seeder
{
    /**
     * Seed motivational educational content for the student portal.
     */
    public function run(): void
    {
        $indicatorIds = $this->seedIndicators();
        $creatorId = $this->creatorId();

        $contents = [
            [
                'title' => 'Video Belajar Berani Berkata Baik',
                'slug' => 'video-belajar-berani-berkata-baik',
                'content_type' => EducationalContentType::Video->value,
                'description' => 'Panduan singkat untuk berani memilih kata yang jujur, lembut, dan menenangkan saat bersama teman.',
                'content_body' => "Bayangkan ada teman yang mengajakmu menyembunyikan kesalahan kecil.\n\nLangkah baik yang bisa kamu coba:\n1. Tarik napas dan tenangkan hati.\n2. Sampaikan fakta dengan suara lembut.\n3. Ajak teman memperbaiki keadaan bersama.\n\nBerani berkata baik membuat hati lebih ringan dan persahabatan tetap hangat.",
                'duration_seconds' => 240,
                'indicators' => ['honesty', 'peer_pressure_resistance'],
            ],
            [
                'title' => 'Komik Teman Baru di Serambi',
                'slug' => 'komik-teman-baru-di-serambi',
                'content_type' => EducationalContentType::Comic->value,
                'description' => 'Cerita bergambar tentang menyambut teman baru dengan ramah, empati, dan adab yang indah.',
                'content_body' => "Panel 1: Seorang santri baru duduk sendiri di serambi.\nPanel 2: Dua teman menyapa dengan senyum dan mengajaknya bermain.\nPanel 3: Mereka bergantian mendengarkan cerita teman baru.\nPanel 4: Serambi terasa lebih ceria karena semua saling menghargai.\n\nKebaikan kecil seperti menyapa bisa membuat teman merasa diterima.",
                'duration_seconds' => 180,
                'indicators' => ['empathy', 'adab'],
            ],
            [
                'title' => 'Poster Tiga Langkah Tanggung Jawab',
                'slug' => 'poster-tiga-langkah-tanggung-jawab',
                'content_type' => EducationalContentType::Image->value,
                'description' => 'Poster pengingat sederhana untuk menyelesaikan amanah harian dengan hati gembira.',
                'content_body' => "Tiga langkah tanggung jawab:\n\n1. Ingat amanahmu hari ini.\n2. Kerjakan sedikit demi sedikit sampai selesai.\n3. Rapikan kembali tempat dan alat yang dipakai.\n\nSaat amanah selesai, kamu sedang menumbuhkan pohon kebaikan dalam dirimu.",
                'duration_seconds' => 90,
                'indicators' => ['responsibility', 'discipline'],
            ],
            [
                'title' => 'Audio Renungan Pagi Adab dan Ibadah',
                'slug' => 'audio-renungan-pagi-adab-dan-ibadah',
                'content_type' => EducationalContentType::Audio->value,
                'description' => 'Renungan pendek untuk memulai hari dengan salam, doa, dan sikap hormat kepada guru serta teman.',
                'content_body' => "Pagi adalah kesempatan baru untuk berbuat baik.\n\nMulailah dengan doa, sapa orang di sekitarmu dengan salam, dengarkan nasihat guru, dan bantu teman yang membutuhkan.\n\nAdab yang lembut membuat ilmu lebih mudah masuk ke hati.",
                'duration_seconds' => 300,
                'indicators' => ['adab', 'worship'],
            ],
            [
                'title' => 'Kisah Kotak Pensil yang Kembali',
                'slug' => 'kisah-kotak-pensil-yang-kembali',
                'content_type' => EducationalContentType::Story->value,
                'description' => 'Kisah teladan tentang mengembalikan barang yang ditemukan dan menjaga kepercayaan teman.',
                'content_body' => "Di sudut kelas, Nabil menemukan kotak pensil berwarna biru. Ia sempat ingin menaruhnya di tas agar aman, tetapi ia ingat bahwa pemiliknya pasti sedang mencari.\n\nNabil membawa kotak pensil itu kepada ustadz dan bertanya kepada teman-teman. Tak lama, pemiliknya datang dengan wajah lega.\n\nHari itu Nabil belajar bahwa kejujuran membuat hati tenang dan membuat orang lain percaya. Ia pulang dengan senyum, merasa telah menjaga amanah kecil dengan baik.",
                'duration_seconds' => 420,
                'indicators' => ['honesty', 'responsibility'],
            ],
        ];

        foreach ($contents as $content) {
            $indicatorCodes = $content['indicators'];
            unset($content['indicators']);

            $educationalContent = EducationalContent::query()->updateOrCreate(
                ['slug' => $content['slug']],
                [
                    ...$content,
                    'media_path' => null,
                    'thumbnail_path' => null,
                    'status' => EducationalContentStatus::Published->value,
                    'created_by' => $creatorId,
                ],
            );

            $educationalContent->indicators()->sync(
                collect($indicatorCodes)
                    ->map(fn (string $code): int => $indicatorIds[$code])
                    ->values()
                    ->all(),
            );
        }
    }

    /**
     * @return array<string, int>
     */
    private function seedIndicators(): array
    {
        $indicators = [
            'honesty' => [
                'name' => 'Kejujuran',
                'description' => 'Menyampaikan kebenaran dan bertindak sesuai fakta tanpa manipulasi.',
                'category' => 'moral_reasoning',
            ],
            'empathy' => [
                'name' => 'Empati & Kepedulian',
                'description' => 'Mampu merasakan dan memahami perasaan serta kondisi orang lain.',
                'category' => 'social',
            ],
            'responsibility' => [
                'name' => 'Tanggung Jawab',
                'description' => 'Menjalankan kewajiban dan menerima konsekuensi dari keputusan yang diambil.',
                'category' => 'responsibility',
            ],
            'peer_pressure_resistance' => [
                'name' => 'Ketahanan Tekanan Teman',
                'description' => 'Mampu mempertahankan nilai kebaikan meskipun mendapat tekanan dari teman sebaya.',
                'category' => 'moral_reasoning',
            ],
            'discipline' => [
                'name' => 'Kedisiplinan',
                'description' => 'Kepatuhan terhadap aturan dan tata tertib.',
                'category' => 'responsibility',
            ],
            'adab' => [
                'name' => 'Adab & Sopan Santun',
                'description' => 'Adab kepada guru, orang tua, dan teman.',
                'category' => 'worship',
            ],
            'worship' => [
                'name' => 'Ibadah',
                'description' => 'Keistiqomahan dan kualitas ibadah harian.',
                'category' => 'worship',
            ],
        ];

        foreach ($indicators as $code => $indicator) {
            CharacterIndicator::query()->updateOrCreate(
                ['code' => $code],
                [
                    ...$indicator,
                    'is_warning_indicator' => false,
                    'is_active' => true,
                ],
            );
        }

        return CharacterIndicator::query()
            ->whereIn('code', array_keys($indicators))
            ->pluck('id', 'code')
            ->map(fn (int|string $id): int => (int) $id)
            ->all();
    }

    private function creatorId(): ?int
    {
        $admin = User::query()->where('username', 'admin')->first()
            ?? User::query()->where('role', UserRole::Admin->value)->first();

        return $admin?->id;
    }
}

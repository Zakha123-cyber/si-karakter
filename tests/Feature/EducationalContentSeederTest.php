<?php

use App\Enums\EducationalContentStatus;
use App\Models\EducationalContent;
use Database\Seeders\EducationalContentSeeder;
use Illuminate\Support\Facades\DB;

it('seeds educational contents idempotently with indicator mappings', function () {
    $this->seed(EducationalContentSeeder::class);
    $this->seed(EducationalContentSeeder::class);

    $seededSlugs = [
        'video-belajar-berani-berkata-baik',
        'komik-teman-baru-di-serambi',
        'poster-tiga-langkah-tanggung-jawab',
        'audio-renungan-pagi-adab-dan-ibadah',
        'kisah-kotak-pensil-yang-kembali',
    ];

    $contents = EducationalContent::query()
        ->with('indicators:id,code')
        ->whereIn('slug', $seededSlugs)
        ->orderBy('slug')
        ->get();

    expect($contents)->toHaveCount(5)
        ->and($contents->pluck('status')->unique()->all())->toBe([EducationalContentStatus::Published])
        ->and($contents->pluck('content_type.value')->sort()->values()->all())->toBe(['audio', 'comic', 'image', 'story', 'video'])
        ->and(DB::table('educational_content_indicators')->count())->toBe(10);

    expect(
        EducationalContent::query()
            ->where('slug', 'kisah-kotak-pensil-yang-kembali')
            ->firstOrFail()
            ->indicators()
            ->pluck('code')
            ->sort()
            ->values()
            ->all()
    )->toBe(['honesty', 'responsibility']);
});

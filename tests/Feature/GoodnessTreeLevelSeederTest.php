<?php

use App\Models\GoodnessTreeLevel;
use Database\Seeders\GoodnessTreeLevelSeeder;

it('seeds goodness tree levels idempotently', function () {
    $this->seed(GoodnessTreeLevelSeeder::class);
    $this->seed(GoodnessTreeLevelSeeder::class);

    expect(GoodnessTreeLevel::query()->count())->toBe(5)
        ->and(GoodnessTreeLevel::query()->where('level', 1)->value('minimum_points'))->toBe(0)
        ->and(GoodnessTreeLevel::query()->where('level', 5)->value('name'))->toBe('Pohon Berbuah')
        ->and(GoodnessTreeLevel::query()->pluck('minimum_points')->all())->toBe([0, 25, 60, 120, 200]);
});

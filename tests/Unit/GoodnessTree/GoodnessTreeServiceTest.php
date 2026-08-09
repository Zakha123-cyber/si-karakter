<?php

use App\Domain\GoodnessTree\GoodnessTreeService;
use App\Models\GoodnessPointTransaction;
use App\Models\GoodnessTreeLevel;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function treeLevelForTest(int $level, int $minimumPoints, string $name): GoodnessTreeLevel
{
    return GoodnessTreeLevel::factory()->create([
        'level' => $level,
        'name' => $name,
        'minimum_points' => $minimumPoints,
        'asset_path' => "goodness-tree/test-level-{$level}.svg",
        'description' => "Deskripsi {$name}",
    ]);
}

test('goodness tree selects current and next level by point threshold', function () {
    treeLevelForTest(1, 0, 'Benih');
    treeLevelForTest(2, 25, 'Tunas');
    treeLevelForTest(3, 60, 'Pohon Muda');

    $progress = app(GoodnessTreeService::class)->progressForPoints(40);

    expect($progress->points)->toBe(40)
        ->and($progress->currentLevel?->name)->toBe('Tunas')
        ->and($progress->nextLevel?->name)->toBe('Pohon Muda')
        ->and($progress->pointsToNextLevel)->toBe(20)
        ->and($progress->progressPercent)->toBe(43)
        ->and($progress->isMaxLevel())->toBeFalse();
});

test('goodness tree handles exact threshold and max level', function () {
    treeLevelForTest(1, 0, 'Benih');
    treeLevelForTest(2, 25, 'Tunas');
    treeLevelForTest(3, 60, 'Pohon Muda');

    $exact = app(GoodnessTreeService::class)->progressForPoints(25);
    $max = app(GoodnessTreeService::class)->progressForPoints(120);

    expect($exact->currentLevel?->name)->toBe('Tunas')
        ->and($exact->nextLevel?->name)->toBe('Pohon Muda')
        ->and($exact->progressPercent)->toBe(0)
        ->and($max->currentLevel?->name)->toBe('Pohon Muda')
        ->and($max->nextLevel)->toBeNull()
        ->and($max->pointsToNextLevel)->toBe(0)
        ->and($max->progressPercent)->toBe(100)
        ->and($max->isMaxLevel())->toBeTrue();
});

test('goodness tree handles empty levels without negative progress', function () {
    $progress = app(GoodnessTreeService::class)->progressForPoints(-10);

    expect($progress->points)->toBe(0)
        ->and($progress->currentLevel)->toBeNull()
        ->and($progress->nextLevel)->toBeNull()
        ->and($progress->progressPercent)->toBe(0)
        ->and($progress->pointsToNextLevel)->toBe(0)
        ->and($progress->levels)->toBe([]);
});

test('goodness tree sums only positive point transactions', function () {
    treeLevelForTest(1, 0, 'Benih');
    treeLevelForTest(2, 25, 'Tunas');

    $student = Student::factory()->create();

    GoodnessPointTransaction::factory()->create([
        'student_id' => $student->id,
        'points' => 15,
    ]);
    GoodnessPointTransaction::factory()->create([
        'student_id' => $student->id,
        'points' => 10,
    ]);
    GoodnessPointTransaction::factory()->create([
        'student_id' => $student->id,
        'points' => -100,
    ]);

    $progress = app(GoodnessTreeService::class)->progressForStudent($student);

    expect($progress->points)->toBe(25)
        ->and($progress->currentLevel?->name)->toBe('Tunas');
});

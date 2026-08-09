<?php

use App\Models\ObservationEntry;
use App\Models\Student;
use App\Models\StudentWarning;
use Database\Seeders\EarlyWarningDemoSeeder;

it('early warning demo seeder creates bad observation data and one open warning', function () {
    $this->seed(EarlyWarningDemoSeeder::class);
    $this->seed(EarlyWarningDemoSeeder::class);

    $student = Student::query()
        ->where('student_code', 'EW-DEMO-001')
        ->first();

    expect($student)->not->toBeNull()
        ->and(ObservationEntry::query()
            ->where('student_id', $student->id)
            ->where('general_note', 'like', 'DEMO_EARLY_WARNING_%')
            ->count())->toBe(2)
        ->and(StudentWarning::query()
            ->where('student_id', $student->id)
            ->where('status', 'open')
            ->count())->toBe(1)
        ->and(StudentWarning::query()->where('student_id', $student->id)->first()?->title)
        ->toContain('membutuhkan pendampingan');
});

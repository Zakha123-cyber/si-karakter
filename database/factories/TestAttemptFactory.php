<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TestAttempt>
 */
class TestAttemptFactory extends Factory
{
    protected $model = TestAttempt::class;

    public function definition(): array
    {
        return [
            'test_package_id' => TestPackage::factory(),
            'student_id' => Student::factory(),
            'attempt_number' => 1,
            'status' => 'submitted',
            'started_at' => now()->subHours(2),
            'submitted_at' => now()->subHour(),
            'completed_at' => now()->subHour(),
        ];
    }
}

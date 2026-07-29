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
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'test_package_id' => TestPackage::factory(),
            'student_id' => Student::factory(),
            'attempt_number' => 1,
            'status' => 'in_progress',
            'started_at' => now(),
            'submitted_at' => null,
            'completed_at' => null,
        ];
    }
}

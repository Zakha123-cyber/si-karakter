<?php

namespace Database\Factories;

use App\Models\GoodnessPointTransaction;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GoodnessPointTransaction>
 */
class GoodnessPointTransactionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'source_type' => 'manual',
            'source_id' => null,
            'points' => fake()->numberBetween(1, 20),
            'description' => fake()->sentence(),
            'awarded_by' => User::factory()->teacher(),
            'created_at' => now(),
        ];
    }
}

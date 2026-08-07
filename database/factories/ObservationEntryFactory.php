<?php

namespace Database\Factories;

use App\Models\ObservationEntry;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ObservationEntry>
 */
class ObservationEntryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'teacher_id' => User::factory()->teacher(),
            'observed_at' => fake()->date(),
            'general_note' => fake()->optional()->paragraph(),
            'sentiment' => fake()->randomElement(['positive', 'neutral', 'negative']),
        ];
    }
}

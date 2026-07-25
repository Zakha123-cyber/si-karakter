<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->student(),
            'student_code' => fake()->unique()->numerify('STR-#####'),
            'birth_date' => fake()->optional()->date(),
            'gender' => fake()->optional()->randomElement(['male', 'female']),
            'current_group_id' => Group::factory(),
            'enrollment_date' => fake()->optional()->date(),
            'status' => 'active',
        ];
    }
}

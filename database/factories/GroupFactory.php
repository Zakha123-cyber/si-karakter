<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Group>
 */
class GroupFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'academic_year_id' => AcademicYear::factory(),
            'name' => 'Kelompok '.fake()->unique()->bothify('??-##'),
            'description' => fake()->optional()->sentence(),
            'teacher_id' => User::factory()->teacher(),
            'is_active' => true,
        ];
    }
}

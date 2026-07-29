<?php

namespace Database\Factories;

use App\Models\MoralCase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MoralCase>
 */
class MoralCaseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(4),
            'story' => fake()->paragraph(),
            'image_path' => null,
            'audio_path' => null,
            'sort_order' => fake()->numberBetween(1, 10),
            'is_active' => true,
            'created_by' => User::factory()->teacher(),
        ];
    }
}

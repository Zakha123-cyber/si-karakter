<?php

namespace Database\Factories;

use App\Models\ScoringConfiguration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScoringConfiguration>
 */
class ScoringConfigurationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'test_weight' => 60.00,
            'observation_weight' => 40.00,
            'is_active' => false,
            'effective_from' => now()->startOfYear()->toDateString(),
            'effective_until' => null,
            'created_by' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}

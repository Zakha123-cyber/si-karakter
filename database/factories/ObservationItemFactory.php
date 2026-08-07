<?php

namespace Database\Factories;

use App\Models\CharacterIndicator;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ObservationItem>
 */
class ObservationItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'observation_entry_id' => ObservationEntry::factory(),
            'character_indicator_id' => CharacterIndicator::factory(),
            'sentiment' => fake()->randomElement(['positive', 'neutral', 'negative']),
            'assessment_score' => fake()->optional()->randomFloat(2, 0, 100),
            'reward_points' => fake()->numberBetween(0, 10),
            'note' => fake()->optional()->sentence(),
        ];
    }
}

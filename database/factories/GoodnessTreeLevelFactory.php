<?php

namespace Database\Factories;

use App\Models\GoodnessTreeLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GoodnessTreeLevel>
 */
class GoodnessTreeLevelFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $level = fake()->unique()->numberBetween(1, 99);

        return [
            'level' => $level,
            'name' => 'Level '.$level,
            'minimum_points' => ($level - 1) * 25,
            'asset_path' => 'goodness-tree/level-'.$level.'.svg',
            'description' => fake()->sentence(),
        ];
    }
}

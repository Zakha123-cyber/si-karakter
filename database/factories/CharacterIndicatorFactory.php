<?php

namespace Database\Factories;

use App\Models\CharacterIndicator;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CharacterIndicator>
 */
class CharacterIndicatorFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->word().' '.fake()->word();

        return [
            'code' => Str::slug($name, '_'),
            'name' => Str::title($name),
            'description' => fake()->optional()->sentence(),
            'category' => fake()->randomElement(['moral_reasoning', 'social', 'responsibility']),
            'is_warning_indicator' => false,
            'is_active' => true,
        ];
    }

    public function warning(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_warning_indicator' => true,
        ]);
    }
}

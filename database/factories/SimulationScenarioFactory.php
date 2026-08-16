<?php

namespace Database\Factories;

use App\Enums\SimulationScenarioStatus;
use App\Models\SimulationScenario;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SimulationScenario>
 */
class SimulationScenarioFactory extends Factory
{
    protected $model = SimulationScenario::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'opening_text' => fake()->paragraphs(2, true),
            'audio_path' => null,
            'image_path' => null,
            'status' => SimulationScenarioStatus::Published->value,
            'created_by' => User::factory()->teacher(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SimulationScenarioStatus::Draft->value,
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SimulationScenarioStatus::Published->value,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SimulationScenarioStatus::Archived->value,
        ]);
    }
}

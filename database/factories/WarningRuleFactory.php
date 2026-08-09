<?php

namespace Database\Factories;

use App\Models\WarningRule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WarningRule>
 */
class WarningRuleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Pola Observasi Membutuhkan Pendampingan',
            'description' => fake()->optional()->sentence(),
            'rule_type' => 'observation_negative_indicator',
            'conditions_json' => [
                'window_days' => 14,
                'minimum_negative_items' => 2,
                'require_warning_indicator' => true,
            ],
            'severity' => fake()->randomElement(['low', 'medium', 'high']),
            'is_active' => true,
        ];
    }
}

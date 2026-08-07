<?php

namespace Database\Factories;

use App\Models\MoralCase;
use App\Models\MoralCaseOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MoralCaseOption>
 */
class MoralCaseOptionFactory extends Factory
{
    protected $model = MoralCaseOption::class;

    public function definition(): array
    {
        return [
            'moral_case_id' => MoralCase::factory(),
            'label' => fake()->randomElement(['A', 'B', 'C']),
            'text' => fake()->sentence(),
            'internal_value' => fake()->randomElement(['pre_conventional', 'conventional', 'post_conventional']),
            'sort_order' => fake()->numberBetween(1, 10),
            'is_active' => true,
        ];
    }
}

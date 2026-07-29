<?php

namespace Database\Factories;

use App\Models\MoralCase;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MoralCase>
 */
class MoralCaseFactory extends Factory
{
    protected $model = MoralCase::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'story' => fake()->paragraph(3),
            'image_path' => null,
            'audio_path' => null,
            'sort_order' => 1,
            'is_active' => true,
        ];
    }
}

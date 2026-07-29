<?php

namespace Database\Factories;

use App\Enums\TestPackageStatus;
use App\Models\TestPackage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TestPackage>
 */
class TestPackageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'description' => fake()->optional()->paragraph(),
            'start_at' => now()->subDay(),
            'end_at' => now()->addMonth(),
            'attempt_limit' => 1,
            'status' => TestPackageStatus::Published->value,
            'created_by' => User::factory()->teacher(),
        ];
    }
}

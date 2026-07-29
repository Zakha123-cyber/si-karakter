<?php

namespace Database\Factories;

use App\Models\TestPackage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TestPackage>
 */
class TestPackageFactory extends Factory
{
    protected $model = TestPackage::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::random(5),
            'description' => fake()->paragraph(),
            'start_at' => null,
            'end_at' => null,
            'attempt_limit' => 1,
            'status' => 'published',
            'created_by' => null,
        ];
    }
}

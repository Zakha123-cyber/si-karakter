<?php

namespace Database\Factories;

use App\Enums\EducationalContentStatus;
use App\Enums\EducationalContentType;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<EducationalContent>
 */
class EducationalContentFactory extends Factory
{
    protected $model = EducationalContent::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'content_type' => fake()->randomElement(EducationalContentType::values()),
            'description' => fake()->optional()->paragraph(),
            'content_body' => fake()->paragraphs(3, true),
            'media_path' => null,
            'thumbnail_path' => null,
            'duration_seconds' => fake()->optional()->numberBetween(60, 900),
            'status' => EducationalContentStatus::Published->value,
            'created_by' => User::factory()->admin(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EducationalContentStatus::Draft->value,
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EducationalContentStatus::Published->value,
        ]);
    }
}

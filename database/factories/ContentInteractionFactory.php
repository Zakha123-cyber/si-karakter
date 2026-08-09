<?php

namespace Database\Factories;

use App\Enums\ContentEmotionResponse;
use App\Models\ContentInteraction;
use App\Models\EducationalContent;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentInteraction>
 */
class ContentInteractionFactory extends Factory
{
    protected $model = ContentInteraction::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'educational_content_id' => EducationalContent::factory(),
            'emotion_response' => fake()->optional()->randomElement(ContentEmotionResponse::values()),
            'started_at' => now()->subMinutes(5),
            'completed_at' => fake()->optional()->dateTimeBetween('-4 minutes', 'now'),
        ];
    }
}

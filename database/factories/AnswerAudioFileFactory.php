<?php

namespace Database\Factories;

use App\Models\AnswerAudioFile;
use App\Models\TestAnswer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AnswerAudioFile>
 */
class AnswerAudioFileFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'test_answer_id' => TestAnswer::factory(),
            'file_path' => 'student-answers/audio/'.Str::uuid().'.mp3',
            'original_name' => 'jawaban.mp3',
            'mime_type' => 'audio/mpeg',
            'file_size' => fake()->numberBetween(10_000, 500_000),
            'duration_seconds' => fake()->numberBetween(3, 60),
            'checksum' => fake()->sha256(),
        ];
    }
}

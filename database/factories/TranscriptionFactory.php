<?php

namespace Database\Factories;

use App\Enums\TranscriptionStatus;
use App\Models\TestAnswer;
use App\Models\Transcription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transcription>
 */
class TranscriptionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'test_answer_id' => TestAnswer::factory(),
            'provider' => 'groq',
            'model' => 'whisper-large-v3-turbo',
            'original_text' => null,
            'edited_text' => null,
            'language' => null,
            'confidence' => null,
            'status' => TranscriptionStatus::Pending->value,
            'error_message' => null,
            'raw_response_json' => null,
            'processed_at' => null,
        ];
    }
}

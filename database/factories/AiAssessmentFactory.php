<?php

namespace Database\Factories;

use App\Models\AiAssessment;
use App\Models\TestAnswer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiAssessment>
 */
class AiAssessmentFactory extends Factory
{
    protected $model = AiAssessment::class;

    public function definition(): array
    {
        return [
            'test_answer_id' => TestAnswer::factory(),
            'provider' => 'openai',
            'model' => 'gpt-4o',
            'moral_level' => 'Tahap 3: Orientasi Anak Manis',
            'confidence' => 0.90,
            'reasoning_summary' => fake()->paragraph(),
            'suggested_intervention' => fake()->sentence(),
            'warning_signals_json' => [],
            'indicators_json' => [],
            'prompt_version' => 'v1.0',
            'raw_response_json' => ['status' => 'success'],
            'status' => 'completed',
            'processed_at' => now(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\MoralCase;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TestAnswer>
 */
class TestAnswerFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'test_attempt_id' => TestAttempt::factory(),
            'moral_case_id' => MoralCase::factory(),
            'selected_option_id' => null,
            'typed_reason' => null,
            'final_transcript' => null,
            'answer_status' => 'draft',
        ];
    }
}

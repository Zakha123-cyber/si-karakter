<?php

namespace Database\Factories;

use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TeacherValidation>
 */
class TeacherValidationFactory extends Factory
{
    protected $model = TeacherValidation::class;

    public function definition(): array
    {
        return [
            'test_answer_id' => TestAnswer::factory(),
            'ai_assessment_id' => null,
            'teacher_id' => User::factory()->teacher(),
            'decision' => 'approved',
            'final_moral_level' => fake()->randomElement(['pre_conventional', 'conventional', 'post_conventional']),
            'final_indicators_json' => [],
            'teacher_note' => null,
            'override_reason' => null,
            'validated_at' => now(),
        ];
    }
}

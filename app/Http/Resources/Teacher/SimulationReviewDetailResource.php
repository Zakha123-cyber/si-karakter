<?php

namespace App\Http\Resources\Teacher;

use App\Models\Group;
use App\Models\SimulationAttempt;
use App\Models\SimulationAttemptReview;
use App\Models\SimulationOption;
use App\Models\SimulationScenario;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property SimulationAttempt $resource
 *
 * @mixin SimulationAttempt
 */
class SimulationReviewDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var SimulationAttempt $attempt */
        $attempt = $this->resource;

        /** @var Student|null $student */
        $student = $attempt->student;
        /** @var Group|null $group */
        $group = $student?->currentGroup;
        /** @var SimulationScenario|null $scenario */
        $scenario = $attempt->scenario;
        /** @var SimulationAttemptReview|null $review */
        $review = $attempt->review;

        $options = $scenario?->options;
        $bestScore = (float) ($options?->max('score') ?? 0);
        $selectedOptionId = $attempt->selected_option_id;

        return [
            'id' => $attempt->id,
            'completed_at' => $attempt->completed_at->toISOString(),
            'score' => (float) $attempt->score,
            'reward_points' => (int) $attempt->reward_points,
            'selected_option_id' => $selectedOptionId,
            'student' => $student ? [
                'id' => $student->id,
                'name' => $student->user?->name,
                'student_code' => $student->student_code,
                'username' => $student->user?->username,
            ] : null,
            'group' => $group ? [
                'id' => $group->id,
                'name' => $group->name,
            ] : null,
            'scenario' => $scenario ? [
                'id' => $scenario->id,
                'title' => $scenario->title,
                'description' => $scenario->description,
                'opening_text' => $scenario->opening_text,
                'image' => $scenario->image_path,
            ] : null,
            'options' => $options === null ? [] : $options
                ->sortBy('sort_order')
                ->values()
                ->map(fn (SimulationOption $option): array => [
                    'id' => $option->id,
                    'text' => $option->text,
                    'feedback_text' => $option->feedback_text,
                    'score' => (float) $option->score,
                    'reward_points' => (int) $option->reward_points,
                    'is_selected' => $option->id === $selectedOptionId,
                    'is_best' => (float) $option->score >= $bestScore,
                ])
                ->all(),
            'review' => [
                'status' => $review ? 'reviewed' : 'pending',
                'teacher_note' => $review?->teacher_note,
                'teacher_name' => $review?->teacher?->name,
                'reviewed_at' => $review?->reviewed_at?->toISOString(),
            ],
        ];
    }
}

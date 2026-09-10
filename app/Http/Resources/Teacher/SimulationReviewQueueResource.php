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
class SimulationReviewQueueResource extends JsonResource
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
        /** @var SimulationOption|null $option */
        $option = $attempt->selectedOption;
        /** @var SimulationAttemptReview|null $review */
        $review = $attempt->review;

        $score = (float) $attempt->score;
        $bestScore = (float) ($scenario?->options->max('score') ?? 0);

        return [
            'id' => $attempt->id,
            'completed_at' => $attempt->completed_at->toISOString(),
            'score' => $score,
            'reward_points' => (int) $attempt->reward_points,
            'is_best' => $score >= $bestScore,
            'student' => $student ? [
                'id' => $student->id,
                'name' => $student->user?->name,
                'student_code' => $student->student_code,
            ] : null,
            'group' => $group ? [
                'id' => $group->id,
                'name' => $group->name,
            ] : null,
            'scenario' => $scenario ? [
                'id' => $scenario->id,
                'title' => $scenario->title,
            ] : null,
            'selected_option' => $option ? [
                'id' => $option->id,
                'text' => $option->text,
            ] : null,
            'review' => [
                'status' => $review ? 'reviewed' : 'pending',
                'teacher_note' => $review?->teacher_note,
                'teacher_name' => $review?->teacher?->name,
                'reviewed_at' => $review?->reviewed_at?->toISOString(),
            ],
        ];
    }
}

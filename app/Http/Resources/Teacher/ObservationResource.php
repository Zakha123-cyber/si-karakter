<?php

namespace App\Http\Resources\Teacher;

use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property ObservationEntry $resource
 *
 * @mixin ObservationEntry
 */
class ObservationResource extends JsonResource
{
    /**
     * @param  ObservationEntry  $resource
     */
    public function __construct(
        $resource,
        public readonly ?float $score = null,
        public readonly bool $canEdit = false,
        public readonly bool $canDelete = false,
    ) {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ObservationEntry $entry */
        $entry = $this->resource;

        return [
            'id' => $entry->id,
            'observed_at' => $entry->observed_at->toDateString(),
            'general_note' => $entry->general_note,
            'sentiment' => $entry->sentiment,
            'created_at' => $entry->created_at?->toISOString(),
            'student' => [
                'id' => $entry->student?->id,
                'name' => $entry->student?->user?->name,
                'student_code' => $entry->student?->student_code,
                'group_name' => $entry->student?->currentGroup?->name,
            ],
            'teacher' => [
                'id' => $entry->teacher?->id,
                'name' => $entry->teacher?->name,
            ],
            'items' => $entry->items->map(fn (ObservationItem $item) => [
                'id' => $item->id,
                'character_indicator_id' => $item->character_indicator_id,
                'indicator_name' => $item->characterIndicator?->name,
                'sentiment' => $item->sentiment,
                'assessment_score' => $item->assessment_score !== null ? (float) $item->assessment_score : null,
                'reward_points' => $item->reward_points,
                'note' => $item->note,
            ])->values(),
            'score' => $this->score,
            'total_reward_points' => $entry->items->sum('reward_points'),
            'can_edit' => $this->canEdit,
            'can_delete' => $this->canDelete,
        ];
    }
}

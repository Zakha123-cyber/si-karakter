<?php

namespace App\Http\Resources\Teacher;

use App\Models\StudentWarning;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property StudentWarning $resource
 *
 * @mixin StudentWarning
 */
class StudentWarningResource extends JsonResource
{
    public function __construct(
        $resource,
        public readonly bool $canReview = false,
        public readonly bool $canResolve = false,
    ) {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var StudentWarning $warning */
        $warning = $this->resource;

        return [
            'id' => $warning->id,
            'title' => $warning->title,
            'description' => $warning->description,
            'severity' => $warning->severity,
            'status' => $warning->status,
            'source_type' => $warning->source_type,
            'source_id' => $warning->source_id,
            'detected_at' => $warning->detected_at->toISOString(),
            'detected_at_label' => $warning->detected_at->format('Y-m-d H:i'),
            'reviewed_at' => $warning->reviewed_at?->toISOString(),
            'reviewed_at_label' => $warning->reviewed_at?->format('Y-m-d H:i'),
            'resolution_note' => $warning->resolution_note,
            'student' => [
                'id' => $warning->student?->id,
                'name' => $warning->student?->user?->name,
                'student_code' => $warning->student?->student_code,
                'group_name' => $warning->student?->currentGroup?->name,
            ],
            'rule' => [
                'id' => $warning->warningRule?->id,
                'name' => $warning->warningRule?->name,
                'description' => $warning->warningRule?->description,
                'rule_type' => $warning->warningRule?->rule_type,
            ],
            'reviewer' => [
                'id' => $warning->reviewer?->id,
                'name' => $warning->reviewer?->name,
            ],
            'can_review' => $this->canReview,
            'can_resolve' => $this->canResolve,
        ];
    }
}

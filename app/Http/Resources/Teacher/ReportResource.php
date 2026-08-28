<?php

namespace App\Http\Resources\Teacher;

use App\Models\CharacterReport;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property CharacterReport $resource
 *
 * @mixin CharacterReport
 */
class ReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var CharacterReport $report */
        $report = $this->resource;

        return [
            'id' => $report->id,
            'student' => [
                'id' => $report->student?->id,
                'name' => $report->student?->user?->name,
                'student_code' => $report->student?->student_code,
                'group_name' => $report->student?->currentGroup?->name,
            ],
            'period_start' => $report->period_start->toDateString(),
            'period_end' => $report->period_end->toDateString(),
            'status' => $report->status,
            'test_summary' => $report->test_summary_json,
            'observation_summary' => $report->observation_summary_json,
            'ai_generated_narrative' => $report->ai_generated_narrative,
            'final_narrative' => $report->final_narrative,
            'recommendation' => $report->recommendation,
            'teacher' => [
                'id' => $report->teacher?->id,
                'name' => $report->teacher?->name,
            ],
            'published_at' => $report->published_at?->toISOString(),
            'published_at_label' => $report->published_at?->format('Y-m-d H:i'),
            'created_at' => $report->created_at?->toISOString(),
            'created_at_label' => $report->created_at?->format('Y-m-d H:i'),
            'has_pdf' => $report->pdf_path !== null,
        ];
    }
}

<?php

namespace App\Http\Resources;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Group
 */
class GroupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'academic_year_id' => $this->academic_year_id,
            'name' => $this->name,
            'description' => $this->description,
            'teacher_id' => $this->teacher_id,
            'is_active' => $this->is_active,
            'academic_year' => new AcademicYearResource($this->whenLoaded('academicYear')),
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'students_count' => $this->whenCounted('students'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

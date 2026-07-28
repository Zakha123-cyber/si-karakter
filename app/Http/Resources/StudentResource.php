<?php

namespace App\Http\Resources;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Student
 */
class StudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'student_code' => $this->student_code,
            'birth_date' => $this->birth_date?->toISOString(),
            'gender' => $this->gender,
            'current_group_id' => $this->current_group_id,
            'enrollment_date' => $this->enrollment_date?->toISOString(),
            'status' => $this->status,
            'user' => new UserResource($this->whenLoaded('user')),
            'current_group' => new GroupResource($this->whenLoaded('currentGroup')),
            'group_histories_count' => $this->whenCounted('groupStudentHistories'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

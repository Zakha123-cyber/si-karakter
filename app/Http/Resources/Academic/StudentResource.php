<?php

namespace App\Http\Resources\Academic;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Student
 */
class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'student_code' => $this->student_code,
            'birth_date' => $this->birth_date?->toDateString(),
            'gender' => $this->gender,
            'current_group_id' => $this->current_group_id,
            'enrollment_date' => $this->enrollment_date?->toDateString(),
            'status' => $this->status,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
            ]),
            'current_group' => $this->whenLoaded('currentGroup', fn () => new GroupResource($this->currentGroup)),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

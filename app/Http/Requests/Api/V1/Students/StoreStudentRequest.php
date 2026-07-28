<?php

namespace App\Http\Requests\Api\V1\Students;

use App\Http\Requests\Api\BaseApiRequest;
use App\Models\Group;
use App\Models\User;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends BaseApiRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', Rule::exists(User::class, 'id')],
            'student_code' => ['required', 'string', 'max:50', Rule::unique('students', 'student_code')],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:20'],
            'current_group_id' => ['nullable', Rule::exists(Group::class, 'id')],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'string', 'max:30', Rule::in(['active', 'inactive', 'graduated', 'transferred'])],
        ];
    }
}

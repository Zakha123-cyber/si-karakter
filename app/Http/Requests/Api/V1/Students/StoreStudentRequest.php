<?php

namespace App\Http\Requests\Api\V1\Students;

use App\Http\Requests\Api\BaseApiRequest;
use App\Models\Student;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', Rule::unique(Student::class), 'exists:users,id'],
            'student_code' => ['required', 'string', 'max:50', Rule::unique(Student::class)],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'current_group_id' => ['nullable', 'integer', 'exists:groups,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'string', 'in:active,inactive,graduated,transferred'],
        ];
    }
}

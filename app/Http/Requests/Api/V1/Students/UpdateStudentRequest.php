<?php

namespace App\Http\Requests\Api\V1\Students;

use App\Http\Requests\Api\BaseApiRequest;
use App\Models\Student;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_code' => ['sometimes', 'string', 'max:50', Rule::unique(Student::class)->ignore($this->route('student'))],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'current_group_id' => ['nullable', 'integer', 'exists:groups,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'string', 'in:active,inactive,graduated,transferred'],
        ];
    }
}

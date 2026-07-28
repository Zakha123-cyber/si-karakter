<?php

namespace App\Http\Requests\Api\V1\Students;

use App\Http\Requests\Api\BaseApiRequest;
use App\Models\Student;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends BaseApiRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'student_code' => ['sometimes', 'string', 'max:50', Rule::unique('students', 'student_code')->ignore($this->route('student'))],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:20'],
            'current_group_id' => ['nullable', Rule::exists('groups', 'id')],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'string', 'max:30', Rule::in(['active', 'inactive', 'graduated', 'transferred'])],
        ];
    }
}

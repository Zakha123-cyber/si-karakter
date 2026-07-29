<?php

namespace App\Http\Requests\Api\V1\Groups;

use App\Http\Requests\Api\BaseApiRequest;

class AssignStudentRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_ids' => ['required_without:student_id', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:students,id'],
            'student_id' => ['required_without:student_ids', 'integer', 'exists:students,id'],
        ];
    }
}

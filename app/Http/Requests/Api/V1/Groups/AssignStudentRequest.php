<?php

namespace App\Http\Requests\Api\V1\Groups;

use App\Http\Requests\Api\BaseApiRequest;
use App\Models\Student;
use Illuminate\Validation\Rule;

class AssignStudentRequest extends BaseApiRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', Rule::exists(Student::class, 'id')],
        ];
    }
}

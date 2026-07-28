<?php

namespace App\Http\Requests\Api\V1\Groups;

use App\Http\Requests\Api\BaseApiRequest;

class UpdateGroupRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'academic_year_id' => ['sometimes', 'exists:academic_years,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

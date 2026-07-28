<?php

namespace App\Http\Requests\Api\V1\Groups;

use App\Http\Requests\Api\BaseApiRequest;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Validation\Rule;

class UpdateGroupRequest extends BaseApiRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'academic_year_id' => ['sometimes', Rule::exists('academic_years', 'id')],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', Rule::exists(User::class, 'id')->where('role', UserRole::Teacher->value)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

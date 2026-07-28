<?php

namespace App\Http\Requests\Api\V1\Groups;

use App\Http\Requests\Api\BaseApiRequest;
use App\Models\AcademicYear;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Validation\Rule;

class StoreGroupRequest extends BaseApiRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'academic_year_id' => ['required', Rule::exists(AcademicYear::class, 'id')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', Rule::exists(User::class, 'id')->where('role', UserRole::Teacher->value)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

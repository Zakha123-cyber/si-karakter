<?php

namespace App\Http\Requests\Teacher\TestPackages;

use App\Models\Group;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignTestPackageGroupsRequest extends FormRequest
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
            'group_ids' => ['array'],
            'group_ids.*' => ['integer', 'distinct', Rule::exists(Group::class, 'id')],
        ];
    }
}

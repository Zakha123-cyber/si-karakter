<?php

namespace App\Http\Requests\Teacher\TestPackages;

use App\Models\MoralCase;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignTestPackageCasesRequest extends FormRequest
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
            'case_ids' => ['array'],
            'case_ids.*' => ['integer', 'distinct', Rule::exists(MoralCase::class, 'id')],
        ];
    }
}

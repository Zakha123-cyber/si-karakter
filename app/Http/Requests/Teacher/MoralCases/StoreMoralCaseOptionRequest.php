<?php

namespace App\Http\Requests\Teacher\MoralCases;

use Illuminate\Foundation\Http\FormRequest;

class StoreMoralCaseOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'internal_value' => $this->input('internal_value') ?: null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:50'],
            'text' => ['required', 'string'],
            'internal_value' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

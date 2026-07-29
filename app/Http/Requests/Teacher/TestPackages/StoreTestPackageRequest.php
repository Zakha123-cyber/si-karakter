<?php

namespace App\Http\Requests\Teacher\TestPackages;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'description' => $this->input('description') ?: null,
            'start_at' => $this->input('start_at') ?: null,
            'end_at' => $this->input('end_at') ?: null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'attempt_limit' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }
}

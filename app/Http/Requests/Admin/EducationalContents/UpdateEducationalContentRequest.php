<?php

namespace App\Http\Requests\Admin\EducationalContents;

use App\Enums\EducationalContentStatus;
use App\Enums\EducationalContentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEducationalContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'description' => $this->input('description') ?: null,
            'content_body' => $this->input('content_body') ?: null,
            'duration_seconds' => $this->input('duration_seconds') ?: null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content_type' => ['required', Rule::in(EducationalContentType::values())],
            'description' => ['nullable', 'string', 'max:2000'],
            'content_body' => ['nullable', 'string'],
            'duration_seconds' => ['nullable', 'integer', 'min:1', 'max:86400'],
            'status' => ['required', Rule::in(EducationalContentStatus::values())],
        ];
    }
}

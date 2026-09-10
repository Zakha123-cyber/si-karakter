<?php

namespace App\Http\Requests\Teacher\SimulationReviews;

use Illuminate\Foundation\Http\FormRequest;

class ReviewSimulationAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'teacher_note' => $this->input('teacher_note') ?: null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'teacher_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

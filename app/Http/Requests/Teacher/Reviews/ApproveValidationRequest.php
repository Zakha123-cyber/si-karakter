<?php

namespace App\Http\Requests\Teacher\Reviews;

use Illuminate\Foundation\Http\FormRequest;

class ApproveValidationRequest extends FormRequest
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
            'teacher_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

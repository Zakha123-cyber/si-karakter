<?php

namespace App\Http\Requests\Teacher\Warnings;

use Illuminate\Foundation\Http\FormRequest;

class ReviewWarningRequest extends FormRequest
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
            'resolution_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

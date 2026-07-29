<?php

namespace App\Http\Requests\Teacher\Reviews;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTranscriptRequest extends FormRequest
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
            'edited_text' => ['required', 'string', 'max:5000'],
        ];
    }
}

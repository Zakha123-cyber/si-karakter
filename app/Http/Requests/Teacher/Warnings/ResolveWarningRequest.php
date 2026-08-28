<?php

namespace App\Http\Requests\Teacher\Warnings;

use Illuminate\Foundation\Http\FormRequest;

class ResolveWarningRequest extends FormRequest
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
            'resolution_note' => ['required', 'string', 'max:2000'],
        ];
    }
}

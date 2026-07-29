<?php

namespace App\Http\Requests\Teacher\Reviews;

use Illuminate\Foundation\Http\FormRequest;

class OverrideValidationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'final_moral_level' => ['required', 'string', 'max:100'],
            'override_reason' => ['required', 'string', 'min:5', 'max:2000'],
            'final_indicators' => ['nullable', 'array'],
            'teacher_note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'override_reason.required' => 'Alasan override wajib diisi saat melakukan perubahan nilai.',
            'override_reason.min' => 'Alasan override minimal berisi 5 karakter.',
            'final_moral_level.required' => 'Tingkat moral akhir wajib dipilih.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Models\ScoringConfiguration;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScoringConfigurationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'test_weight' => ['required', 'numeric', 'min:0', 'max:100'],
            'observation_weight' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'effective_from' => ['required', 'date'],
            'effective_until' => ['nullable', 'date', 'after_or_equal:effective_from'],
        ];
    }

    public function messages(): array
    {
        return [
            'test_weight.max' => 'Bobot tes tidak boleh lebih dari 100.',
            'observation_weight.max' => 'Bobot observasi tidak boleh lebih dari 100.',
            'effective_until.after_or_equal' => 'Tanggal akhir harus setelah atau sama dengan tanggal mulai.',
        ];
    }
}

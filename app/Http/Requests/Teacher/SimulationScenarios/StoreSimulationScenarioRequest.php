<?php

namespace App\Http\Requests\Teacher\SimulationScenarios;

use Illuminate\Foundation\Http\FormRequest;

class StoreSimulationScenarioRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'opening_text' => ['required', 'string'],
            'status' => ['sometimes', 'string', 'in:draft,published,archived'],
        ];
    }
}

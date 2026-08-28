<?php

namespace App\Http\Requests\Teacher\SimulationScenarios;

use Illuminate\Foundation\Http\FormRequest;

class StoreSimulationOptionRequest extends FormRequest
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
            'text' => ['required', 'string'],
            'feedback_text' => ['nullable', 'string'],
            'score' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'reward_points' => ['sometimes', 'integer', 'min:0', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
        ];
    }
}

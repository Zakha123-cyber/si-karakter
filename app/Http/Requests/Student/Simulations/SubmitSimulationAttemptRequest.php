<?php

namespace App\Http\Requests\Student\Simulations;

use Illuminate\Foundation\Http\FormRequest;

class SubmitSimulationAttemptRequest extends FormRequest
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
            'selected_option_id' => ['required', 'integer', 'exists:simulation_options,id'],
        ];
    }
}

<?php

namespace App\Http\Requests\Teacher\MoralCases;

use App\Models\CharacterIndicator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignMoralCaseIndicatorsRequest extends FormRequest
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
            'indicators' => ['array'],
            'indicators.*.id' => ['required', 'integer', 'distinct', Rule::exists(CharacterIndicator::class, 'id')],
            'indicators.*.weight' => ['required', 'numeric', 'min:0.01', 'max:99.99'],
        ];
    }
}

<?php

namespace App\Http\Requests\Admin\EducationalContents;

use App\Models\CharacterIndicator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignEducationalContentIndicatorsRequest extends FormRequest
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
            'indicator_ids' => ['array'],
            'indicator_ids.*' => ['integer', 'distinct', Rule::exists(CharacterIndicator::class, 'id')],
        ];
    }
}

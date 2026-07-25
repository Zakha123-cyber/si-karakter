<?php

namespace App\Http\Requests;

use App\Enums\IndicatorCategory;
use App\Models\CharacterIndicator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCharacterIndicatorRequest extends FormRequest
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
        $indicator = $this->route('character_indicator');
        $indicatorId = $indicator instanceof CharacterIndicator ? $indicator->id : $this->route('id');

        return [
            'code' => ['required', 'string', 'max:255', Rule::unique(CharacterIndicator::class)->ignore($indicatorId)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', Rule::in(IndicatorCategory::values())],
            'is_warning_indicator' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

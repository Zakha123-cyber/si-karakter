<?php

namespace App\Http\Requests\Student\Contents;

use App\Enums\ContentEmotionResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContentInteractionRequest extends FormRequest
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
            'emotion_response' => ['required', Rule::in(ContentEmotionResponse::values())],
            'completed' => ['sometimes', 'boolean'],
        ];
    }
}

<?php

namespace App\Http\Requests\Teacher\MoralCases;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadMoralCaseMediaRequest extends FormRequest
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
            'type' => ['required', Rule::in(['image', 'audio'])],
            'media' => [
                'required',
                'file',
                Rule::when(
                    $this->input('type') === 'audio',
                    ['mimetypes:audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/ogg,video/ogg', 'max:10240'],
                    ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
                ),
            ],
        ];
    }
}

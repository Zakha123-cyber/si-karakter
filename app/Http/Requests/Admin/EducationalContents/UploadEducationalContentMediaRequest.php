<?php

namespace App\Http\Requests\Admin\EducationalContents;

use App\Enums\EducationalContentType;
use App\Models\EducationalContent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadEducationalContentMediaRequest extends FormRequest
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
            'type' => ['required', Rule::in(['media', 'thumbnail'])],
            'media' => [
                'required',
                'file',
                Rule::when(
                    $this->input('type') === 'thumbnail',
                    ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
                    $this->mediaRules(),
                ),
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function mediaRules(): array
    {
        $content = $this->route('educationalContent');
        $contentType = $content instanceof EducationalContent ? $content->content_type : null;

        return match ($contentType) {
            EducationalContentType::Video => ['mimetypes:video/mp4,video/webm,video/quicktime', 'max:51200'],
            EducationalContentType::Audio => ['mimetypes:audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/ogg,video/ogg', 'max:20480'],
            EducationalContentType::Image, EducationalContentType::Comic => ['image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            default => ['mimes:jpg,jpeg,png,webp,pdf,mp3,wav,ogg,mp4,webm', 'max:51200'],
        };
    }
}

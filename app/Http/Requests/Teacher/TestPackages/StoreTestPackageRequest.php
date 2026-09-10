<?php

namespace App\Http\Requests\Teacher\TestPackages;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class StoreTestPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'description' => $this->input('description') ?: null,
            'start_at' => $this->normalizeDateTime($this->input('start_at')),
            'end_at' => $this->normalizeDateTime($this->input('end_at')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'attempt_limit' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    private function normalizeDateTime(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            return Carbon::parse($value, config('app.display_timezone'))
                ->utc()
                ->toDateTimeString();
        } catch (\Throwable) {
            return (string) $value;
        }
    }
}

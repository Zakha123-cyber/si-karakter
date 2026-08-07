<?php

namespace App\Http\Requests\Teacher\Observations;

use App\Enums\ObservationSentiment;
use App\Enums\UserRole;
use App\Models\CharacterIndicator;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreObservationRequest extends FormRequest
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
            'student_id' => ['required', 'integer', Rule::exists(Student::class, 'id')],
            'teacher_id' => [
                'required',
                'integer',
                Rule::exists(User::class, 'id')->where(fn ($query) => $query
                    ->where('role', UserRole::Teacher->value)
                    ->where('is_active', true)),
            ],
            'observed_at' => ['required', 'date'],
            'general_note' => ['nullable', 'string', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.character_indicator_id' => ['required', 'integer', Rule::exists(CharacterIndicator::class, 'id')],
            'items.*.sentiment' => ['required', Rule::in(ObservationSentiment::values())],
            'items.*.assessment_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.reward_points' => ['required', 'integer', 'min:0', 'max:1000'],
            'items.*.note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

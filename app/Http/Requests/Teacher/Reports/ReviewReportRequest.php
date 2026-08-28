<?php

namespace App\Http\Requests\Teacher\Reports;

use Illuminate\Foundation\Http\FormRequest;

class ReviewReportRequest extends FormRequest
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
            'final_narrative' => ['required', 'string', 'max:10000'],
            'recommendation' => ['required', 'string', 'max:5000'],
        ];
    }
}

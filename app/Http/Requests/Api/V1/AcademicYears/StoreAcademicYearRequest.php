<?php

namespace App\Http\Requests\Api\V1\AcademicYears;

use App\Http\Requests\Api\BaseApiRequest;
use App\Models\AcademicYear;
use Illuminate\Validation\Rule;

class StoreAcademicYearRequest extends BaseApiRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

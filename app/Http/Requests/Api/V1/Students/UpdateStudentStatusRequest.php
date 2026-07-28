<?php

namespace App\Http\Requests\Api\V1\Students;

use App\Http\Requests\Api\BaseApiRequest;

class UpdateStudentStatusRequest extends BaseApiRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'max:30', \Illuminate\Validation\Rule::in(['active', 'inactive', 'graduated', 'transferred'])],
        ];
    }
}

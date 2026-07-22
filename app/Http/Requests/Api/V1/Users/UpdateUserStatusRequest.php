<?php

namespace App\Http\Requests\Api\V1\Users;

use App\Http\Requests\Api\BaseApiRequest;

class UpdateUserStatusRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
        ];
    }
}

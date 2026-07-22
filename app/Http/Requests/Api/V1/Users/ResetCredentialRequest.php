<?php

namespace App\Http\Requests\Api\V1\Users;

use App\Http\Requests\Api\BaseApiRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ResetCredentialRequest extends BaseApiRequest
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
            'type' => ['required', Rule::in(['password', 'pin'])],
            'value' => [
                'required',
                'string',
                Rule::when($this->input('type') === 'pin', ['digits_between:4,8'], [Password::defaults()]),
            ],
        ];
    }
}

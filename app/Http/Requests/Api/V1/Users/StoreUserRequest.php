<?php

namespace App\Http\Requests\Api\V1\Users;

use App\Enums\UserRole;
use App\Http\Requests\Api\BaseApiRequest;
use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends BaseApiRequest
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
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique(User::class)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(UserRole::values())],
            'is_active' => ['sometimes', 'boolean'],
            'pin_enabled' => ['sometimes', 'boolean'],
            'pin' => ['nullable', 'string', 'digits_between:4,8', 'required_if:pin_enabled,true'],
        ];
    }
}

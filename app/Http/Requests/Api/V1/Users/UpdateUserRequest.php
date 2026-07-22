<?php

namespace App\Http\Requests\Api\V1\Users;

use App\Enums\UserRole;
use App\Http\Requests\Api\BaseApiRequest;
use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends BaseApiRequest
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
        $routeUser = $this->route('user');
        $userId = $routeUser instanceof User ? $routeUser->id : null;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => ['sometimes', 'required', 'string', 'max:255', Rule::unique(User::class)->ignore($userId)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique(User::class)->ignore($userId)],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['sometimes', 'required', Rule::in(UserRole::values())],
            'is_active' => ['sometimes', 'boolean'],
            'pin_enabled' => ['sometimes', 'boolean'],
            'pin' => ['nullable', 'string', 'digits_between:4,8', 'required_if:pin_enabled,true'],
        ];
    }
}

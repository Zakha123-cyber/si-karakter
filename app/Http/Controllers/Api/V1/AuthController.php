<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ChangePasswordRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use RespondsWithApiResponse;

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()
            ->where('username', $request->string('username')->toString())
            ->first();

        if (! $user || ! $this->credentialMatches($user, $request->string('password')->toString())) {
            return $this->error('Invalid credentials', [
                'username' => ['Username or password is invalid.'],
            ], 422);
        }

        if (! $user->is_active) {
            return $this->error('Account is inactive', [
                'username' => ['This account is inactive.'],
            ], 403);
        }

        Auth::guard('web')->login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return $this->success('Login successful', [
            'user' => new UserResource($user->refresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->success('Logout successful');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success('Current user retrieved', [
            'user' => new UserResource($request->user()),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $request->user()->forceFill([
            'password' => $request->string('password')->toString(),
        ])->save();

        return $this->success('Password changed successfully');
    }

    private function credentialMatches(User $user, string $password): bool
    {
        if (Hash::check($password, $user->password)) {
            return true;
        }

        return $user->role === UserRole::Student
            && $user->pin_enabled
            && $user->pin !== null
            && Hash::check($password, $user->pin);
    }
}

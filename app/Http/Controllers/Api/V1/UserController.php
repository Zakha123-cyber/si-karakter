<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Users\ResetCredentialRequest;
use App\Http\Requests\Api\V1\Users\StoreUserRequest;
use App\Http\Requests\Api\V1\Users\UpdateUserRequest;
use App\Http\Requests\Api\V1\Users\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->string('role')->toString() !== '', fn ($query) => $query->where('role', $request->string('role')->toString()))
            ->latest()
            ->paginate(min($request->integer('per_page', 15), 100));

        return $this->success('Users retrieved', UserResource::collection($users));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::query()->create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'] ?? null,
            'password' => $data['password'],
            'role' => $data['role'],
            'is_active' => $data['is_active'] ?? true,
            'pin_enabled' => $data['pin_enabled'] ?? false,
            'pin' => $data['pin'] ?? null,
        ]);

        return $this->success('User created', [
            'user' => new UserResource($user),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return $this->success('User retrieved', [
            'user' => new UserResource($user),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (($data['password'] ?? null) === null) {
            unset($data['password']);
        }

        if (($data['pin'] ?? null) === null) {
            unset($data['pin']);
        }

        $user->update($data);

        return $this->success('User updated', [
            'user' => new UserResource($user->refresh()),
        ]);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $user->forceFill([
            'is_active' => $request->boolean('is_active'),
        ])->save();

        return $this->success('User status updated', [
            'user' => new UserResource($user->refresh()),
        ]);
    }

    public function resetCredential(ResetCredentialRequest $request, User $user): JsonResponse
    {
        if ($request->string('type')->toString() === 'pin') {
            $user->forceFill([
                'pin' => $request->string('value')->toString(),
                'pin_enabled' => true,
            ])->save();

            return $this->success('PIN reset successfully');
        }

        $user->forceFill([
            'password' => $request->string('value')->toString(),
        ])->save();

        return $this->success('Password reset successfully');
    }
}

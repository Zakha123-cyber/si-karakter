<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
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
            ->orderBy('role')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role->value,
                'pin_enabled' => $user->pin_enabled,
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at?->toISOString(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'role' => $request->string('role')->toString(),
            ],
            'roles' => UserRole::values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique(User::class)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(UserRole::values())],
            'pin_enabled' => ['sometimes', 'boolean'],
            'pin' => ['nullable', 'string', 'digits_between:4,8', 'required_if:pin_enabled,true'],
        ]);

        User::query()->create([
            ...$data,
            'pin_enabled' => $request->boolean('pin_enabled'),
            'is_active' => true,
        ]);

        return back()->with('status', 'User berhasil dibuat.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'role' => ['required', Rule::in(UserRole::values())],
            'pin_enabled' => ['sometimes', 'boolean'],
        ]);

        $user->forceFill([
            ...$data,
            'pin_enabled' => $request->boolean('pin_enabled'),
        ])->save();

        return back()->with('status', 'User berhasil diperbarui.');
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user->forceFill($data)->save();

        return back()->with('status', 'Status user berhasil diperbarui.');
    }

    public function resetCredential(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['password', 'pin'])],
            'value' => [
                'required',
                'string',
                Rule::when($request->input('type') === 'pin', ['digits_between:4,8'], [Password::defaults()]),
            ],
        ]);

        if ($data['type'] === 'pin') {
            $user->forceFill([
                'pin' => $data['value'],
                'pin_enabled' => true,
            ])->save();
        } else {
            $user->forceFill([
                'password' => $data['value'],
            ])->save();
        }

        return back()->with('status', 'Kredensial berhasil direset.');
    }
}

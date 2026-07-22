<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('non admin cannot access user management', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->getJson('/api/v1/users');

    $response
        ->assertForbidden()
        ->assertJsonPath('success', false);
});

test('admin can create user', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->postJson('/api/v1/users', [
        'name' => 'Santri Test',
        'username' => 'santri-test',
        'email' => null,
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'student',
        'pin_enabled' => true,
        'pin' => '1234',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.username', 'santri-test')
        ->assertJsonPath('data.user.role', 'student');

    $user = User::query()->where('username', 'santri-test')->firstOrFail();

    expect($user->pin_enabled)->toBeTrue()
        ->and(Hash::check('1234', $user->pin))->toBeTrue();
});

test('admin can update user status', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->teacher()->create();

    $response = $this->actingAs($admin)->patchJson("/api/v1/users/{$user->id}/status", [
        'is_active' => false,
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.is_active', false);

    expect($user->refresh()->is_active)->toBeFalse();
});

test('admin can reset user password', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->teacher()->create();

    $response = $this->actingAs($admin)->postJson("/api/v1/users/{$user->id}/reset-credential", [
        'type' => 'password',
        'value' => 'replacement-password',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true);

    expect(Hash::check('replacement-password', $user->refresh()->password))->toBeTrue();
});

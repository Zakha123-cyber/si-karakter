<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('user can login with username and password', function () {
    $user = User::factory()->create([
        'username' => 'ustadz01',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'username' => 'ustadz01',
        'password' => 'password',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.username', 'ustadz01');

    expect($user->refresh()->last_login_at)->not->toBeNull();
    $this->assertAuthenticatedAs($user);
});

test('student can login with enabled pin', function () {
    $student = User::factory()->withPin('1234')->create([
        'username' => 'santri01',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'username' => 'santri01',
        'password' => '1234',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.role', 'student');

    $this->assertAuthenticatedAs($student);
});

test('inactive user cannot login', function () {
    User::factory()->inactive()->create([
        'username' => 'inactive-user',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'username' => 'inactive-user',
        'password' => 'password',
    ]);

    $response
        ->assertForbidden()
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Account is inactive');

    $this->assertGuest();
});

test('authenticated user can view current profile', function () {
    $user = User::factory()->create([
        'username' => 'current-user',
    ]);

    $response = $this->actingAs($user)->getJson('/api/v1/auth/me');

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.username', 'current-user');
});

test('authenticated user can change password', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/v1/auth/change-password', [
        'current_password' => 'password',
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true);

    expect(Hash::check('new-secure-password', $user->refresh()->password))->toBeTrue();
});

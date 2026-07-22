<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can view user management page', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();
    User::factory()->student()->create([
        'username' => 'santri-ui',
    ]);

    $response = $this->actingAs($admin)->get('/admin/users');

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 2)
            ->where('roles.0', 'admin')
        );
});

test('teacher cannot view user management page', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->get('/admin/users');

    $response->assertForbidden();
});

test('admin can create user from user management page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/users', [
        'name' => 'Santri UI',
        'username' => 'santri-ui-create',
        'email' => null,
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'student',
        'pin_enabled' => '1',
        'pin' => '1234',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'username' => 'santri-ui-create',
        'role' => 'student',
        'pin_enabled' => true,
        'is_active' => true,
    ]);
});

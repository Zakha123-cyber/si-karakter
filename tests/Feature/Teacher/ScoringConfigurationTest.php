<?php

use App\Models\ScoringConfiguration;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('non teacher cannot view scoring configurations page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get('/teacher/scoring-configurations');

    $response->assertForbidden();
});

test('unauthenticated user cannot view scoring configurations page', function () {
    $response = $this->get('/teacher/scoring-configurations');

    $response->assertRedirect('/login');
});

test('teacher can view scoring configurations index page', function () {
    $this->withoutVite();

    $teacher = User::factory()->teacher()->create();
    ScoringConfiguration::factory()->create(['name' => 'Bobot Default']);

    $response = $this->actingAs($teacher)->get('/teacher/scoring-configurations');

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/scoring-configurations/index')
            ->has('configurations.data')
        );
});

test('teacher can create scoring configuration', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->post('/teacher/scoring-configurations', [
        'name' => 'Bobot Semester Ganjil',
        'test_weight' => 60,
        'observation_weight' => 40,
        'is_active' => true,
        'effective_from' => '2026-07-01',
        'effective_until' => null,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('scoring_configurations', [
        'name' => 'Bobot Semester Ganjil',
        'test_weight' => '60.00',
        'observation_weight' => '40.00',
        'is_active' => true,
        'created_by' => $teacher->id,
    ]);
});

test('only one scoring configuration can be active at a time', function () {
    $teacher = User::factory()->teacher()->create();
    ScoringConfiguration::factory()->active()->create(['name' => 'Config Lama']);

    $this->actingAs($teacher)->post('/teacher/scoring-configurations', [
        'name' => 'Config Baru',
        'test_weight' => 70,
        'observation_weight' => 30,
        'is_active' => true,
        'effective_from' => '2026-08-01',
    ]);

    expect(ScoringConfiguration::where('is_active', true)->count())->toBe(1)
        ->and(ScoringConfiguration::where('name', 'Config Baru')->where('is_active', true)->exists())->toBeTrue();
});

test('teacher can update scoring configuration', function () {
    $teacher = User::factory()->teacher()->create();
    $config = ScoringConfiguration::factory()->create(['name' => 'Bobot Lama']);

    $response = $this->actingAs($teacher)->put("/teacher/scoring-configurations/{$config->id}", [
        'name' => 'Bobot Baru',
        'test_weight' => 55,
        'observation_weight' => 45,
        'is_active' => true,
        'effective_from' => '2026-07-01',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('scoring_configurations', [
        'id' => $config->id,
        'name' => 'Bobot Baru',
        'test_weight' => '55.00',
        'observation_weight' => '45.00',
    ]);
});

test('teacher can delete scoring configuration', function () {
    $teacher = User::factory()->teacher()->create();
    $config = ScoringConfiguration::factory()->create();

    $response = $this->actingAs($teacher)->delete("/teacher/scoring-configurations/{$config->id}");

    $response->assertRedirect();

    $this->assertDatabaseMissing('scoring_configurations', [
        'id' => $config->id,
    ]);
});

test('scoring configuration validation rejects invalid weights', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->post('/teacher/scoring-configurations', [
        'name' => 'Bobot Salah',
        'test_weight' => 150,
        'observation_weight' => 40,
        'is_active' => true,
        'effective_from' => '2026-07-01',
    ]);

    $response->assertSessionHasErrors('test_weight');
    $this->assertDatabaseMissing('scoring_configurations', [
        'name' => 'Bobot Salah',
    ]);
});

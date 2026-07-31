<?php

use App\Models\ScoringConfiguration;
use App\Models\User;

test('api non teacher cannot access scoring configurations', function () {
    $student = User::factory()->student()->create();

    $response = $this->actingAs($student)->getJson('/api/v1/scoring-configurations');

    $response->assertForbidden();
});

test('api teacher can list scoring configurations', function () {
    $teacher = User::factory()->teacher()->create();
    ScoringConfiguration::factory()->create(['name' => 'Bobot API']);

    $response = $this->actingAs($teacher)->getJson('/api/v1/scoring-configurations');

    $response->assertOk()
        ->assertJsonPath('data.data.0.name', 'Bobot API');
});

test('api teacher can create scoring configuration', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->postJson('/api/v1/scoring-configurations', [
        'name' => 'Bobot API Baru',
        'test_weight' => 60,
        'observation_weight' => 40,
        'is_active' => true,
        'effective_from' => '2026-07-01',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.configuration.name', 'Bobot API Baru')
        ->assertJsonPath('data.configuration.test_weight', '60.00');

    $this->assertDatabaseHas('scoring_configurations', [
        'name' => 'Bobot API Baru',
        'created_by' => $teacher->id,
    ]);
});

test('api teacher can show scoring configuration', function () {
    $teacher = User::factory()->teacher()->create();
    $config = ScoringConfiguration::factory()->create(['name' => 'Bobot Detail']);

    $response = $this->actingAs($teacher)->getJson("/api/v1/scoring-configurations/{$config->id}");

    $response->assertOk()
        ->assertJsonPath('data.configuration.name', 'Bobot Detail');
});

test('api teacher can update scoring configuration', function () {
    $teacher = User::factory()->teacher()->create();
    $config = ScoringConfiguration::factory()->create(['name' => 'Bobot Lama']);

    $response = $this->actingAs($teacher)->putJson("/api/v1/scoring-configurations/{$config->id}", [
        'name' => 'Bobot Update',
        'test_weight' => 50,
        'observation_weight' => 50,
        'is_active' => false,
        'effective_from' => '2026-07-01',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.configuration.name', 'Bobot Update');

    $this->assertDatabaseHas('scoring_configurations', [
        'id' => $config->id,
        'test_weight' => '50.00',
        'observation_weight' => '50.00',
    ]);
});

test('api teacher can delete scoring configuration', function () {
    $teacher = User::factory()->teacher()->create();
    $config = ScoringConfiguration::factory()->create();

    $response = $this->actingAs($teacher)->deleteJson("/api/v1/scoring-configurations/{$config->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('scoring_configurations', [
        'id' => $config->id,
    ]);
});

test('api validates scoring configuration weights', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->postJson('/api/v1/scoring-configurations', [
        'name' => 'Bobot Salah',
        'test_weight' => 200,
        'observation_weight' => 40,
        'is_active' => true,
        'effective_from' => '2026-07-01',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('test_weight');
});

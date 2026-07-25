<?php

use App\Models\CharacterIndicator;
use App\Models\User;

test('unauthenticated user cannot access character indicators API', function () {
    $response = $this->getJson('/api/v1/character-indicators');

    $response->assertUnauthorized();
});

test('authenticated user can list character indicators API', function () {
    $user = User::factory()->create();
    CharacterIndicator::factory()->count(3)->create();

    $response = $this->actingAs($user)->getJson('/api/v1/character-indicators');

    $response
        ->assertOk()
        ->assertJsonPath('success', true);
});

test('authenticated user can create character indicator API', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/v1/character-indicators', [
        'code' => 'api_honesty',
        'name' => 'API Kejujuran',
        'description' => 'Deskripsi API',
        'category' => 'moral_reasoning',
        'is_warning_indicator' => false,
        'is_active' => true,
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.indicator.code', 'api_honesty');

    $this->assertDatabaseHas('character_indicators', [
        'code' => 'api_honesty',
    ]);
});

test('authenticated user can show single character indicator API', function () {
    $user = User::factory()->create();
    $indicator = CharacterIndicator::factory()->create();

    $response = $this->actingAs($user)->getJson("/api/v1/character-indicators/{$indicator->id}");

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.indicator.id', $indicator->id);
});

test('authenticated user can update character indicator API', function () {
    $user = User::factory()->create();
    $indicator = CharacterIndicator::factory()->create(['code' => 'old_api_code']);

    $response = $this->actingAs($user)->putJson("/api/v1/character-indicators/{$indicator->id}", [
        'code' => 'new_api_code',
        'name' => 'Nama API Baru',
        'description' => 'Updated via API',
        'category' => 'social',
        'is_warning_indicator' => true,
        'is_active' => true,
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.indicator.code', 'new_api_code');

    $this->assertDatabaseHas('character_indicators', [
        'id' => $indicator->id,
        'code' => 'new_api_code',
    ]);
});

test('authenticated user can delete character indicator API', function () {
    $user = User::factory()->create();
    $indicator = CharacterIndicator::factory()->create();

    $response = $this->actingAs($user)->deleteJson("/api/v1/character-indicators/{$indicator->id}");

    $response
        ->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseMissing('character_indicators', [
        'id' => $indicator->id,
    ]);
});

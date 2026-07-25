<?php

use App\Models\CharacterIndicator;
use App\Models\User;

test('non-admin cannot access character indicators API', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->getJson('/api/v1/character-indicators');

    $response
        ->assertForbidden()
        ->assertJsonPath('success', false);
});

test('admin can list character indicators API', function () {
    $admin = User::factory()->admin()->create();
    CharacterIndicator::factory()->count(3)->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/character-indicators');

    $response
        ->assertOk()
        ->assertJsonPath('success', true);
});

test('admin can create character indicator API', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->postJson('/api/v1/character-indicators', [
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

test('admin can show single character indicator API', function () {
    $admin = User::factory()->admin()->create();
    $indicator = CharacterIndicator::factory()->create();

    $response = $this->actingAs($admin)->getJson("/api/v1/character-indicators/{$indicator->id}");

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.indicator.id', $indicator->id);
});

test('admin can update character indicator API', function () {
    $admin = User::factory()->admin()->create();
    $indicator = CharacterIndicator::factory()->create(['code' => 'old_api_code']);

    $response = $this->actingAs($admin)->putJson("/api/v1/character-indicators/{$indicator->id}", [
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

test('admin can delete character indicator API', function () {
    $admin = User::factory()->admin()->create();
    $indicator = CharacterIndicator::factory()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/v1/character-indicators/{$indicator->id}");

    $response
        ->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseMissing('character_indicators', [
        'id' => $indicator->id,
    ]);
});

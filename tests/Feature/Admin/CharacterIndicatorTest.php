<?php

use App\Models\CharacterIndicator;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can view character indicators index page', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();
    CharacterIndicator::factory()->create(['name' => 'Indikator Test', 'code' => 'test_code']);

    $response = $this->actingAs($admin)->get('/admin/character-indicators');

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/character-indicators/index')
            ->has('indicators.data')
        );
});

test('non-admin cannot view character indicators page', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->get('/admin/character-indicators');

    $response->assertForbidden();
});

test('admin can create character indicator', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/character-indicators', [
        'code' => 'honesty_test',
        'name' => 'Kejujuran Test',
        'description' => 'Deskripsi indikator kejujuran',
        'category' => 'moral_reasoning',
        'is_warning_indicator' => false,
        'is_active' => true,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('character_indicators', [
        'code' => 'honesty_test',
        'name' => 'Kejujuran Test',
        'category' => 'moral_reasoning',
        'is_warning_indicator' => false,
        'is_active' => true,
    ]);
});

test('admin can update character indicator', function () {
    $admin = User::factory()->admin()->create();
    $indicator = CharacterIndicator::factory()->create([
        'code' => 'old_code',
        'name' => 'Nama Lama',
    ]);

    $response = $this->actingAs($admin)->put("/admin/character-indicators/{$indicator->id}", [
        'code' => 'updated_code',
        'name' => 'Nama Baru',
        'description' => 'Deskripsi diperbarui',
        'category' => 'social',
        'is_warning_indicator' => true,
        'is_active' => true,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('character_indicators', [
        'id' => $indicator->id,
        'code' => 'updated_code',
        'name' => 'Nama Baru',
        'is_warning_indicator' => true,
    ]);
});

test('admin can toggle character indicator status', function () {
    $admin = User::factory()->admin()->create();
    $indicator = CharacterIndicator::factory()->create(['is_active' => true]);

    $response = $this->actingAs($admin)->patch("/admin/character-indicators/{$indicator->id}/status", [
        'is_active' => false,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('character_indicators', [
        'id' => $indicator->id,
        'is_active' => false,
    ]);
});

test('admin can delete character indicator', function () {
    $admin = User::factory()->admin()->create();
    $indicator = CharacterIndicator::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/character-indicators/{$indicator->id}");

    $response->assertRedirect();

    $this->assertDatabaseMissing('character_indicators', [
        'id' => $indicator->id,
    ]);
});

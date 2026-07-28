<?php

use App\Models\CharacterIndicator;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('non teacher cannot view character indicators page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get('/teacher/character-indicators');

    $response->assertForbidden();
});

test('teacher can view character indicators index page', function () {
    $this->withoutVite();

    $teacher = User::factory()->teacher()->create();
    CharacterIndicator::factory()->create(['name' => 'Indikator Test', 'code' => 'test_code']);

    $response = $this->actingAs($teacher)->get('/teacher/character-indicators');

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/character-indicators/index')
            ->has('indicators.data')
        );
});

test('unauthenticated user cannot view character indicators page', function () {
    $response = $this->get('/teacher/character-indicators');

    $response->assertRedirect('/login');
});

test('teacher can create character indicator', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->post('/teacher/character-indicators', [
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

test('teacher can update character indicator', function () {
    $teacher = User::factory()->teacher()->create();
    $indicator = CharacterIndicator::factory()->create([
        'code' => 'old_code',
        'name' => 'Nama Lama',
    ]);

    $response = $this->actingAs($teacher)->put("/teacher/character-indicators/{$indicator->id}", [
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

test('teacher can toggle character indicator status', function () {
    $teacher = User::factory()->teacher()->create();
    $indicator = CharacterIndicator::factory()->create(['is_active' => true]);

    $response = $this->actingAs($teacher)->patch("/teacher/character-indicators/{$indicator->id}/status", [
        'is_active' => false,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('character_indicators', [
        'id' => $indicator->id,
        'is_active' => false,
    ]);
});

test('teacher can delete character indicator', function () {
    $teacher = User::factory()->teacher()->create();
    $indicator = CharacterIndicator::factory()->create();

    $response = $this->actingAs($teacher)->delete("/teacher/character-indicators/{$indicator->id}");

    $response->assertRedirect();

    $this->assertDatabaseMissing('character_indicators', [
        'id' => $indicator->id,
    ]);
});

test('character indicator scopes filter warning and normal indicators correctly', function () {
    CharacterIndicator::factory()->create(['is_warning_indicator' => true, 'code' => 'warn_1']);
    CharacterIndicator::factory()->create(['is_warning_indicator' => false, 'code' => 'norm_1']);

    expect(CharacterIndicator::warning()->count())->toBe(1)
        ->and(CharacterIndicator::normal()->count())->toBe(1);
});

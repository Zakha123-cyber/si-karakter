<?php

use App\Models\AcademicYear;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin can list academic years', function () {
    AcademicYear::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->getJson('/api/v1/academic-years');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(3, 'data.data');
});

test('admin can create academic year', function () {
    $response = $this->actingAs($this->admin)->postJson('/api/v1/academic-years', [
        'name' => '2026/2027',
        'start_date' => '2026-07-01',
        'end_date' => '2027-06-30',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.academic_year.name', '2026/2027');

    $this->assertDatabaseHas('academic_years', ['name' => '2026/2027']);
});

test('admin can view academic year', function () {
    $year = AcademicYear::factory()->create(['name' => '2026/2027']);

    $response = $this->actingAs($this->admin)->getJson("/api/v1/academic-years/{$year->id}");

    $response->assertOk()
        ->assertJsonPath('data.academic_year.name', '2026/2027');
});

test('admin can update academic year', function () {
    $year = AcademicYear::factory()->create();

    $response = $this->actingAs($this->admin)->putJson("/api/v1/academic-years/{$year->id}", [
        'name' => 'Updated Year',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.academic_year.name', 'Updated Year');
});

test('admin can delete academic year without groups', function () {
    $year = AcademicYear::factory()->create();

    $response = $this->actingAs($this->admin)->deleteJson("/api/v1/academic-years/{$year->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('academic_years', ['id' => $year->id]);
});

test('admin cannot delete academic year with groups', function () {
    $year = AcademicYear::factory()->hasGroups(1)->create();

    $response = $this->actingAs($this->admin)->deleteJson("/api/v1/academic-years/{$year->id}");

    $response->assertStatus(409);
    $this->assertDatabaseHas('academic_years', ['id' => $year->id]);
});

test('admin can activate academic year', function () {
    $year = AcademicYear::factory()->create(['is_active' => false]);

    $response = $this->actingAs($this->admin)->patchJson("/api/v1/academic-years/{$year->id}/activate");

    $response->assertOk();
    $this->assertTrue($year->refresh()->is_active);
});

test('activating a year deactivates others', function () {
    $year1 = AcademicYear::factory()->create(['is_active' => true]);
    $year2 = AcademicYear::factory()->create(['is_active' => false]);

    $this->actingAs($this->admin)->patchJson("/api/v1/academic-years/{$year2->id}/activate");

    expect($year1->refresh()->is_active)->toBeFalse();
    expect($year2->refresh()->is_active)->toBeTrue();
});

test('unauthenticated user cannot access academic years', function () {
    $response = $this->getJson('/api/v1/academic-years');
    $response->assertUnauthorized();
});

test('non-admin cannot manage academic years', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->postJson('/api/v1/academic-years', [
        'name' => 'Test',
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
    ]);

    $response->assertForbidden();
});

test('validation fails when creating academic year with missing fields', function () {
    $response = $this->actingAs($this->admin)->postJson('/api/v1/academic-years', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'start_date', 'end_date']);
});

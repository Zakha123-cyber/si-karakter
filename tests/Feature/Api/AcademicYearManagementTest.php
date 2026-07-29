<?php

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\User;

test('non admin cannot access academic years', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->getJson('/api/v1/academic-years');

    $response->assertForbidden();
});

test('admin can create academic year', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->postJson('/api/v1/academic-years', [
        'name' => '2024/2025',
        'start_date' => '2024-07-01',
        'end_date' => '2025-06-30',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.academic_year.name', '2024/2025');
});

test('admin can list academic years', function () {
    $admin = User::factory()->admin()->create();
    AcademicYear::factory()->count(3)->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/academic-years');

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'data' => [
                'data' => [],
                'meta' => [],
            ],
        ]);
});

test('admin can view single academic year', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->create();

    $response = $this->actingAs($admin)->getJson("/api/v1/academic-years/{$academicYear->id}");

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.academic_year.id', $academicYear->id);
});

test('admin can update academic year', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->create();

    $response = $this->actingAs($admin)->putJson("/api/v1/academic-years/{$academicYear->id}", [
        'name' => '2025/2026',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.academic_year.name', '2025/2026');
});

test('admin can activate academic year', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->create();

    $response = $this->actingAs($admin)->patchJson("/api/v1/academic-years/{$academicYear->id}/activate");

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.academic_year.is_active', true);

    expect($academicYear->refresh()->is_active)->toBeTrue();
});

test('activating a year deactivates others', function () {
    $admin = User::factory()->admin()->create();
    $year1 = AcademicYear::factory()->active()->create();
    $year2 = AcademicYear::factory()->create();

    $this->actingAs($admin)->patchJson("/api/v1/academic-years/{$year2->id}/activate");

    expect($year1->refresh()->is_active)->toBeFalse()
        ->and($year2->refresh()->is_active)->toBeTrue();
});

test('cannot delete academic year with existing groups', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->active()->create();
    Group::factory()->create(['academic_year_id' => $academicYear->id]);

    $response = $this->actingAs($admin)->deleteJson("/api/v1/academic-years/{$academicYear->id}");

    $response->assertStatus(409);
});

test('can delete academic year without groups', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/v1/academic-years/{$academicYear->id}");

    $response->assertOk();
});

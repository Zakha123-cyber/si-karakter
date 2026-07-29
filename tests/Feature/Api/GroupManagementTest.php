<?php

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;

test('non admin cannot access groups', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->getJson('/api/v1/groups');

    $response->assertForbidden();
});

test('admin can create group', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($admin)->postJson('/api/v1/groups', [
        'academic_year_id' => $academicYear->id,
        'name' => 'Kelompok A',
        'teacher_id' => $teacher->id,
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.group.name', 'Kelompok A');
});

test('admin can list groups', function () {
    $admin = User::factory()->admin()->create();
    Group::factory()->count(3)->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/groups');

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

test('admin can view single group', function () {
    $admin = User::factory()->admin()->create();
    $group = Group::factory()->create();

    $response = $this->actingAs($admin)->getJson("/api/v1/groups/{$group->id}");

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.group.id', $group->id);
});

test('admin can update group', function () {
    $admin = User::factory()->admin()->create();
    $group = Group::factory()->create();

    $response = $this->actingAs($admin)->putJson("/api/v1/groups/{$group->id}", [
        'name' => 'Kelompok Updated',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.group.name', 'Kelompok Updated');
});

test('cannot delete group with existing students', function () {
    $admin = User::factory()->admin()->create();
    $group = Group::factory()->create();
    Student::factory()->create(['current_group_id' => $group->id]);

    $response = $this->actingAs($admin)->deleteJson("/api/v1/groups/{$group->id}");

    $response->assertStatus(409);
});

test('can delete empty group', function () {
    $admin = User::factory()->admin()->create();
    $group = Group::factory()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/v1/groups/{$group->id}");

    $response->assertOk();
});

test('admin can assign students to group', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->active()->create();
    $group = Group::factory()->create(['academic_year_id' => $academicYear->id]);
    $students = Student::factory()->count(3)->create();

    $response = $this->actingAs($admin)->postJson("/api/v1/groups/{$group->id}/students", [
        'student_ids' => $students->pluck('id')->toArray(),
    ]);

    $response->assertOk();

    foreach ($students->fresh() as $student) {
        expect($student->current_group_id)->toBe($group->id);
    }
});

test('admin can remove student from group', function () {
    $admin = User::factory()->admin()->create();
    $group = Group::factory()->create();
    $student = Student::factory()->create(['current_group_id' => $group->id]);

    $response = $this->actingAs($admin)->deleteJson("/api/v1/groups/{$group->id}/students/{$student->id}");

    $response->assertOk();
    expect($student->fresh()->current_group_id)->toBeNull();
});

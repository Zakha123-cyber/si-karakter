<?php

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;

test('non admin cannot access students', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->getJson('/api/v1/students');

    $response->assertForbidden();
});

test('admin can create student', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->student()->create();

    $response = $this->actingAs($admin)->postJson('/api/v1/students', [
        'user_id' => $user->id,
        'student_code' => 'STR-00001',
        'gender' => 'male',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.student.student_code', 'STR-00001');
});

test('admin can list students', function () {
    $admin = User::factory()->admin()->create();
    Student::factory()->count(3)->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/students');

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

test('admin can view single student', function () {
    $admin = User::factory()->admin()->create();
    $student = Student::factory()->create();

    $response = $this->actingAs($admin)->getJson("/api/v1/students/{$student->id}");

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.student.id', $student->id);
});

test('admin can update student', function () {
    $admin = User::factory()->admin()->create();
    $student = Student::factory()->create();

    $response = $this->actingAs($admin)->putJson("/api/v1/students/{$student->id}", [
        'student_code' => 'STR-UPDATED',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.student.student_code', 'STR-UPDATED');
});

test('admin can update student status', function () {
    $admin = User::factory()->admin()->create();
    $student = Student::factory()->create(['status' => 'active']);

    $response = $this->actingAs($admin)->patchJson("/api/v1/students/{$student->id}/status", [
        'status' => 'inactive',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.student.status', 'inactive');

    expect($student->refresh()->status)->toBe('inactive');
});

test('admin can view student group timeline', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->active()->create();
    $group = Group::factory()->create(['academic_year_id' => $academicYear->id]);
    $student = Student::factory()->create(['current_group_id' => $group->id]);

    \App\Models\GroupStudentHistory::factory()->create([
        'student_id' => $student->id,
        'group_id' => $group->id,
        'academic_year_id' => $academicYear->id,
        'joined_at' => now()->toDateString(),
    ]);

    $response = $this->actingAs($admin)->getJson("/api/v1/students/{$student->id}/timeline");

    $response
        ->assertOk()
        ->assertJsonPath('success', true);
});

test('student code must be unique', function () {
    $admin = User::factory()->admin()->create();
    $user1 = User::factory()->student()->create();
    $user2 = User::factory()->student()->create();

    Student::factory()->create([
        'user_id' => $user1->id,
        'student_code' => 'STR-99999',
    ]);

    $response = $this->actingAs($admin)->postJson('/api/v1/students', [
        'user_id' => $user2->id,
        'student_code' => 'STR-99999',
    ]);

    $response->assertStatus(422);
});

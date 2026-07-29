<?php

use App\Models\GroupStudentHistory;
use App\Models\Student;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin can list students', function () {
    Student::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->getJson('/api/v1/students');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(3, 'data.data');
});

test('admin can create student', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin)->postJson('/api/v1/students', [
        'user_id' => $user->id,
        'student_code' => 'STU-001',
        'status' => 'active',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.student.student_code', 'STU-001');

    $this->assertDatabaseHas('students', ['student_code' => 'STU-001']);
});

test('admin can view student with timeline', function () {
    $student = Student::factory()->create();
    GroupStudentHistory::factory()->count(2)->create([
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($this->admin)->getJson("/api/v1/students/{$student->id}");

    $response->assertOk()
        ->assertJsonPath('data.student.id', $student->id)
        ->assertJsonCount(2, 'data.timeline');
});

test('admin can update student', function () {
    $student = Student::factory()->create();

    $response = $this->actingAs($this->admin)->putJson("/api/v1/students/{$student->id}", [
        'student_code' => 'STU-UPDATED',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.student.student_code', 'STU-UPDATED');
});

test('admin can update student status', function () {
    $student = Student::factory()->create(['status' => 'active']);

    $response = $this->actingAs($this->admin)->patchJson("/api/v1/students/{$student->id}/status", [
        'status' => 'graduated',
    ]);

    $response->assertOk();
    expect($student->refresh()->status)->toBe('graduated');
});

test('admin can view student timeline', function () {
    $student = Student::factory()->create();
    GroupStudentHistory::factory()->count(3)->create([
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($this->admin)->getJson("/api/v1/students/{$student->id}/timeline");

    $response->assertOk()
        ->assertJsonCount(3, 'data.timeline');
});

test('unauthenticated user cannot access students', function () {
    $response = $this->getJson('/api/v1/students');
    $response->assertUnauthorized();
});

test('student code must be unique', function () {
    Student::factory()->create(['student_code' => 'STU-001']);

    $user = User::factory()->create();

    $response = $this->actingAs($this->admin)->postJson('/api/v1/students', [
        'user_id' => $user->id,
        'student_code' => 'STU-001',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['student_code']);
});

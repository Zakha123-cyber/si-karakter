<?php

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\Student;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin can list groups', function () {
    Group::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)->getJson('/api/v1/groups');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(3, 'data.data');
});

test('admin can create group', function () {
    $academicYear = AcademicYear::factory()->create();

    $response = $this->actingAs($this->admin)->postJson('/api/v1/groups', [
        'academic_year_id' => $academicYear->id,
        'name' => 'Kelas 1A',
        'description' => 'Kelas 1 kelompok A',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.group.name', 'Kelas 1A');

    $this->assertDatabaseHas('groups', ['name' => 'Kelas 1A']);
});

test('admin can view group with students', function () {
    $group = Group::factory()->hasStudents(2)->create();

    $response = $this->actingAs($this->admin)->getJson("/api/v1/groups/{$group->id}");

    $response->assertOk()
        ->assertJsonPath('data.group.name', $group->name)
        ->assertJsonCount(2, 'data.students');
});

test('admin can update group', function () {
    $group = Group::factory()->create();

    $response = $this->actingAs($this->admin)->putJson("/api/v1/groups/{$group->id}", [
        'name' => 'Updated Group',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.group.name', 'Updated Group');
});

test('admin can delete group without students', function () {
    $group = Group::factory()->create();

    $response = $this->actingAs($this->admin)->deleteJson("/api/v1/groups/{$group->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('groups', ['id' => $group->id]);
});

test('admin cannot delete group with students', function () {
    $group = Group::factory()->hasStudents(1)->create();

    $response = $this->actingAs($this->admin)->deleteJson("/api/v1/groups/{$group->id}");

    $response->assertStatus(409);
    $this->assertDatabaseHas('groups', ['id' => $group->id]);
});

test('admin can assign student to group', function () {
    AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create();
    $student = Student::factory()->create();

    $response = $this->actingAs($this->admin)->postJson("/api/v1/groups/{$group->id}/students", [
        'student_id' => $student->id,
    ]);

    $response->assertOk();

    expect($student->refresh()->current_group_id)->toBe($group->id);
    $this->assertDatabaseHas('group_student_histories', [
        'student_id' => $student->id,
        'group_id' => $group->id,
    ]);
});

test('admin can remove student from group', function () {
    $group = Group::factory()->create();
    $student = Student::factory()->create(['current_group_id' => $group->id]);

    GroupStudentHistory::factory()->create([
        'student_id' => $student->id,
        'group_id' => $group->id,
        'left_at' => null,
    ]);

    $response = $this->actingAs($this->admin)->deleteJson("/api/v1/groups/{$group->id}/students/{$student->id}");

    $response->assertOk();
    expect($student->refresh()->current_group_id)->toBeNull();
});

test('unauthenticated user cannot access groups', function () {
    $response = $this->getJson('/api/v1/groups');
    $response->assertUnauthorized();
});

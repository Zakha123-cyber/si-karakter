<?php

use App\Models\AcademicYear;
use App\Models\ContentInteraction;
use App\Models\Group;
use App\Models\SimulationAttempt;
use App\Models\Student;
use App\Models\TestAttempt;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create();
    $this->studentUser = User::factory()->student()->create(['name' => 'Ahmad Rajin']);
    $this->otherStudentUser = User::factory()->student()->create(['name' => 'Santri Lain']);

    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => $this->teacher->id,
        'name' => 'Kelas Misi',
    ]);

    $this->student = Student::factory()->create([
        'user_id' => $this->studentUser->id,
        'student_code' => 'MISI-001',
        'current_group_id' => $group->id,
    ]);

    $this->otherStudent = Student::factory()->create([
        'user_id' => $this->otherStudentUser->id,
        'student_code' => 'MISI-002',
        'current_group_id' => $group->id,
    ]);
});

test('student can view missions page with all missions incomplete without activity', function () {
    $response = $this->actingAs($this->studentUser)->get('/student/missions');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/missions')
            ->where('student.name', 'Ahmad Rajin')
            ->where('student.group', 'Kelas Misi')
            ->has('missions', 3)
            ->where('missions.0.id', 'simulasi')
            ->where('missions.0.completed', false)
            ->where('missions.1.id', 'baca')
            ->where('missions.1.completed', false)
            ->where('missions.2.id', 'tes')
            ->where('missions.2.completed', false)
            ->where('missions.0.href', '/student/simulations')
            ->where('missions.1.href', '/student/contents')
            ->where('missions.2.href', '/student/tests')
        );
});

test('missions are completed by today activities', function () {
    ContentInteraction::factory()->create([
        'student_id' => $this->student->id,
        'started_at' => now()->subMinutes(5),
        'completed_at' => now(),
    ]);
    TestAttempt::factory()->create([
        'student_id' => $this->student->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);
    SimulationAttempt::factory()->create([
        'student_id' => $this->student->id,
        'completed_at' => now(),
    ]);

    $response = $this->actingAs($this->studentUser)->get('/student/missions');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/missions')
            ->where('missions.0.completed', true)
            ->where('missions.1.completed', true)
            ->where('missions.2.completed', true)
        );
});

test('yesterday activities and other students activities do not complete missions', function () {
    ContentInteraction::factory()->create([
        'student_id' => $this->student->id,
        'completed_at' => now()->subDay(),
    ]);
    TestAttempt::factory()->create([
        'student_id' => $this->student->id,
        'status' => 'submitted',
        'submitted_at' => now()->subDay(),
    ]);
    SimulationAttempt::factory()->create([
        'student_id' => $this->student->id,
        'completed_at' => now()->subDay(),
    ]);
    TestAttempt::factory()->create([
        'student_id' => $this->otherStudent->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $response = $this->actingAs($this->studentUser)->get('/student/missions');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/missions')
            ->where('missions.0.completed', false)
            ->where('missions.1.completed', false)
            ->where('missions.2.completed', false)
        );
});

test('missions page is private to student role', function () {
    $this->actingAs($this->teacher)
        ->get('/student/missions')
        ->assertForbidden();

    auth()->logout();

    $this->get('/student/missions')
        ->assertRedirect('/login');
});

test('dashboard shares the same dynamic missions', function () {
    ContentInteraction::factory()->create([
        'student_id' => $this->student->id,
        'started_at' => now()->subMinutes(5),
        'completed_at' => now(),
    ]);

    $response = $this->actingAs($this->studentUser)->get('/student/dashboard');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/dashboard')
            ->has('missions', 3)
            ->where('missions.1.id', 'baca')
            ->where('missions.1.completed', true)
        );
});

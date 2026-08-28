<?php

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create();
    $this->studentUser = User::factory()->student()->create([
        'name' => 'Ahmad Setia',
        'username' => 'ahmad_setia',
        'pin_enabled' => true,
    ]);

    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => $this->teacher->id,
        'name' => 'Kelas Setia',
    ]);

    $this->student = Student::factory()->create([
        'user_id' => $this->studentUser->id,
        'student_code' => 'SET-001',
        'current_group_id' => $group->id,
    ]);
});

test('student can view settings page with profile data', function () {
    $response = $this->actingAs($this->studentUser)->get('/student/settings');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/settings')
            ->where('student.name', 'Ahmad Setia')
            ->where('student.username', 'ahmad_setia')
            ->where('student.group', 'Kelas Setia')
            ->where('student.student_code', 'SET-001')
            ->where('student.pin_enabled', true)
            ->has('password_rules')
        );
});

test('settings page is private to student role', function () {
    $this->actingAs($this->teacher)
        ->get('/student/settings')
        ->assertForbidden();

    auth()->logout();

    $this->get('/student/settings')
        ->assertRedirect('/login');
});

test('settings page handles student without profile row', function () {
    $orphanStudentUser = User::factory()->student()->create([
        'name' => 'Santri Belum Lengkap',
        'username' => 'santri-setting-kosong',
    ]);

    $response = $this->actingAs($orphanStudentUser)->get('/student/settings');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/settings')
            ->where('student.name', 'Santri Belum Lengkap')
            ->where('student.group', null)
            ->where('student.student_code', null)
        );
});

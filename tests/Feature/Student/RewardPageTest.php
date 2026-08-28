<?php

use App\Models\AcademicYear;
use App\Models\ContentInteraction;
use App\Models\GoodnessPointTransaction;
use App\Models\GoodnessTreeLevel;
use App\Models\Group;
use App\Models\SimulationAttempt;
use App\Models\Student;
use App\Models\TestAttempt;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create();
    $this->studentUser = User::factory()->student()->create(['name' => 'Ahmad Baik']);
    $this->otherStudentUser = User::factory()->student()->create(['name' => 'Santri Lain']);

    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => $this->teacher->id,
        'name' => 'Kelas Hadiah',
    ]);

    $this->student = Student::factory()->create([
        'user_id' => $this->studentUser->id,
        'student_code' => 'REW-001',
        'current_group_id' => $group->id,
    ]);

    $this->otherStudent = Student::factory()->create([
        'user_id' => $this->otherStudentUser->id,
        'student_code' => 'REW-002',
        'current_group_id' => $group->id,
    ]);

    GoodnessTreeLevel::factory()->create([
        'level' => 1,
        'name' => 'Benih Kebaikan',
        'minimum_points' => 0,
        'asset_path' => 'goodness-tree/level-1.svg',
    ]);
    GoodnessTreeLevel::factory()->create([
        'level' => 2,
        'name' => 'Tunas Semangat',
        'minimum_points' => 25,
        'asset_path' => 'goodness-tree/level-2.svg',
    ]);
});

test('student can view rewards page with all badges locked without activity', function () {
    $response = $this->actingAs($this->studentUser)->get('/student/rewards');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/rewards')
            ->where('student.name', 'Ahmad Baik')
            ->where('student.group', 'Kelas Hadiah')
            ->where('student.points', 0)
            ->where('student.tree_level', 'Benih Kebaikan')
            ->has('badges', 8)
            ->where('badges.0.id', 'langkah_pertama')
            ->where('badges.0.unlocked', false)
            ->where('badges.7.id', 'master_misi')
            ->where('badges.7.progress_current', 0)
            ->where('badges.7.progress_target', 3)
        );
});

test('badges unlock based on real student activity', function () {
    GoodnessPointTransaction::factory()->create([
        'student_id' => $this->student->id,
        'points' => 15,
        'created_at' => now()->subDays(2),
    ]);
    GoodnessPointTransaction::factory()->create([
        'student_id' => $this->student->id,
        'points' => 15,
        'created_at' => now()->subDay(),
    ]);
    GoodnessPointTransaction::factory()->create([
        'student_id' => $this->student->id,
        'points' => 10,
        'created_at' => now(),
    ]);

    ContentInteraction::factory()->count(3)->sequence(fn () => [
        'student_id' => $this->student->id,
        'started_at' => now()->subMinutes(5),
        'completed_at' => now(),
    ])->create();

    TestAttempt::factory()->create([
        'student_id' => $this->student->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    SimulationAttempt::factory()->create([
        'student_id' => $this->student->id,
        'completed_at' => now(),
    ]);

    $response = $this->actingAs($this->studentUser)->get('/student/rewards');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/rewards')
            ->where('student.points', 40)
            ->where('student.tree_level', 'Tunas Semangat')
            ->where('badges.0.id', 'langkah_pertama')
            ->where('badges.0.unlocked', true)
            ->where('badges.1.id', 'penonton_teladan')
            ->where('badges.1.unlocked', true)
            ->where('badges.2.id', 'pemecah_kasus')
            ->where('badges.2.unlocked', true)
            ->where('badges.3.id', 'berani_menolak')
            ->where('badges.3.unlocked', true)
            ->where('badges.4.id', 'semangat_beruntun')
            ->where('badges.4.unlocked', true)
            ->where('badges.5.id', 'kolektor_bintang')
            ->where('badges.5.unlocked', false)
            ->where('badges.5.progress_current', 1)
            ->where('badges.6.id', 'penjaga_pohon')
            ->where('badges.6.unlocked', true)
            ->where('badges.7.id', 'master_misi')
            ->where('badges.7.unlocked', true)
        );
});

test('other students activity does not unlock badges', function () {
    GoodnessPointTransaction::factory()->create([
        'student_id' => $this->otherStudent->id,
        'points' => 50,
        'created_at' => now(),
    ]);
    SimulationAttempt::factory()->create([
        'student_id' => $this->otherStudent->id,
        'completed_at' => now(),
    ]);

    $response = $this->actingAs($this->studentUser)->get('/student/rewards');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/rewards')
            ->where('student.points', 0)
            ->where('badges.0.unlocked', false)
            ->where('badges.3.unlocked', false)
        );
});

test('rewards page is private to student role', function () {
    $this->actingAs($this->teacher)
        ->get('/student/rewards')
        ->assertForbidden();

    auth()->logout();

    $this->get('/student/rewards')
        ->assertRedirect('/login');
});

test('rewards page handles student without profile row', function () {
    $orphanStudentUser = User::factory()->student()->create([
        'name' => 'Santri Belum Lengkap',
        'username' => 'santri-reward-kosong',
    ]);

    $response = $this->actingAs($orphanStudentUser)->get('/student/rewards');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/rewards')
            ->where('student.name', 'Santri Belum Lengkap')
            ->where('student.group', null)
            ->where('student.points', 0)
            ->has('badges', 8)
        );
});

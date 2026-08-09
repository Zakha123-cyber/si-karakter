<?php

use App\Models\AcademicYear;
use App\Models\GoodnessPointTransaction;
use App\Models\GoodnessTreeLevel;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create(['name' => 'Ustadz Reward']);
    $this->studentUser = User::factory()->student()->create(['name' => 'Ahmad Baik']);
    $this->otherStudentUser = User::factory()->student()->create(['name' => 'Santri Lain']);

    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => $this->teacher->id,
        'name' => 'Kelas Kebaikan',
    ]);

    $this->student = Student::factory()->create([
        'user_id' => $this->studentUser->id,
        'student_code' => 'GOOD-001',
        'current_group_id' => $group->id,
    ]);

    $this->otherStudent = Student::factory()->create([
        'user_id' => $this->otherStudentUser->id,
        'student_code' => 'GOOD-002',
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
    GoodnessTreeLevel::factory()->create([
        'level' => 3,
        'name' => 'Pohon Muda',
        'minimum_points' => 60,
        'asset_path' => 'goodness-tree/level-3.svg',
    ]);
});

test('student can view goodness tree with positive reward history', function () {
    GoodnessPointTransaction::factory()->create([
        'student_id' => $this->student->id,
        'source_type' => 'observation',
        'points' => 20,
        'description' => 'Membantu teman merapikan kelas',
        'awarded_by' => $this->teacher->id,
        'created_at' => now()->subDay(),
    ]);
    GoodnessPointTransaction::factory()->create([
        'student_id' => $this->student->id,
        'source_type' => 'manual',
        'points' => 20,
        'description' => 'Berani berkata jujur',
        'awarded_by' => $this->teacher->id,
        'created_at' => now(),
    ]);
    GoodnessPointTransaction::factory()->create([
        'student_id' => $this->student->id,
        'source_type' => 'manual',
        'points' => -100,
        'description' => 'Transaksi negatif yang tidak boleh tampil',
        'awarded_by' => $this->teacher->id,
        'created_at' => now(),
    ]);
    GoodnessPointTransaction::factory()->create([
        'student_id' => $this->otherStudent->id,
        'source_type' => 'manual',
        'points' => 999,
        'description' => 'Reward santri lain',
        'awarded_by' => $this->teacher->id,
    ]);

    $response = $this->actingAs($this->studentUser)->get('/student/goodness-tree');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/goodness-tree')
            ->where('student.name', 'Ahmad Baik')
            ->where('student.group', 'Kelas Kebaikan')
            ->where('tree.points', 40)
            ->where('tree.current_level.name', 'Tunas Semangat')
            ->where('tree.next_level.name', 'Pohon Muda')
            ->where('tree.points_to_next_level', 20)
            ->where('tree.progress_percent', 43)
            ->where('tree.levels.1.unlocked', true)
            ->where('tree.levels.2.unlocked', false)
            ->has('transactions.data', 2)
            ->where('transactions.data.0.description', 'Berani berkata jujur')
            ->where('transactions.data.0.source_label', 'Apresiasi Ustadz')
            ->where('transactions.data.0.awarded_by', 'Ustadz Reward')
            ->where('transactions.data.1.description', 'Membantu teman merapikan kelas')
            ->missing('warnings')
        );
});

test('student goodness tree is private to student role', function () {
    $this->actingAs($this->teacher)
        ->get('/student/goodness-tree')
        ->assertForbidden();

    auth()->logout();

    $this->get('/student/goodness-tree')
        ->assertRedirect('/login');
});

test('student goodness tree handles student without rewards using positive language', function () {
    $response = $this->actingAs($this->studentUser)->get('/student/goodness-tree');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/goodness-tree')
            ->where('tree.points', 0)
            ->where('tree.current_level.name', 'Benih Kebaikan')
            ->where('tree.progress_percent', 0)
            ->where('tree.points_to_next_level', 25)
            ->has('transactions.data', 0)
            ->missing('warnings')
        );
});

test('student goodness tree does not return 404 when student profile row is missing', function () {
    $orphanStudentUser = User::factory()->student()->create([
        'name' => 'Santri Belum Lengkap',
        'username' => 'santri-belum-lengkap',
    ]);

    $response = $this->actingAs($orphanStudentUser)->get('/student/goodness-tree');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/goodness-tree')
            ->where('student.name', 'Santri Belum Lengkap')
            ->where('student.group', null)
            ->where('student.student_code', null)
            ->where('tree.points', 0)
            ->where('tree.current_level.name', 'Benih Kebaikan')
            ->has('transactions.data', 0)
            ->missing('warnings')
        );
});

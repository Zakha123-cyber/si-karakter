<?php

use App\Models\Group;
use App\Models\SimulationAttempt;
use App\Models\SimulationAttemptReview;
use App\Models\SimulationOption;
use App\Models\SimulationScenario;
use App\Models\Student;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create(['name' => 'Ustadz Simulasi']);
    $this->group = Group::factory()->create([
        'teacher_id' => $this->teacher->id,
        'name' => 'Kelompok Simulasi',
    ]);
    $this->studentUser = User::factory()->student()->create(['name' => 'Santri Simulasi']);
    $this->student = Student::factory()->create([
        'user_id' => $this->studentUser->id,
        'current_group_id' => $this->group->id,
    ]);

    $this->scenario = SimulationScenario::factory()->published()->create([
        'title' => 'Diajak Membolos',
        'created_by' => $this->teacher->id,
    ]);

    $this->bestOption = SimulationOption::factory()->create([
        'simulation_scenario_id' => $this->scenario->id,
        'text' => 'Maaf, aku tidak bisa ikut.',
        'feedback_text' => 'Hebat, kamu berani menolak dengan sopan.',
        'score' => 100,
        'reward_points' => 10,
        'sort_order' => 1,
    ]);

    $this->attempt = SimulationAttempt::factory()->create([
        'student_id' => $this->student->id,
        'simulation_scenario_id' => $this->scenario->id,
        'selected_option_id' => $this->bestOption->id,
        'score' => 100,
        'reward_points' => 10,
        'completed_at' => now(),
    ]);
});

test('teacher can view simulation review list of own students', function () {
    $this->actingAs($this->teacher)
        ->get('/teacher/simulation-reviews')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/simulation-reviews/index')
            ->has('attempts.data', 1)
            ->where('attempts.data.0.student.name', 'Santri Simulasi')
            ->where('attempts.data.0.scenario.title', 'Diajak Membolos')
            ->where('attempts.data.0.review.status', 'pending'));
});

test('teacher only sees simulation attempts from their own groups', function () {
    $otherTeacher = User::factory()->teacher()->create();
    $otherGroup = Group::factory()->create(['teacher_id' => $otherTeacher->id]);
    $otherStudent = Student::factory()->create(['current_group_id' => $otherGroup->id]);

    SimulationAttempt::factory()->create([
        'student_id' => $otherStudent->id,
        'simulation_scenario_id' => $this->scenario->id,
        'selected_option_id' => $this->bestOption->id,
        'score' => 30,
        'reward_points' => 2,
        'completed_at' => now(),
    ]);

    $this->actingAs($this->teacher)
        ->get('/teacher/simulation-reviews')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('attempts.data', 1));
});

test('teacher can view simulation attempt detail', function () {
    $this->actingAs($this->teacher)
        ->get("/teacher/simulation-reviews/{$this->attempt->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/simulation-reviews/show')
            ->where('attempt.id', $this->attempt->id)
            ->where('attempt.student.name', 'Santri Simulasi')
            ->where('attempt.review.status', 'pending')
            ->has('attempt.options', 1)
            ->where('attempt.options.0.is_selected', true)
            ->where('attempt.options.0.is_best', true));
});

test('teacher can mark a simulation attempt as reviewed with a note', function () {
    $this->actingAs($this->teacher)
        ->post("/teacher/simulation-reviews/{$this->attempt->id}/review", [
            'teacher_note' => 'Pertahankan keberanianmu ya.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('simulation_attempt_reviews', [
        'simulation_attempt_id' => $this->attempt->id,
        'teacher_id' => $this->teacher->id,
        'teacher_note' => 'Pertahankan keberanianmu ya.',
    ]);

    $this->actingAs($this->teacher)
        ->get('/teacher/simulation-reviews')
        ->assertInertia(fn (Assert $page) => $page
            ->where('attempts.data.0.review.status', 'reviewed'));
});

test('teacher can cancel a simulation review', function () {
    SimulationAttemptReview::query()->create([
        'simulation_attempt_id' => $this->attempt->id,
        'teacher_id' => $this->teacher->id,
        'teacher_note' => 'Catatan awal.',
        'reviewed_at' => now(),
    ]);

    $this->actingAs($this->teacher)
        ->delete("/teacher/simulation-reviews/{$this->attempt->id}/review")
        ->assertRedirect();

    $this->assertDatabaseMissing('simulation_attempt_reviews', [
        'simulation_attempt_id' => $this->attempt->id,
    ]);
});

test('teacher cannot view or review another teacher attempt', function () {
    $otherTeacher = User::factory()->teacher()->create();

    $this->actingAs($otherTeacher)
        ->get("/teacher/simulation-reviews/{$this->attempt->id}")
        ->assertForbidden();

    $this->actingAs($otherTeacher)
        ->post("/teacher/simulation-reviews/{$this->attempt->id}/review", [])
        ->assertForbidden();
});

test('teacher can filter simulation reviews by status', function () {
    SimulationAttemptReview::query()->create([
        'simulation_attempt_id' => $this->attempt->id,
        'teacher_id' => $this->teacher->id,
        'teacher_note' => null,
        'reviewed_at' => now(),
    ]);

    $this->actingAs($this->teacher)
        ->get('/teacher/simulation-reviews?status=pending')
        ->assertInertia(fn (Assert $page) => $page->has('attempts.data', 0));

    $this->actingAs($this->teacher)
        ->get('/teacher/simulation-reviews?status=reviewed')
        ->assertInertia(fn (Assert $page) => $page->has('attempts.data', 1));
});

test('student cannot access simulation reviews', function () {
    $this->actingAs($this->studentUser)
        ->get('/teacher/simulation-reviews')
        ->assertForbidden();
});

test('guest is redirected from simulation reviews', function () {
    $this->get('/teacher/simulation-reviews')->assertRedirect('/login');
});

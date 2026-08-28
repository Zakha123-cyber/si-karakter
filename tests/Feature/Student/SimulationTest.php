<?php

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\SimulationAttempt;
use App\Models\SimulationOption;
use App\Models\SimulationScenario;
use App\Models\Student;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create(['name' => 'Ustadz Simulasi']);
    $this->studentUser = User::factory()->student()->create(['name' => 'Ahmad Santri']);
    $this->unlinkedStudentUser = User::factory()->student()->create(['name' => 'Tanpa Profil']);

    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => $this->teacher->id,
        'name' => 'Kelas Keberanian',
    ]);

    $this->student = Student::factory()->create([
        'user_id' => $this->studentUser->id,
        'current_group_id' => $group->id,
    ]);

    $this->scenario = SimulationScenario::factory()->published()->create([
        'title' => 'Teman Minta Mengerjakan Tugas',
        'opening_text' => 'Saat istirahat, temanmu meminta bantuan mengerjakan tugas.',
        'created_by' => $this->teacher->id,
    ]);

    $this->bestOption = SimulationOption::factory()->create([
        'simulation_scenario_id' => $this->scenario->id,
        'text' => 'Maaf, saya sedang ada pekerjaan. Kita bisa bahas nanti.',
        'feedback_text' => 'Hebat! Kamu menyampaikan batasan dengan sopan.',
        'score' => 100,
        'reward_points' => 10,
        'sort_order' => 1,
    ]);

    $this->roughOption = SimulationOption::factory()->create([
        'simulation_scenario_id' => $this->scenario->id,
        'text' => 'Tidak bisa, jangan ganggu saya!',
        'feedback_text' => 'Kamu berani menolak, tapi caranya masih kasar.',
        'score' => 40,
        'reward_points' => 2,
        'sort_order' => 2,
    ]);
});

test('student sees only published simulations on the index page', function () {
    SimulationScenario::factory()->draft()->create(['title' => 'Draft Rahasia']);

    $this->actingAs($this->studentUser)
        ->get('/student/simulations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/simulations/index')
            ->has('scenarios', 1)
            ->where('scenarios.0.id', $this->scenario->id)
            ->where('scenarios.0.title', 'Teman Minta Mengerjakan Tugas')
            ->where('scenarios.0.options_count', 2));
});

test('student can open a published simulation with its options', function () {
    $this->actingAs($this->studentUser)
        ->get("/student/simulations/{$this->scenario->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/simulations/show')
            ->where('scenario.id', $this->scenario->id)
            ->has('options', 2)
            ->where('options.0.text', 'Maaf, saya sedang ada pekerjaan. Kita bisa bahas nanti.')
            ->where('has_profile', true));
});

test('draft simulation returns 404 for students', function () {
    $draft = SimulationScenario::factory()->draft()->create(['title' => 'Draft Tersembunyi']);

    $this->actingAs($this->studentUser)
        ->get("/student/simulations/{$draft->id}")
        ->assertNotFound();
});

test('student with no student profile gets 403 when submitting', function () {
    $this->actingAs($this->unlinkedStudentUser)
        ->post("/student/simulations/{$this->scenario->id}/attempts", [
            'selected_option_id' => $this->bestOption->id,
        ])
        ->assertForbidden();
});

test('submitting an option not belonging to the scenario is rejected', function () {
    $otherOption = SimulationOption::factory()->create([
        'text' => 'Milik skenario lain',
        'score' => 100,
        'reward_points' => 10,
    ]);

    $this->actingAs($this->studentUser)
        ->post("/student/simulations/{$this->scenario->id}/attempts", [
            'selected_option_id' => $otherOption->id,
        ])
        ->assertSessionHasErrors('selected_option_id');
});

test('student can submit an attempt and receive reward points', function () {
    $response = $this->actingAs($this->studentUser)
        ->post("/student/simulations/{$this->scenario->id}/attempts", [
            'selected_option_id' => $this->bestOption->id,
        ]);

    $response->assertRedirect(route('student.simulations.show', [
        'simulationScenario' => $this->scenario->id,
    ]));

    $attempt = SimulationAttempt::query()->where('student_id', $this->student->id)->first();
    expect($attempt)->not->toBeNull()
        ->and($attempt->selected_option_id)->toBe($this->bestOption->id)
        ->and((float) $attempt->score)->toBe(100.0)
        ->and($attempt->reward_points)->toBe(10)
        ->and($attempt->completed_at)->not->toBeNull();

    $this->assertDatabaseHas('goodness_point_transactions', [
        'student_id' => $this->student->id,
        'source_type' => 'simulation',
        'source_id' => $attempt->id,
        'points' => 10,
        'awarded_by' => null,
    ]);

    $this->get("/student/simulations/{$this->scenario->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('result.option_id', $this->bestOption->id)
            ->where('result.reward_points', 10)
            ->where('result.correct_option_ids', [$this->bestOption->id]));
});

test('zero-point option does not create a transaction but still records attempt', function () {
    $zeroOption = SimulationOption::factory()->create([
        'simulation_scenario_id' => $this->scenario->id,
        'text' => 'Hanya diam saja',
        'score' => 0,
        'reward_points' => 0,
        'sort_order' => 3,
    ]);

    $this->actingAs($this->studentUser)
        ->post("/student/simulations/{$this->scenario->id}/attempts", [
            'selected_option_id' => $zeroOption->id,
        ])
        ->assertRedirect();

    $attempt = SimulationAttempt::query()->where('student_id', $this->student->id)->first();
    expect($attempt)->not->toBeNull();

    $this->assertDatabaseCount('goodness_point_transactions', 0);
});

test('index shows latest attempt badge for previously played scenario', function () {
    SimulationAttempt::factory()->create([
        'student_id' => $this->student->id,
        'simulation_scenario_id' => $this->scenario->id,
        'selected_option_id' => $this->roughOption->id,
        'score' => 40,
        'reward_points' => 2,
        'completed_at' => now(),
    ]);

    $this->actingAs($this->studentUser)
        ->get('/student/simulations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('scenarios.0.latest_attempt.reward_points', 2)
            ->where('scenarios.0.latest_attempt.score', 40));
});

test('student without profile still sees index page with has_profile false', function () {
    $this->actingAs($this->unlinkedStudentUser)
        ->get('/student/simulations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('scenarios.0.latest_attempt', null));

    $this->actingAs($this->unlinkedStudentUser)
        ->get("/student/simulations/{$this->scenario->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('has_profile', false));
});

test('guest cannot access student simulation pages', function () {
    $this->get('/student/simulations')->assertRedirect('/login');
    $this->get("/student/simulations/{$this->scenario->id}")->assertRedirect('/login');
    $this->post("/student/simulations/{$this->scenario->id}/attempts")->assertRedirect('/login');
});

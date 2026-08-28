<?php

use App\Enums\SimulationScenarioStatus;
use App\Models\SimulationAttempt;
use App\Models\SimulationOption;
use App\Models\SimulationScenario;
use App\Models\Student;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create(['name' => 'Ustadz Konten']);
    $this->studentUser = User::factory()->student()->create(['name' => 'Santri Konten']);
    $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);

    $this->scenario = SimulationScenario::factory()->published()->create([
        'title' => 'Teman Minta Mengerjakan Tugas',
        'opening_text' => 'Saat istirahat, temanmu meminta bantuan.',
        'created_by' => $this->teacher->id,
    ]);

    SimulationOption::factory()->create([
        'simulation_scenario_id' => $this->scenario->id,
        'text' => 'Maaf, saya sedang sibuk.',
        'score' => 100,
        'reward_points' => 10,
        'sort_order' => 1,
    ]);
});

test('teacher can view simulation scenarios list', function () {
    $this->actingAs($this->teacher)
        ->get('/teacher/simulation-scenarios')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/simulations/index')
            ->has('simulations.data', 1)
            ->where('simulations.data.0.title', 'Teman Minta Mengerjakan Tugas')
            ->where('simulations.data.0.status', SimulationScenarioStatus::Published->value)
            ->where('simulations.data.0.options_count', 1)
            ->where('simulations.data.0.attempts_count', 0));
});

test('student cannot access teacher simulation management', function () {
    $this->actingAs($this->studentUser)
        ->get('/teacher/simulation-scenarios')
        ->assertForbidden();
});

test('teacher can create a simulation scenario', function () {
    $this->actingAs($this->teacher)
        ->post('/teacher/simulation-scenarios', [
            'title' => 'Ajak Bermain Saat Belajar',
            'description' => 'Latihan menolak ajakan di waktu belajar.',
            'opening_text' => 'Teman mengajakmu bermain saat jam mengaji.',
            'status' => SimulationScenarioStatus::Published->value,
        ])
        ->assertRedirect()
        ->assertSessionHas('status');

    $this->assertDatabaseHas('simulation_scenarios', [
        'title' => 'Ajak Bermain Saat Belajar',
        'status' => SimulationScenarioStatus::Published->value,
        'created_by' => $this->teacher->id,
    ]);
});

test('teacher can update a simulation scenario', function () {
    $this->actingAs($this->teacher)
        ->put("/teacher/simulation-scenarios/{$this->scenario->id}", [
            'title' => 'Judul Baru Skenario',
            'description' => 'Deskripsi baru.',
            'opening_text' => 'Situasi baru.',
            'status' => SimulationScenarioStatus::Draft->value,
        ])
        ->assertRedirect()
        ->assertSessionHas('status');

    $this->assertDatabaseHas('simulation_scenarios', [
        'id' => $this->scenario->id,
        'title' => 'Judul Baru Skenario',
        'status' => SimulationScenarioStatus::Draft->value,
    ]);
});

test('teacher can add and update options for a scenario', function () {
    $this->actingAs($this->teacher)
        ->post("/teacher/simulation-scenarios/{$this->scenario->id}/options", [
            'text' => 'Aku ikut, tapi jangan bilang siapa-siapa.',
            'feedback_text' => 'Coba sampaikan keinginanmu dengan jujur.',
            'score' => 50,
            'reward_points' => 5,
            'sort_order' => 2,
        ])
        ->assertRedirect()
        ->assertSessionHas('status');

    $option = SimulationOption::query()
        ->where('simulation_scenario_id', $this->scenario->id)
        ->where('text', 'Aku ikut, tapi jangan bilang siapa-siapa.')
        ->first();

    expect($option)->not->toBeNull()
        ->and((float) $option->score)->toBe(50.0)
        ->and($option->reward_points)->toBe(5);

    $this->actingAs($this->teacher)
        ->put("/teacher/simulation-scenarios/{$this->scenario->id}/options/{$option->id}", [
            'text' => 'Aku ikut.',
            'feedback_text' => 'Feedback baru.',
            'score' => 60,
            'reward_points' => 6,
            'sort_order' => 2,
        ])
        ->assertRedirect()
        ->assertSessionHas('status');

    $option->refresh();
    expect($option->text)->toBe('Aku ikut.')
        ->and((float) $option->score)->toBe(60.0)
        ->and($option->reward_points)->toBe(6);
});

test('option from another scenario cannot be updated through another scenario', function () {
    $otherScenario = SimulationScenario::factory()->published()->create([
        'title' => 'Skenario Lain',
        'created_by' => $this->teacher->id,
    ]);
    $otherOption = SimulationOption::factory()->create([
        'simulation_scenario_id' => $otherScenario->id,
        'text' => 'Milik skenario lain',
    ]);

    $this->actingAs($this->teacher)
        ->put("/teacher/simulation-scenarios/{$this->scenario->id}/options/{$otherOption->id}", [
            'text' => 'Hacked',
            'feedback_text' => null,
            'score' => 0,
            'reward_points' => 0,
            'sort_order' => 1,
        ])
        ->assertNotFound();
});

test('scenario with attempts cannot be deleted', function () {
    SimulationAttempt::factory()->create([
        'student_id' => $this->student->id,
        'simulation_scenario_id' => $this->scenario->id,
        'selected_option_id' => $this->scenario->options()->first()->id,
        'score' => 100,
        'reward_points' => 10,
        'completed_at' => now(),
    ]);

    $this->actingAs($this->teacher)
        ->delete("/teacher/simulation-scenarios/{$this->scenario->id}")
        ->assertRedirect()
        ->assertSessionHasErrors('scenario');

    $this->assertDatabaseHas('simulation_scenarios', ['id' => $this->scenario->id]);
});

test('scenario without attempts can be deleted', function () {
    $emptyScenario = SimulationScenario::factory()->draft()->create([
        'title' => 'Skenario Kosong',
        'created_by' => $this->teacher->id,
    ]);

    $this->actingAs($this->teacher)
        ->delete("/teacher/simulation-scenarios/{$emptyScenario->id}")
        ->assertRedirect()
        ->assertSessionHas('status');

    $this->assertDatabaseMissing('simulation_scenarios', ['id' => $emptyScenario->id]);
});

test('option that has been selected by students cannot be deleted', function () {
    $option = $this->scenario->options()->first();

    SimulationAttempt::factory()->create([
        'student_id' => $this->student->id,
        'simulation_scenario_id' => $this->scenario->id,
        'selected_option_id' => $option->id,
        'score' => 100,
        'reward_points' => 10,
        'completed_at' => now(),
    ]);

    $this->actingAs($this->teacher)
        ->delete("/teacher/simulation-scenarios/{$this->scenario->id}/options/{$option->id}")
        ->assertRedirect()
        ->assertSessionHasErrors('option');

    $this->assertDatabaseHas('simulation_options', ['id' => $option->id]);
});

test('teacher can search and filter simulation scenarios', function () {
    SimulationScenario::factory()->draft()->create([
        'title' => 'Draft Khusus',
        'created_by' => $this->teacher->id,
    ]);

    $this->actingAs($this->teacher)
        ->get('/teacher/simulation-scenarios?search=Draft+Khusus')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'Draft Khusus')
            ->has('simulations.data', 1)
            ->where('simulations.data.0.title', 'Draft Khusus'));

    $this->actingAs($this->teacher)
        ->get('/teacher/simulation-scenarios?status=draft')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.status', 'draft')
            ->has('simulations.data', 1)
            ->where('simulations.data.0.status', SimulationScenarioStatus::Draft->value));
});

test('guest cannot access teacher simulation management', function () {
    $this->get('/teacher/simulation-scenarios')->assertRedirect('/login');
});

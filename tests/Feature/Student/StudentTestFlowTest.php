<?php

use App\Enums\TestPackageStatus;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\MoralCaseOption;
use App\Models\Student;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('allows a student to start and submit a test attempt', function () {
    $studentUser = User::factory()->student()->create();
    $academicYear = AcademicYear::create([
        'name' => '2025/2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
        'is_active' => true,
    ]);
    $group = Group::create([
        'academic_year_id' => $academicYear->id,
        'name' => 'Kelas A',
        'description' => null,
        'teacher_id' => null,
        'is_active' => true,
    ]);
    $student = Student::create([
        'user_id' => $studentUser->id,
        'student_code' => 'STR-001',
        'birth_date' => '2018-01-01',
        'gender' => 'male',
        'current_group_id' => $group->id,
        'enrollment_date' => '2025-07-01',
        'status' => 'active',
    ]);

    $package = TestPackage::create([
        'title' => 'Paket Uji Santri',
        'slug' => 'paket-uji-santri',
        'description' => 'Paket uji awal',
        'start_at' => now()->subDay(),
        'end_at' => now()->addDay(),
        'attempt_limit' => 2,
        'status' => TestPackageStatus::Published,
        'created_by' => null,
    ]);
    $package->groups()->attach($group->id);

    $case = MoralCase::create([
        'title' => 'Kasus Uji',
        'story' => 'Sebuah cerita uji',
        'sort_order' => 1,
        'is_active' => true,
        'created_by' => null,
    ]);
    $option = MoralCaseOption::create([
        'moral_case_id' => $case->id,
        'label' => 'A',
        'text' => 'Saya memilih opsi A',
        'internal_value' => 'A',
        'sort_order' => 1,
        'is_active' => true,
    ]);
    $package->cases()->attach($case->id, ['sort_order' => 1]);

    $response = $this->actingAs($studentUser)->get('/student/tests');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/tests/index')
            ->where('packages.0.id', $package->id));

    $response = $this->actingAs($studentUser)->post('/student/tests/'.$package->id.'/attempts');

    $response->assertRedirect();

    $attempt = TestAttempt::query()->latest('id')->first();
    expect($attempt)->not->toBeNull()
        ->and($attempt->student_id)->toBe($student->id)
        ->and($attempt->status)->toBe('in_progress');

    $response = $this->actingAs($studentUser)->post('/student/tests/'.$package->id.'/attempts/'.$attempt->id.'/answers', [
        'moral_case_id' => $case->id,
        'selected_option_id' => $option->id,
        'typed_reason' => 'Saya memilih ini karena...',
    ]);

    $response->assertRedirect();

    $answer = TestAnswer::query()->where('test_attempt_id', $attempt->id)->first();
    expect($answer)->not->toBeNull()
        ->and($answer->selected_option_id)->toBe($option->id)
        ->and($answer->typed_reason)->toBe('Saya memilih ini karena...');

    $response = $this->actingAs($studentUser)->post('/student/tests/'.$package->id.'/attempts/'.$attempt->id.'/submit');

    $response->assertRedirect();

    $attempt->refresh();
    expect($attempt->status)->toBe('submitted');
});

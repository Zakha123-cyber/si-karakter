<?php

use App\Domain\Scoring\TestScoreCalculator;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\MoralCaseOption;
use App\Models\ScoringConfiguration;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\User;

test('api scoring configuration update preserves is_active when omitted', function () {
    $teacher = User::factory()->teacher()->create();
    $config = ScoringConfiguration::factory()->create(['name' => 'Bobot Aktif', 'is_active' => true]);

    $response = $this->actingAs($teacher)->putJson("/api/v1/scoring-configurations/{$config->id}", [
        'name' => 'Bobot Ganti Nama',
        'test_weight' => 50,
        'observation_weight' => 50,
        'effective_from' => '2026-07-01',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.configuration.name', 'Bobot Ganti Nama')
        ->assertJsonPath('data.configuration.is_active', true);

    expect($config->refresh()->is_active)->toBeTrue();
});

test('web scoring configuration update preserves is_active when omitted', function () {
    $teacher = User::factory()->teacher()->create();
    $config = ScoringConfiguration::factory()->create(['name' => 'Bobot Aktif', 'is_active' => true]);

    $response = $this->actingAs($teacher)->put("/teacher/scoring-configurations/{$config->id}", [
        'name' => 'Bobot Ganti Nama',
        'test_weight' => 50,
        'observation_weight' => 50,
        'effective_from' => '2026-07-01',
    ]);

    $response->assertRedirect();
    expect($config->refresh()->is_active)->toBeTrue();
});

test('web moral case update preserves is_active when omitted', function () {
    $teacher = User::factory()->teacher()->create();
    $case = MoralCase::factory()->create(['title' => 'Kasus Lama', 'is_active' => true]);

    $response = $this->actingAs($teacher)->put("/teacher/moral-cases/{$case->id}", [
        'title' => 'Kasus Baru',
        'story' => 'Cerita baru.',
        'sort_order' => 2,
    ]);

    $response->assertRedirect();
    $case->refresh();

    expect($case->title)->toBe('Kasus Baru')
        ->and($case->is_active)->toBeTrue();
});

test('web moral case option update preserves is_active when omitted', function () {
    $teacher = User::factory()->teacher()->create();
    $case = MoralCase::factory()->create();
    $option = MoralCaseOption::factory()->create([
        'moral_case_id' => $case->id,
        'label' => 'A',
        'text' => 'Opsi lama',
        'is_active' => true,
    ]);

    $response = $this->actingAs($teacher)->put("/teacher/moral-cases/{$case->id}/options/{$option->id}", [
        'label' => 'B',
        'text' => 'Opsi baru',
        'sort_order' => 3,
    ]);

    $response->assertRedirect();
    expect($option->refresh()->is_active)->toBeTrue();
});

test('admin cannot delete student with test history', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => null,
    ]);
    $student = Student::factory()->create(['current_group_id' => $group->id]);
    $package = TestPackage::factory()->create(['status' => 'published']);
    $case = MoralCase::factory()->create();
    $package->cases()->attach($case->id, ['sort_order' => 1]);

    TestAttempt::factory()->create([
        'test_package_id' => $package->id,
        'student_id' => $student->id,
        'status' => 'submitted',
    ]);

    $response = $this->actingAs($admin)->delete("/admin/students/{$student->id}");

    $response->assertRedirect()
        ->assertSessionHasErrors('student');

    expect(Student::query()->whereKey($student->id)->exists())->toBeTrue();
});

test('admin can delete student without history', function () {
    $admin = User::factory()->admin()->create();
    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => null,
    ]);
    $student = Student::factory()->create(['current_group_id' => $group->id]);

    $response = $this->actingAs($admin)->delete("/admin/students/{$student->id}");

    $response->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(Student::query()->whereKey($student->id)->exists())->toBeFalse();
});

test('student cannot select option from another case', function () {
    $studentUser = User::factory()->student()->create();
    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => null,
    ]);
    $student = Student::factory()->create([
        'user_id' => $studentUser->id,
        'current_group_id' => $group->id,
    ]);

    $package = TestPackage::factory()->create([
        'status' => 'published',
        'start_at' => now()->subDay(),
        'end_at' => now()->addDay(),
    ]);
    $package->groups()->attach($group->id);

    $case = MoralCase::factory()->create();
    $otherCase = MoralCase::factory()->create();
    $otherOption = MoralCaseOption::factory()->create([
        'moral_case_id' => $otherCase->id,
        'label' => 'A',
        'text' => 'Opsi kasus lain',
        'is_active' => true,
    ]);
    $package->cases()->attach($case->id, ['sort_order' => 1]);

    $attempt = TestAttempt::factory()->create([
        'test_package_id' => $package->id,
        'student_id' => $student->id,
        'status' => 'in_progress',
    ]);

    $response = $this->actingAs($studentUser)
        ->post("/student/tests/{$package->id}/attempts/{$attempt->id}/answers", [
            'moral_case_id' => $case->id,
            'selected_option_id' => $otherOption->id,
            'typed_reason' => 'alasan',
        ]);

    $response->assertRedirect()
        ->assertSessionHasErrors('selected_option_id');

    expect($attempt->answers()->count())->toBe(0);
});

test('test score calculator recognizes Kohlberg labels used in review UI', function () {
    $calculator = app(TestScoreCalculator::class);

    $reflection = new ReflectionMethod(TestScoreCalculator::class, 'aggregate');
    $reflection->setAccessible(true);

    $attempt = TestAttempt::factory()->create();

    $answer = TestAnswer::factory()->create([
        'test_attempt_id' => $attempt->id,
        'answer_status' => 'submitted',
    ]);

    TeacherValidation::factory()->create([
        'test_answer_id' => $answer->id,
        'decision' => 'overridden',
        'final_moral_level' => 'Tahap 3: Orientasi Anak Manis',
    ]);

    $result = $reflection->invoke($calculator, collect([$answer]), $attempt->id);

    expect($result->score)->toBe(50.0)
        ->and($result->validatedAnswers)->toBe(1);
});

test('api login endpoint is rate limited', function () {
    $user = User::factory()->student()->create(['password' => bcrypt('password')]);

    for ($i = 0; $i < 6; $i++) {
        $this->postJson('/api/v1/auth/login', [
            'username' => $user->username,
            'password' => 'password',
        ])->assertOk();
    }

    $this->postJson('/api/v1/auth/login', [
        'username' => $user->username,
        'password' => 'password',
    ])->assertStatus(429);
});

test('api pagination caps per_page at 100', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(3)->teacher()->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/users?per_page=1000');

    $response->assertOk()
        ->assertJsonPath('data.meta.per_page', 100);
});

test('web role middleware returns error page instead of raw json', function () {
    $student = User::factory()->student()->create();

    $response = $this->actingAs($student)->get('/admin/users');

    $response->assertForbidden()
        ->assertHeaderContains('Content-Type', 'text/html');
});

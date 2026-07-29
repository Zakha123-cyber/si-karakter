<?php

use App\Models\AcademicYear;
use App\Models\AiAssessment;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\User;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create();
    $this->admin = User::factory()->admin()->create();

    $this->academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $this->group = Group::factory()->create([
        'teacher_id' => $this->teacher->id,
        'academic_year_id' => $this->academicYear->id,
    ]);

    $this->student = Student::factory()->create([
        'current_group_id' => $this->group->id,
    ]);

    $this->moralCase = MoralCase::factory()->create();
    $this->testPackage = TestPackage::factory()->create(['status' => 'published']);

    $this->attempt = TestAttempt::factory()->create([
        'test_package_id' => $this->testPackage->id,
        'student_id' => $this->student->id,
        'status' => 'submitted',
    ]);

    $this->testAnswer = TestAnswer::factory()->create([
        'test_attempt_id' => $this->attempt->id,
        'moral_case_id' => $this->moralCase->id,
        'answer_status' => 'submitted',
    ]);

    $this->aiAssessment = AiAssessment::factory()->create([
        'test_answer_id' => $this->testAnswer->id,
        'moral_level' => 'Tahap 3',
        'confidence' => 0.90,
    ]);
});

test('teacher can view review queue for assigned group', function () {
    $response = $this->actingAs($this->teacher)->get('/teacher/reviews');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teacher/reviews/index')
            ->has('reviews.data', 1)
        );
});

test('teacher cannot see review queue of other groups', function () {
    $otherTeacher = User::factory()->teacher()->create();
    $otherGroup = Group::factory()->create([
        'teacher_id' => $otherTeacher->id,
        'academic_year_id' => $this->academicYear->id,
    ]);
    $otherStudent = Student::factory()->create(['current_group_id' => $otherGroup->id]);
    $otherAttempt = TestAttempt::factory()->create([
        'test_package_id' => $this->testPackage->id,
        'student_id' => $otherStudent->id,
        'status' => 'submitted',
    ]);
    TestAnswer::factory()->create([
        'test_attempt_id' => $otherAttempt->id,
        'moral_case_id' => $this->moralCase->id,
        'answer_status' => 'submitted',
    ]);

    $response = $this->actingAs($this->teacher)->get('/teacher/reviews');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teacher/reviews/index')
            ->has('reviews.data', 1) // Only sees 1 item from their own group
        );
});

test('admin can see review queue across all groups', function () {
    $otherTeacher = User::factory()->teacher()->create();
    $otherGroup = Group::factory()->create(['teacher_id' => $otherTeacher->id]);
    $otherStudent = Student::factory()->create(['current_group_id' => $otherGroup->id]);
    $otherAttempt = TestAttempt::factory()->create([
        'test_package_id' => $this->testPackage->id,
        'student_id' => $otherStudent->id,
        'status' => 'submitted',
    ]);
    TestAnswer::factory()->create([
        'test_attempt_id' => $otherAttempt->id,
        'moral_case_id' => $this->moralCase->id,
        'answer_status' => 'submitted',
    ]);

    $response = $this->actingAs($this->admin)->get('/teacher/reviews');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teacher/reviews/index')
            ->has('reviews.data', 2)
        );
});

test('teacher can view single review detail', function () {
    $response = $this->actingAs($this->teacher)->get("/teacher/reviews/{$this->testAnswer->id}");

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teacher/reviews/show')
            ->has('review')
            ->where('review.id', $this->testAnswer->id)
        );
});

test('api endpoint returns review queue for teacher', function () {
    $response = $this->actingAs($this->teacher)->getJson('/api/v1/teacher/reviews');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(1, 'data.data');
});

test('teacher cannot access audio of other groups', function () {
    $otherTeacher = User::factory()->teacher()->create();
    $otherGroup = Group::factory()->create([
        'teacher_id' => $otherTeacher->id,
        'academic_year_id' => $this->academicYear->id,
    ]);
    $otherStudent = Student::factory()->create(['current_group_id' => $otherGroup->id]);
    $otherAttempt = TestAttempt::factory()->create([
        'test_package_id' => $this->testPackage->id,
        'student_id' => $otherStudent->id,
        'status' => 'submitted',
    ]);
    $otherAnswer = TestAnswer::factory()->create([
        'test_attempt_id' => $otherAttempt->id,
        'moral_case_id' => $this->moralCase->id,
        'answer_status' => 'submitted',
    ]);

    $response = $this->actingAs($this->teacher)->get("/teacher/reviews/{$otherAnswer->id}/audio");

    $response->assertForbidden();
});

test('teacher can update transcript text', function () {
    $response = $this->actingAs($this->teacher)->put("/teacher/reviews/{$this->testAnswer->id}/transcript", [
        'edited_text' => 'Teks transkripsi perbaikan Ustadz.',
    ]);

    $response->assertRedirect();

    expect($this->testAnswer->refresh()->final_transcript)->toBe('Teks transkripsi perbaikan Ustadz.');
});

test('teacher can approve ai recommendation', function () {
    $response = $this->actingAs($this->teacher)->post("/teacher/reviews/{$this->testAnswer->id}/approve", [
        'teacher_note' => 'Jawaban santri sesuai dengan perilaku sehari-hari.',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('teacher_validations', [
        'test_answer_id' => $this->testAnswer->id,
        'decision' => 'approved',
        'final_moral_level' => 'Tahap 3',
        'teacher_note' => 'Jawaban santri sesuai dengan perilaku sehari-hari.',
    ]);
});

test('teacher can override ai recommendation with required reason', function () {
    $response = $this->actingAs($this->teacher)->post("/teacher/reviews/{$this->testAnswer->id}/override", [
        'final_moral_level' => 'Tahap 2: Individualisme dan Pertukaran',
        'override_reason' => 'Berdasarkan klarifikasi langsung santri menjawab karena ingin pujian.',
        'teacher_note' => 'Perlu bimbingan lebih lanjut.',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('teacher_validations', [
        'test_answer_id' => $this->testAnswer->id,
        'decision' => 'overridden',
        'final_moral_level' => 'Tahap 2: Individualisme dan Pertukaran',
        'override_reason' => 'Berdasarkan klarifikasi langsung santri menjawab karena ingin pujian.',
    ]);
});

test('teacher cannot override without providing an override reason', function () {
    $response = $this->actingAs($this->teacher)->postJson("/api/v1/teacher/reviews/{$this->testAnswer->id}/override", [
        'final_moral_level' => 'Tahap 2: Individualisme dan Pertukaran',
        'override_reason' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['override_reason']);
});

test('api endpoint allows teacher to approve and override', function () {
    $approveRes = $this->actingAs($this->teacher)->postJson("/api/v1/teacher/reviews/{$this->testAnswer->id}/approve");

    $approveRes->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.validation.decision', 'approved');

    $overrideRes = $this->actingAs($this->teacher)->postJson("/api/v1/teacher/reviews/{$this->testAnswer->id}/override", [
        'final_moral_level' => 'Tahap 4: Menjaga Ketertiban Sosial',
        'override_reason' => 'Alasan penyesuaian nilai moral santri.',
    ]);

    $overrideRes->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.validation.decision', 'overridden')
        ->assertJsonPath('data.validation.final_moral_level', 'Tahap 4: Menjaga Ketertiban Sosial');
});

test('teacher cannot view detail review of another group', function () {
    $otherTeacher = User::factory()->teacher()->create();
    $otherGroup = Group::factory()->create(['teacher_id' => $otherTeacher->id, 'academic_year_id' => $this->academicYear->id]);
    $otherStudent = Student::factory()->create(['current_group_id' => $otherGroup->id]);
    $otherAttempt = TestAttempt::factory()->create(['test_package_id' => $this->testPackage->id, 'student_id' => $otherStudent->id]);
    $otherAnswer = TestAnswer::factory()->create(['test_attempt_id' => $otherAttempt->id, 'moral_case_id' => $this->moralCase->id]);

    $this->actingAs($this->teacher)
        ->get("/teacher/reviews/{$otherAnswer->id}")
        ->assertForbidden();

    $this->actingAs($this->teacher)
        ->put("/teacher/reviews/{$otherAnswer->id}/transcript", ['edited_text' => 'Bypass'])
        ->assertForbidden();

    $this->actingAs($this->teacher)
        ->post("/teacher/reviews/{$otherAnswer->id}/approve")
        ->assertForbidden();

    $this->actingAs($this->teacher)
        ->post("/teacher/reviews/{$otherAnswer->id}/override", ['final_moral_level' => 'Tahap 1', 'override_reason' => 'Bypass attempt'])
        ->assertForbidden();
});

test('admin can access and validate review across all groups', function () {
    $otherTeacher = User::factory()->teacher()->create();
    $otherGroup = Group::factory()->create(['teacher_id' => $otherTeacher->id, 'academic_year_id' => $this->academicYear->id]);
    $otherStudent = Student::factory()->create(['current_group_id' => $otherGroup->id]);
    $otherAttempt = TestAttempt::factory()->create(['test_package_id' => $this->testPackage->id, 'student_id' => $otherStudent->id]);
    $otherAnswer = TestAnswer::factory()->create(['test_attempt_id' => $otherAttempt->id, 'moral_case_id' => $this->moralCase->id]);

    $this->actingAs($this->admin)
        ->get("/teacher/reviews/{$otherAnswer->id}")
        ->assertOk();

    $this->actingAs($this->admin)
        ->post("/teacher/reviews/{$otherAnswer->id}/approve")
        ->assertRedirect();

    $this->assertDatabaseHas('teacher_validations', [
        'test_answer_id' => $otherAnswer->id,
        'decision' => 'approved',
        'teacher_id' => $this->admin->id,
    ]);
});

test('revalidating an answer updates the existing validation record', function () {
    $this->actingAs($this->teacher)->post("/teacher/reviews/{$this->testAnswer->id}/approve");

    $this->assertDatabaseHas('teacher_validations', [
        'test_answer_id' => $this->testAnswer->id,
        'decision' => 'approved',
    ]);

    $this->actingAs($this->teacher)->post("/teacher/reviews/{$this->testAnswer->id}/override", [
        'final_moral_level' => 'Tahap 5: Kontrak Sosial',
        'override_reason' => 'Revisi setelah peninjauan ulang bersama tim.',
    ]);

    $this->assertDatabaseHas('teacher_validations', [
        'test_answer_id' => $this->testAnswer->id,
        'decision' => 'overridden',
        'final_moral_level' => 'Tahap 5: Kontrak Sosial',
    ]);

    expect(TeacherValidation::where('test_answer_id', $this->testAnswer->id)->count())->toBe(1);
});

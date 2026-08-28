<?php

use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\CharacterIndicator;
use App\Models\CharacterReport;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('local');

    $this->teacher = User::factory()->teacher()->create();
    $this->otherTeacher = User::factory()->teacher()->create();
    $this->admin = User::factory()->admin()->create();

    $this->academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $this->group = Group::factory()->create([
        'teacher_id' => $this->teacher->id,
        'academic_year_id' => $this->academicYear->id,
    ]);
    $this->otherGroup = Group::factory()->create([
        'teacher_id' => $this->otherTeacher->id,
        'academic_year_id' => $this->academicYear->id,
    ]);

    $this->student = Student::factory()->create([
        'current_group_id' => $this->group->id,
    ]);
    $this->otherStudent = Student::factory()->create([
        'current_group_id' => $this->otherGroup->id,
    ]);
});

function reportAnswer(TestAttempt $attempt, string $level, User $teacher): void
{
    $answer = TestAnswer::factory()->create([
        'test_attempt_id' => $attempt->id,
        'moral_case_id' => MoralCase::factory(),
    ]);

    TeacherValidation::query()->create([
        'test_answer_id' => $answer->id,
        'teacher_id' => $teacher->id,
        'decision' => 'approved',
        'final_moral_level' => $level,
        'final_indicators_json' => [],
        'validated_at' => now(),
    ]);
}

function reportEntry(Student $student, User $teacher, array $sentiments): void
{
    $entry = ObservationEntry::query()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
        'observed_at' => now()->toDateString(),
    ]);

    foreach ($sentiments as $sentiment) {
        ObservationItem::query()->create([
            'observation_entry_id' => $entry->id,
            'character_indicator_id' => CharacterIndicator::factory()->create()->id,
            'sentiment' => $sentiment,
            'assessment_score' => null,
            'reward_points' => 0,
        ]);
    }
}

function reportWithData(Student $student, User $teacher, ?string $status = 'draft'): CharacterReport
{
    $attempt = TestAttempt::factory()->create([
        'student_id' => $student->id,
        'test_package_id' => TestPackage::factory(),
        'status' => 'submitted',
        'submitted_at' => now(),
        'completed_at' => now(),
    ]);
    reportAnswer($attempt, 'post_conventional', $teacher);
    reportEntry($student, $teacher, ['positive', 'positive']);

    if ($status === 'reviewed') {
        return CharacterReport::factory()->reviewed()->create([
            'student_id' => $student->id,
            'teacher_id' => $teacher->id,
        ]);
    }

    return CharacterReport::factory()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
        'status' => $status,
    ]);
}

test('student cannot access reports page', function () {
    $studentUser = User::factory()->student()->create();

    $response = $this->actingAs($studentUser)->get('/teacher/reports');

    $response->assertForbidden();
});

test('admin can view reports of all groups', function () {
    $this->withoutVite();

    CharacterReport::factory()->create(['student_id' => $this->student->id]);
    CharacterReport::factory()->create(['student_id' => $this->otherStudent->id]);

    $response = $this->actingAs($this->admin)->get('/teacher/reports');

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/reports/index')
            ->has('reports.data', 2)
        );
});

test('unauthenticated user cannot view reports page', function () {
    $response = $this->get('/teacher/reports');

    $response->assertRedirect('/login');
});

test('teacher can view reports index page with own group students only', function () {
    $this->withoutVite();

    CharacterReport::factory()->create(['student_id' => $this->student->id]);
    CharacterReport::factory()->create(['student_id' => $this->otherStudent->id]);

    $response = $this->actingAs($this->teacher)->get('/teacher/reports');

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/reports/index')
            ->has('reports.data', 1)
        );
});

test('teacher can generate report draft', function () {
    $attempt = TestAttempt::factory()->create([
        'student_id' => $this->student->id,
        'test_package_id' => TestPackage::factory(),
        'status' => 'submitted',
        'submitted_at' => now(),
        'completed_at' => now(),
    ]);
    reportAnswer($attempt, 'post_conventional', $this->teacher);
    reportEntry($this->student, $this->teacher, ['positive', 'positive']);

    $response = $this->actingAs($this->teacher)->post('/teacher/reports/generate', [
        'student_id' => $this->student->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end' => now()->endOfMonth()->toDateString(),
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('character_reports', [
        'student_id' => $this->student->id,
        'status' => 'draft',
        'teacher_id' => $this->teacher->id,
    ]);

    $report = CharacterReport::query()->where('student_id', $this->student->id)->first();
    expect($report)->not->toBeNull()
        ->and($report->test_summary_json['score'])->toEqual(100.0)
        ->and($report->observation_summary_json['score'])->toEqual(100.0);
});

test('teacher cannot generate report for student outside own group', function () {
    $response = $this->actingAs($this->teacher)->post('/teacher/reports/generate', [
        'student_id' => $this->otherStudent->id,
        'period_start' => now()->startOfMonth()->toDateString(),
        'period_end' => now()->endOfMonth()->toDateString(),
    ]);

    $response->assertForbidden();

    $this->assertDatabaseCount('character_reports', 0);
});

test('teacher cannot view report of student outside own group', function () {
    $report = CharacterReport::factory()->create(['student_id' => $this->otherStudent->id]);

    $response = $this->actingAs($this->teacher)->get("/teacher/reports/{$report->id}");

    $response->assertForbidden();
});

test('teacher can generate AI narrative draft', function () {
    $report = reportWithData($this->student, $this->teacher);

    $response = $this->actingAs($this->teacher)->post("/teacher/reports/{$report->id}/generate-narrative");

    $response->assertRedirect();

    $report->refresh();
    expect($report->ai_generated_narrative)->not->toBeNull()
        ->and($report->recommendation)->not->toBe('')
        ->and($report->status)->toBe('draft');
});

test('teacher can review report with final narrative', function () {
    $report = reportWithData($this->student, $this->teacher);

    $response = $this->actingAs($this->teacher)->post("/teacher/reports/{$report->id}/review", [
        'final_narrative' => 'Narasi final hasil konfirmasi ustadz.',
        'recommendation' => 'Pertahankan pembiasaan positif.',
    ]);

    $response->assertRedirect();

    $report->refresh();
    expect($report->status)->toBe('reviewed')
        ->and($report->final_narrative)->toBe('Narasi final hasil konfirmasi ustadz.')
        ->and($report->recommendation)->toBe('Pertahankan pembiasaan positif.')
        ->and(AuditLog::where('action', 'report.reviewed')->where('auditable_id', $report->id)->exists())->toBeTrue();
});

test('reviewed report cannot be reviewed again', function () {
    $report = reportWithData($this->student, $this->teacher, 'reviewed');
    $originalNarrative = $report->final_narrative;

    $response = $this->actingAs($this->teacher)->post("/teacher/reports/{$report->id}/review", [
        'final_narrative' => 'Narasi pengganti.',
        'recommendation' => 'Rekomendasi pengganti.',
    ]);

    $response->assertRedirect();

    expect($report->fresh()->final_narrative)->toBe($originalNarrative);
});

test('teacher can publish reviewed report and download pdf', function () {
    $report = reportWithData($this->student, $this->teacher, 'reviewed');

    $response = $this->actingAs($this->teacher)->post("/teacher/reports/{$report->id}/publish");

    $response->assertRedirect();

    $report->refresh();
    expect($report->status)->toBe('published')
        ->and($report->published_at)->not->toBeNull()
        ->and($report->pdf_path)->not->toBeNull()
        ->and(Storage::disk('local')->exists($report->pdf_path))->toBeTrue();

    $download = $this->actingAs($this->teacher)->get("/teacher/reports/{$report->id}/pdf");
    $download->assertOk();
    expect($download->headers->get('content-type'))->toContain('application/pdf');
});

test('draft report cannot be published', function () {
    $report = reportWithData($this->student, $this->teacher);

    $response = $this->actingAs($this->teacher)->post("/teacher/reports/{$report->id}/publish");

    $response->assertRedirect();

    expect($report->fresh()->status)->toBe('draft');
});

test('teacher cannot download pdf of report outside own group', function () {
    $report = CharacterReport::factory()->published()->create(['student_id' => $this->otherStudent->id]);

    $response = $this->actingAs($this->teacher)->get("/teacher/reports/{$report->id}/pdf");

    $response->assertForbidden();
});

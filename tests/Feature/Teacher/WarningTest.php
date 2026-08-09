<?php

use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\CharacterIndicator;
use App\Models\Group;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\StudentWarning;
use App\Models\User;
use App\Models\WarningRule;
use Database\Seeders\WarningRuleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create();
    $this->otherTeacher = User::factory()->teacher()->create();
    $this->admin = User::factory()->admin()->create();
    $this->studentUser = User::factory()->student()->create();

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
        'user_id' => $this->studentUser->id,
        'current_group_id' => $this->group->id,
    ]);
    $this->otherStudent = Student::factory()->create([
        'current_group_id' => $this->otherGroup->id,
    ]);

    $this->indicator = CharacterIndicator::factory()->warning()->create([
        'code' => 'dishonesty_warning',
        'name' => 'Kecenderungan Manipulatif',
    ]);

    $this->rule = WarningRule::factory()->create([
        'name' => 'Observasi Negatif Indikator Pendampingan',
        'rule_type' => 'observation_negative_indicator',
        'conditions_json' => [
            'window_days' => 14,
            'minimum_negative_items' => 2,
            'require_warning_indicator' => true,
            'indicator_codes' => ['dishonesty_warning'],
            'title_template' => ':student membutuhkan pendampingan karakter',
            'description_template' => ':student memiliki :count catatan observasi yang membutuhkan pendampingan dalam :days hari terakhir. Indikator yang perlu dikuatkan: :indicators.',
        ],
        'severity' => 'medium',
        'is_active' => true,
    ]);
});

function createWarningEntry(Student $student, User $teacher, CharacterIndicator $indicator, string $date): ObservationEntry
{
    $entry = ObservationEntry::query()->create([
        'student_id' => $student->id,
        'teacher_id' => $teacher->id,
        'observed_at' => $date,
        'general_note' => 'Catatan observasi pendampingan.',
    ]);

    ObservationItem::query()->create([
        'observation_entry_id' => $entry->id,
        'character_indicator_id' => $indicator->id,
        'sentiment' => 'negative',
        'assessment_score' => null,
        'reward_points' => 0,
        'note' => 'Perlu penguatan indikator.',
    ]);

    return $entry;
}

test('warning rule seeder creates idempotent dummy rule', function () {
    WarningRule::query()->delete();

    $this->seed(WarningRuleSeeder::class);
    $this->seed(WarningRuleSeeder::class);

    expect(WarningRule::query()->count())->toBe(1)
        ->and(WarningRule::query()->first()?->name)->toBe('Observasi Negatif Indikator Pendampingan');
});

test('teacher can view warning dashboard for assigned students only', function () {
    StudentWarning::factory()->create([
        'student_id' => $this->student->id,
        'warning_rule_id' => $this->rule->id,
        'title' => 'Santri membutuhkan pendampingan karakter',
    ]);
    StudentWarning::factory()->create([
        'student_id' => $this->otherStudent->id,
        'warning_rule_id' => $this->rule->id,
    ]);

    $response = $this->actingAs($this->teacher)->get('/teacher/warnings');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/warnings/index')
            ->has('warnings.data', 1)
            ->where('summary.open', 1)
            ->where('warnings.data.0.title', 'Santri membutuhkan pendampingan karakter')
        );
});

test('admin can view all warnings', function () {
    StudentWarning::factory()->create([
        'student_id' => $this->student->id,
        'warning_rule_id' => $this->rule->id,
    ]);
    StudentWarning::factory()->create([
        'student_id' => $this->otherStudent->id,
        'warning_rule_id' => $this->rule->id,
    ]);

    $response = $this->actingAs($this->admin)->get('/teacher/warnings');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/warnings/index')
            ->has('warnings.data', 2)
            ->where('summary.open', 2)
        );
});

test('student cannot access warning dashboard and warning props are not exposed on student dashboard', function () {
    StudentWarning::factory()->create([
        'student_id' => $this->student->id,
        'warning_rule_id' => $this->rule->id,
    ]);

    $this->actingAs($this->studentUser)
        ->get('/teacher/warnings')
        ->assertForbidden();

    $this->actingAs($this->studentUser)
        ->get('/student/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/dashboard')
            ->missing('warnings')
            ->missing('student_warnings')
        );
});

test('teacher can generate warning for assigned student', function () {
    createWarningEntry($this->student, $this->teacher, $this->indicator, now()->subDay()->toDateString());
    createWarningEntry($this->student, $this->teacher, $this->indicator, now()->toDateString());

    $this->actingAs($this->teacher)
        ->post('/teacher/warnings/generate', ['student_id' => $this->student->id])
        ->assertRedirect();

    $warning = StudentWarning::query()->first();

    expect($warning)->not->toBeNull()
        ->and($warning->student_id)->toBe($this->student->id)
        ->and($warning->status)->toBe('open')
        ->and($warning->title)->toContain('membutuhkan pendampingan')
        ->and($warning->description)->not->toContain('anak bermasalah');

    expect(AuditLog::query()->where('action', 'warning.generated')->count())->toBe(1);
});

test('teacher cannot generate warning for student outside assigned group', function () {
    $this->actingAs($this->teacher)
        ->post('/teacher/warnings/generate', ['student_id' => $this->otherStudent->id])
        ->assertForbidden();

    expect(StudentWarning::query()->count())->toBe(0);
});

test('observation creation automatically generates warning when rule matches', function () {
    createWarningEntry($this->student, $this->teacher, $this->indicator, now()->subDay()->toDateString());

    $payload = [
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
        'observed_at' => now()->toDateString(),
        'general_note' => 'Observasi baru.',
        'items' => [
            [
                'character_indicator_id' => $this->indicator->id,
                'sentiment' => 'negative',
                'assessment_score' => null,
                'reward_points' => 0,
                'note' => 'Perlu penguatan.',
            ],
        ],
    ];

    $this->actingAs($this->teacher)
        ->post('/teacher/observations', $payload)
        ->assertRedirect();

    expect(StudentWarning::query()->where('student_id', $this->student->id)->count())->toBe(1);
});

test('teacher can review and resolve own group warning', function () {
    $warning = StudentWarning::factory()->create([
        'student_id' => $this->student->id,
        'warning_rule_id' => $this->rule->id,
        'status' => 'open',
    ]);

    $this->actingAs($this->teacher)
        ->post("/teacher/warnings/{$warning->id}/review", [
            'resolution_note' => 'Sudah ditinjau untuk pendampingan pekan ini.',
        ])
        ->assertRedirect();

    $warning->refresh();

    expect($warning->status)->toBe('reviewed')
        ->and($warning->reviewed_by)->toBe($this->teacher->id)
        ->and($warning->resolution_note)->toBe('Sudah ditinjau untuk pendampingan pekan ini.');

    $this->actingAs($this->teacher)
        ->post("/teacher/warnings/{$warning->id}/resolve", [
            'resolution_note' => 'Sudah dilakukan pendampingan dan pemantauan lanjutan.',
        ])
        ->assertRedirect();

    $warning->refresh();

    expect($warning->status)->toBe('resolved')
        ->and($warning->resolution_note)->toBe('Sudah dilakukan pendampingan dan pemantauan lanjutan.')
        ->and(AuditLog::query()->whereIn('action', ['warning.reviewed', 'warning.resolved'])->count())->toBe(2);
});

test('resolve requires follow up note', function () {
    $warning = StudentWarning::factory()->create([
        'student_id' => $this->student->id,
        'warning_rule_id' => $this->rule->id,
        'status' => 'open',
    ]);

    $this->actingAs($this->teacher)
        ->post("/teacher/warnings/{$warning->id}/resolve", ['resolution_note' => ''])
        ->assertSessionHasErrors('resolution_note');
});

test('teacher cannot review warning outside own group', function () {
    $warning = StudentWarning::factory()->create([
        'student_id' => $this->otherStudent->id,
        'warning_rule_id' => $this->rule->id,
        'status' => 'open',
    ]);

    $this->actingAs($this->teacher)
        ->post("/teacher/warnings/{$warning->id}/review")
        ->assertForbidden();
});

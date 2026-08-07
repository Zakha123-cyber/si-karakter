<?php

use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\CharacterIndicator;
use App\Models\GoodnessPointTransaction;
use App\Models\Group;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\User;

beforeEach(function () {
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

    $this->indicator = CharacterIndicator::factory()->create([
        'is_active' => true,
    ]);
});

function validObservationPayload(): array
{
    return [
        'student_id' => null,
        'teacher_id' => null,
        'observed_at' => '2026-08-01',
        'general_note' => 'Perkembangan cukup baik hari ini.',
        'items' => [
            [
                'character_indicator_id' => null,
                'sentiment' => 'positive',
                'assessment_score' => 90,
                'reward_points' => 5,
                'note' => 'Terlihat rajin.',
            ],
        ],
    ];
}

test('teacher can view observation index for assigned group', function () {
    ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
    ]);

    $response = $this->actingAs($this->teacher)->get('/teacher/observations');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teacher/observations/index')
            ->has('observations.data', 1)
        );
});

test('teacher cannot see observations of other groups', function () {
    ObservationEntry::factory()->create([
        'student_id' => $this->otherStudent->id,
        'teacher_id' => $this->otherTeacher->id,
    ]);

    $response = $this->actingAs($this->teacher)->get('/teacher/observations');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teacher/observations/index')
            ->has('observations.data', 0)
        );
});

test('admin can see all observations', function () {
    ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
    ]);
    ObservationEntry::factory()->create([
        'student_id' => $this->otherStudent->id,
        'teacher_id' => $this->otherTeacher->id,
    ]);

    $response = $this->actingAs($this->admin)->get('/teacher/observations');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teacher/observations/index')
            ->has('observations.data', 2)
        );
});

test('teacher can create observation for student in own group', function () {
    $payload = validObservationPayload();
    $payload['student_id'] = $this->student->id;
    $payload['teacher_id'] = $this->otherTeacher->id;
    $payload['items'][0]['character_indicator_id'] = $this->indicator->id;

    $this->actingAs($this->teacher)
        ->post('/teacher/observations', $payload)
        ->assertRedirect();

    $entry = ObservationEntry::query()->where('student_id', $this->student->id)->first();

    expect($entry)->not->toBeNull()
        ->and($entry->teacher_id)->toBe($this->teacher->id)
        ->and($entry->sentiment)->toBe('positive')
        ->and($entry->items()->count())->toBe(1);

    $transaction = GoodnessPointTransaction::query()
        ->where('source_type', 'observation')
        ->where('source_id', $entry->id)
        ->first();

    expect($transaction)->not->toBeNull()
        ->and($transaction->points)->toBe(5)
        ->and($transaction->student_id)->toBe($this->student->id);

    expect(AuditLog::query()->where('action', 'observation.created')->where('auditable_id', $entry->id)->count())->toBe(1);
});

test('teacher cannot create observation for student outside own group', function () {
    $payload = validObservationPayload();
    $payload['student_id'] = $this->otherStudent->id;
    $payload['teacher_id'] = $this->teacher->id;
    $payload['items'][0]['character_indicator_id'] = $this->indicator->id;

    $this->actingAs($this->teacher)
        ->post('/teacher/observations', $payload)
        ->assertForbidden();

    expect(ObservationEntry::query()->count())->toBe(0);
});

test('admin can create observation for any student with chosen teacher', function () {
    $payload = validObservationPayload();
    $payload['student_id'] = $this->otherStudent->id;
    $payload['teacher_id'] = $this->otherTeacher->id;
    $payload['items'][0]['character_indicator_id'] = $this->indicator->id;

    $this->actingAs($this->admin)
        ->post('/teacher/observations', $payload)
        ->assertRedirect();

    $entry = ObservationEntry::query()->where('student_id', $this->otherStudent->id)->first();

    expect($entry)->not->toBeNull()
        ->and($entry->teacher_id)->toBe($this->otherTeacher->id);
});

test('validation requires at least one item and valid sentiment', function () {
    $payload = validObservationPayload();
    $payload['student_id'] = $this->student->id;
    $payload['teacher_id'] = $this->teacher->id;
    $payload['items'][0]['character_indicator_id'] = $this->indicator->id;
    $payload['items'][0]['sentiment'] = 'invalid_sentiment';

    $this->actingAs($this->teacher)
        ->post('/teacher/observations', $payload)
        ->assertSessionHasErrors('items.0.sentiment');

    $this->actingAs($this->teacher)
        ->post('/teacher/observations', [
            'student_id' => $this->student->id,
            'teacher_id' => $this->teacher->id,
            'observed_at' => '2026-08-01',
            'items' => [],
        ])
        ->assertSessionHasErrors('items');
});

test('teacher can edit own observation', function () {
    $entry = ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
        'sentiment' => 'neutral',
    ]);
    ObservationItem::factory()->create([
        'observation_entry_id' => $entry->id,
        'character_indicator_id' => $this->indicator->id,
        'sentiment' => 'neutral',
        'assessment_score' => 50,
        'reward_points' => 1,
    ]);

    $payload = validObservationPayload();
    $payload['student_id'] = $this->student->id;
    $payload['teacher_id'] = $this->teacher->id;
    $payload['items'][0]['character_indicator_id'] = $this->indicator->id;
    $payload['items'][0]['reward_points'] = 10;

    $this->actingAs($this->teacher)
        ->put("/teacher/observations/{$entry->id}", $payload)
        ->assertRedirect();

    $entry->refresh();

    expect($entry->sentiment)->toBe('positive')
        ->and($entry->general_note)->toBe($payload['general_note'])
        ->and($entry->items()->count())->toBe(1);

    $transaction = GoodnessPointTransaction::query()
        ->where('source_type', 'observation')
        ->where('source_id', $entry->id)
        ->first();

    expect($transaction)->not->toBeNull()
        ->and($transaction->points)->toBe(10);

    expect(AuditLog::query()->where('action', 'observation.updated')->where('auditable_id', $entry->id)->count())->toBe(1);
});

test('teacher cannot edit observation of another teacher', function () {
    $entry = ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->otherTeacher->id,
    ]);

    $payload = validObservationPayload();
    $payload['student_id'] = $this->student->id;
    $payload['teacher_id'] = $this->otherTeacher->id;
    $payload['items'][0]['character_indicator_id'] = $this->indicator->id;

    $this->actingAs($this->teacher)
        ->put("/teacher/observations/{$entry->id}", $payload)
        ->assertForbidden();
});

test('admin can edit any observation', function () {
    $entry = ObservationEntry::factory()->create([
        'student_id' => $this->otherStudent->id,
        'teacher_id' => $this->otherTeacher->id,
    ]);

    $payload = validObservationPayload();
    $payload['student_id'] = $this->otherStudent->id;
    $payload['teacher_id'] = $this->otherTeacher->id;
    $payload['items'][0]['character_indicator_id'] = $this->indicator->id;

    $this->actingAs($this->admin)
        ->put("/teacher/observations/{$entry->id}", $payload)
        ->assertRedirect();

    expect($entry->refresh()->items()->count())->toBe(1);
});

test('teacher can soft delete own observation', function () {
    $entry = ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
    ]);
    ObservationItem::factory()->create([
        'observation_entry_id' => $entry->id,
        'character_indicator_id' => $this->indicator->id,
        'sentiment' => 'positive',
        'reward_points' => 3,
    ]);
    GoodnessPointTransaction::query()->create([
        'student_id' => $this->student->id,
        'source_type' => 'observation',
        'source_id' => $entry->id,
        'points' => 3,
        'description' => 'Poin observasi',
        'awarded_by' => $this->teacher->id,
    ]);

    $this->actingAs($this->teacher)
        ->delete("/teacher/observations/{$entry->id}")
        ->assertRedirect();

    expect($entry->refresh()->trashed())->toBeTrue()
        ->and($entry->items()->withTrashed()->count())->toBe(1)
        ->and(GoodnessPointTransaction::query()
            ->where('source_type', 'observation')
            ->where('source_id', $entry->id)
            ->count())->toBe(0)
        ->and(AuditLog::query()->where('action', 'observation.deleted')->where('auditable_id', $entry->id)->count())->toBe(1);
});

test('teacher cannot delete observation of another teacher', function () {
    $entry = ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->otherTeacher->id,
    ]);

    $this->actingAs($this->teacher)
        ->delete("/teacher/observations/{$entry->id}")
        ->assertForbidden();
});

test('index filters observations by sentiment', function () {
    ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
        'sentiment' => 'positive',
    ]);
    ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
        'sentiment' => 'negative',
    ]);

    $response = $this->actingAs($this->teacher)
        ->get('/teacher/observations?sentiment=positive');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('observations.data', 1)
            ->where('filters.sentiment', 'positive')
        );
});

test('index filters observations by date range and search', function () {
    ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
        'observed_at' => '2026-08-01',
        'general_note' => 'Rajin sekali hari ini.',
    ]);
    ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
        'observed_at' => '2026-07-01',
        'general_note' => 'Perlu perhatian khusus.',
    ]);

    $response = $this->actingAs($this->teacher)
        ->get('/teacher/observations?date_from=2026-08-01&date_to=2026-08-31&search=rajin');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('observations.data', 1)
        );
});

test('summary returns aggregate for filtered observations', function () {
    ObservationEntry::factory()->create([
        'student_id' => $this->student->id,
        'teacher_id' => $this->teacher->id,
        'sentiment' => 'positive',
    ]);

    $response = $this->actingAs($this->teacher)->get('/teacher/observations');

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.total', 1)
            ->where('summary.sentiments.positive', 1)
            ->has('scoreThresholds.positive')
        );
});

test('student role cannot access observation pages', function () {
    $studentUser = User::factory()->student()->create();

    $this->actingAs($studentUser)
        ->get('/teacher/observations')
        ->assertForbidden();
});

<?php

use App\Models\AcademicYear;
use App\Models\CharacterIndicator;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

test('academic core tables are created with expected columns', function () {
    expect(Schema::hasColumns('academic_years', [
        'id',
        'name',
        'start_date',
        'end_date',
        'is_active',
        'created_at',
        'updated_at',
    ]))->toBeTrue()
        ->and(Schema::hasColumns('groups', [
            'id',
            'academic_year_id',
            'name',
            'description',
            'teacher_id',
            'is_active',
            'created_at',
            'updated_at',
        ]))->toBeTrue()
        ->and(Schema::hasColumns('students', [
            'id',
            'user_id',
            'student_code',
            'birth_date',
            'gender',
            'current_group_id',
            'enrollment_date',
            'status',
            'created_at',
            'updated_at',
        ]))->toBeTrue()
        ->and(Schema::hasColumns('group_student_histories', [
            'id',
            'student_id',
            'group_id',
            'academic_year_id',
            'joined_at',
            'left_at',
            'created_at',
            'updated_at',
        ]))->toBeTrue();
});

test('character indicators table is created with expected columns', function () {
    expect(Schema::hasColumns('character_indicators', [
        'id',
        'code',
        'name',
        'description',
        'category',
        'is_warning_indicator',
        'is_active',
        'created_at',
        'updated_at',
    ]))->toBeTrue();
});

test('academic core records can be persisted with relationships', function () {
    $academicYear = AcademicYear::factory()->active()->create();
    $teacher = User::factory()->teacher()->create();
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => $teacher->id,
    ]);
    $studentUser = User::factory()->student()->create();
    $student = Student::factory()->create([
        'user_id' => $studentUser->id,
        'current_group_id' => $group->id,
    ]);

    $history = GroupStudentHistory::factory()->create([
        'student_id' => $student->id,
        'group_id' => $group->id,
        'academic_year_id' => $academicYear->id,
    ]);

    expect($group->academicYear->is($academicYear))->toBeTrue()
        ->and($group->teacher->is($teacher))->toBeTrue()
        ->and($student->user->is($studentUser))->toBeTrue()
        ->and($student->currentGroup->is($group))->toBeTrue()
        ->and($history->student->is($student))->toBeTrue();
});

test('student code and character indicator code must be unique', function () {
    Student::factory()->create([
        'student_code' => 'STR-00001',
    ]);
    CharacterIndicator::factory()->create([
        'code' => 'honesty',
    ]);

    expect(fn () => Student::factory()->create([
        'student_code' => 'STR-00001',
    ]))->toThrow(QueryException::class)
        ->and(fn () => CharacterIndicator::factory()->create([
            'code' => 'honesty',
        ]))->toThrow(QueryException::class);
});

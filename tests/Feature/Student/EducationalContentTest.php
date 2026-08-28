<?php

use App\Enums\ContentEmotionResponse;
use App\Enums\EducationalContentStatus;
use App\Enums\EducationalContentType;
use App\Models\AcademicYear;
use App\Models\CharacterIndicator;
use App\Models\ContentInteraction;
use App\Models\EducationalContent;
use App\Models\Group;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->teacher = User::factory()->teacher()->create(['name' => 'Ustadz Materi']);
    $this->studentUser = User::factory()->student()->create(['name' => 'Ahmad Materi']);

    $academicYear = AcademicYear::factory()->create(['is_active' => true]);
    $group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => $this->teacher->id,
        'name' => 'Kelas Materi',
    ]);

    $this->student = Student::factory()->create([
        'user_id' => $this->studentUser->id,
        'current_group_id' => $group->id,
    ]);
});

test('student can view published educational content list and detail without warnings', function () {
    $indicator = CharacterIndicator::factory()->create(['name' => 'Tanggung Jawab']);
    $published = EducationalContent::factory()->create([
        'title' => 'Membersihkan Masjid',
        'slug' => 'membersihkan-masjid',
        'content_type' => EducationalContentType::Story,
        'status' => EducationalContentStatus::Published,
    ]);
    $published->indicators()->sync([$indicator->id]);

    EducationalContent::factory()->draft()->create([
        'title' => 'Draft Tidak Tampil',
        'slug' => 'draft-tidak-tampil',
    ]);

    $this->actingAs($this->studentUser)
        ->get('/student/contents')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/contents/index')
            ->where('student.name', 'Ahmad Materi')
            ->where('contents.data.0.title', 'Membersihkan Masjid')
            ->has('contents.data', 1)
            ->missing('warnings')
        );

    $this->actingAs($this->studentUser)
        ->get('/student/contents/membersihkan-masjid')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/contents/show')
            ->where('content.title', 'Membersihkan Masjid')
            ->where('content.indicators.0.name', 'Tanggung Jawab')
            ->where('studentHasProfile', true)
            ->missing('warnings')
        );

    expect(ContentInteraction::query()
        ->where('student_id', $this->student->id)
        ->where('educational_content_id', $published->id)
        ->whereNotNull('started_at')
        ->exists())->toBeTrue();
});

test('student can submit emoticon response for educational content', function () {
    $content = EducationalContent::factory()->create([
        'slug' => 'kisah-berani-jujur',
        'status' => EducationalContentStatus::Published,
    ]);

    $this->actingAs($this->studentUser)
        ->post('/student/contents/kisah-berani-jujur/interactions', [
            'emotion_response' => ContentEmotionResponse::Inspired->value,
            'completed' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('content_interactions', [
        'student_id' => $this->student->id,
        'educational_content_id' => $content->id,
        'emotion_response' => ContentEmotionResponse::Inspired->value,
    ]);

    expect(ContentInteraction::query()
        ->where('student_id', $this->student->id)
        ->where('educational_content_id', $content->id)
        ->first()?->completed_at)->not->toBeNull();
});

test('student cannot view draft educational content and teacher cannot access student content pages', function () {
    $draft = EducationalContent::factory()->draft()->create([
        'slug' => 'materi-draft',
    ]);

    $this->actingAs($this->studentUser)
        ->get("/student/contents/{$draft->slug}")
        ->assertNotFound();

    $this->actingAs($this->teacher)
        ->get('/student/contents')
        ->assertForbidden();
});

test('recommendation mapping prefers content linked to validated indicators', function () {
    $honesty = CharacterIndicator::factory()->create([
        'code' => 'honesty',
        'name' => 'Kejujuran',
    ]);
    $responsibility = CharacterIndicator::factory()->create([
        'code' => 'responsibility',
        'name' => 'Tanggung Jawab',
    ]);

    $recommended = EducationalContent::factory()->create([
        'title' => 'Kisah Jujur Nabi',
        'slug' => 'kisah-jujur-nabi',
        'status' => EducationalContentStatus::Published,
        'created_at' => now()->subDay(),
    ]);
    $recommended->indicators()->sync([$honesty->id]);

    $fallback = EducationalContent::factory()->create([
        'title' => 'Kisah Tanggung Jawab',
        'slug' => 'kisah-tanggung-jawab',
        'status' => EducationalContentStatus::Published,
        'created_at' => now(),
    ]);
    $fallback->indicators()->sync([$responsibility->id]);

    $attempt = TestAttempt::factory()->create([
        'student_id' => $this->student->id,
        'status' => 'submitted',
    ]);
    $answer = TestAnswer::factory()->create([
        'test_attempt_id' => $attempt->id,
    ]);
    TeacherValidation::factory()->create([
        'test_answer_id' => $answer->id,
        'teacher_id' => $this->teacher->id,
        'final_indicators_json' => [
            ['code' => 'honesty', 'score' => 0.8],
        ],
    ]);

    $this->actingAs($this->studentUser)
        ->get('/student/contents')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/contents/index')
            ->where('recommended.0.title', 'Kisah Jujur Nabi')
        );
});

test('student content remains readable when student profile row is missing but response is blocked', function () {
    $orphanUser = User::factory()->student()->create(['name' => 'Santri Belum Profil']);
    $content = EducationalContent::factory()->create([
        'slug' => 'cerita-tanpa-profil',
        'status' => EducationalContentStatus::Published,
    ]);

    $this->actingAs($orphanUser)
        ->get('/student/contents/cerita-tanpa-profil')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('student/contents/show')
            ->where('content.title', $content->title)
            ->where('studentHasProfile', false)
        );

    $this->actingAs($orphanUser)
        ->post('/student/contents/cerita-tanpa-profil/interactions', [
            'emotion_response' => ContentEmotionResponse::Happy->value,
            'completed' => true,
        ])
        ->assertSessionHasErrors('student');
});

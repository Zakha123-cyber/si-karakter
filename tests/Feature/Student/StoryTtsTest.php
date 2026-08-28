<?php

use App\Enums\TestPackageStatus;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\Student;
use App\Models\TestPackage;
use App\Models\User;
use App\Services\TextToSpeech\FakeTextToSpeechService;
use App\Services\TextToSpeech\TextToSpeechService;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->studentUser = User::factory()->student()->create();

    $academicYear = AcademicYear::factory()->create(['is_active' => true]);

    $this->group = Group::factory()->create([
        'academic_year_id' => $academicYear->id,
        'teacher_id' => null,
        'is_active' => true,
    ]);

    $this->student = Student::factory()->create([
        'user_id' => $this->studentUser->id,
        'current_group_id' => $this->group->id,
    ]);

    $this->package = TestPackage::factory()->create([
        'status' => TestPackageStatus::Published,
        'start_at' => now()->subDay(),
        'end_at' => now()->addDay(),
    ]);
    $this->package->groups()->attach($this->group->id);

    $this->case = MoralCase::factory()->create([
        'story' => 'Cerita teladan tentang kejujuran.',
    ]);
    $this->package->cases()->attach($this->case->id, ['sort_order' => 1]);

    $this->fakeTts = new FakeTextToSpeechService;
    $this->app->instance(TextToSpeechService::class, $this->fakeTts);

    Storage::fake('local');
});

test('student can stream the generated story audio and it is cached per story', function () {
    $this->fakeTts->returning('wav-bytes-1');

    $response = $this->actingAs($this->studentUser)
        ->get("/student/stories/{$this->case->id}/tts");

    $response->assertOk()
        ->assertHeader('content-type', 'audio/wav')
        ->assertHeader('content-disposition', 'inline; filename="cerita-'.$this->case->id.'.wav"');

    expect(
        Storage::disk('local')->get(
            config('tts.cache_path').'/'.sha1($this->case->story).'.wav',
        ),
    )->toBe('wav-bytes-1');

    Storage::disk('local')->assertExists(
        config('tts.cache_path').'/'.sha1($this->case->story).'.wav',
    );

    $this->actingAs($this->studentUser)
        ->get("/student/stories/{$this->case->id}/tts")
        ->assertOk();

    expect($this->fakeTts->synthesizeCount)->toBe(1);
});

test('story tts returns 403 when the story is not part of a visible package', function () {
    $invisibleCase = MoralCase::factory()->create([
        'story' => 'Cerita rahasia.',
    ]);

    $response = $this->actingAs($this->studentUser)
        ->get("/student/stories/{$invisibleCase->id}/tts");

    $response->assertForbidden();

    Storage::disk('local')->assertDirectoryEmpty(config('tts.cache_path'));
});

test('story tts returns 403 when the package has not started yet', function () {
    $this->package->update(['start_at' => now()->addDay()]);

    $response = $this->actingAs($this->studentUser)
        ->get("/student/stories/{$this->case->id}/tts");

    $response->assertForbidden();
});

test('story tts is forbidden for non-student roles', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)
        ->get("/student/stories/{$this->case->id}/tts");

    $response->assertForbidden();
});

test('story tts returns 502 when the provider fails', function () {
    $this->fakeTts->failNext('Service down');

    $response = $this->actingAs($this->studentUser)
        ->get("/student/stories/{$this->case->id}/tts");

    $response->assertStatus(502);

    Storage::disk('local')->assertDirectoryEmpty(config('tts.cache_path'));
});

<?php

use App\Enums\EducationalContentStatus;
use App\Enums\EducationalContentType;
use App\Models\CharacterIndicator;
use App\Models\ContentInteraction;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create(['name' => 'Admin Konten']);
    $this->teacher = User::factory()->teacher()->create(['name' => 'Ustadz Konten']);
    $this->studentUser = User::factory()->student()->create(['name' => 'Santri Konten']);
});

test('teacher can manage educational contents with indicator mapping', function () {
    $indicator = CharacterIndicator::factory()->create([
        'code' => 'honesty',
        'name' => 'Kejujuran',
    ]);

    $this->actingAs($this->admin)
        ->get('/teacher/educational-contents')
        ->assertForbidden();

    $this->actingAs($this->studentUser)
        ->get('/teacher/educational-contents')
        ->assertForbidden();

    $response = $this->actingAs($this->teacher)->post('/teacher/educational-contents', [
        'title' => 'Kisah Jujur di Kantin',
        'content_type' => EducationalContentType::Story->value,
        'description' => 'Cerita pendek tentang jujur saat membeli makanan.',
        'content_body' => 'Ahmad menemukan uang kembali lebih banyak dan mengembalikannya.',
        'duration_seconds' => 180,
        'status' => EducationalContentStatus::Published->value,
    ]);

    $response->assertRedirect();

    $content = EducationalContent::query()->where('title', 'Kisah Jujur di Kantin')->firstOrFail();

    expect($content->slug)->toBe('kisah-jujur-di-kantin')
        ->and($content->created_by)->toBe($this->teacher->id);

    $this->actingAs($this->teacher)
        ->post("/teacher/educational-contents/{$content->id}/indicators", [
            'indicator_ids' => [$indicator->id],
        ])
        ->assertRedirect();

    expect($content->fresh()->indicators()->pluck('character_indicators.id')->all())
        ->toBe([$indicator->id]);

    $this->actingAs($this->teacher)
        ->get('/teacher/educational-contents')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/educational-contents/index')
            ->where('basePath', '/teacher/educational-contents')
            ->where('contents.data.0.title', 'Kisah Jujur di Kantin')
            ->where('contents.data.0.indicators.0.name', 'Kejujuran')
            ->where('contentTypes.4', 'story')
        );
});

test('teacher can upload educational content media and thumbnail', function () {
    Storage::fake('public');

    $content = EducationalContent::factory()->create([
        'content_type' => EducationalContentType::Image,
        'status' => EducationalContentStatus::Published,
        'created_by' => $this->teacher->id,
    ]);

    $this->actingAs($this->teacher)
        ->post("/teacher/educational-contents/{$content->id}/media", [
            'type' => 'thumbnail',
            'media' => UploadedFile::fake()->image('thumb.jpg'),
        ])
        ->assertRedirect();

    $content->refresh();
    expect($content->thumbnail_path)->not->toBeNull();
    Storage::disk('public')->assertExists($content->thumbnail_path);

    $this->actingAs($this->teacher)
        ->post("/teacher/educational-contents/{$content->id}/media", [
            'type' => 'media',
            'media' => UploadedFile::fake()->image('materi.png'),
        ])
        ->assertRedirect();

    $content->refresh();
    expect($content->media_path)->not->toBeNull();
    Storage::disk('public')->assertExists($content->media_path);
});

test('draft educational content media is previewable by teacher only', function () {
    Storage::fake('public');
    Storage::disk('public')->put('educational-contents/media/draft.txt', 'materi draft');

    $content = EducationalContent::factory()->draft()->create([
        'media_path' => 'educational-contents/media/draft.txt',
        'created_by' => $this->admin->id,
    ]);

    $this->actingAs($this->studentUser)
        ->get(route('educational-contents.media', ['educationalContent' => $content->id, 'type' => 'media']))
        ->assertNotFound();

    $this->actingAs($this->teacher)
        ->get(route('educational-contents.media', ['educationalContent' => $content->id, 'type' => 'media']))
        ->assertOk();

    $this->actingAs($this->admin)
        ->get(route('educational-contents.media', ['educationalContent' => $content->id, 'type' => 'media']))
        ->assertNotFound();
});

test('educational content with interactions cannot be deleted', function () {
    $content = EducationalContent::factory()->create([
        'created_by' => $this->teacher->id,
    ]);
    ContentInteraction::factory()->create([
        'educational_content_id' => $content->id,
    ]);

    $this->actingAs($this->teacher)
        ->delete("/teacher/educational-contents/{$content->id}")
        ->assertSessionHasErrors('content');

    expect(EducationalContent::query()->whereKey($content->id)->exists())->toBeTrue();
});

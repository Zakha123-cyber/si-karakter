<?php

use App\Enums\TranscriptionStatus;
use App\Jobs\TranscribeAnswerJob;
use App\Models\AnswerAudioFile;
use App\Models\TestAnswer;
use App\Models\Transcription;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

test('non teacher cannot retry transcription', function () {
    $admin = User::factory()->admin()->create();
    $answer = TestAnswer::factory()->create();

    $response = $this->actingAs($admin)->post("/teacher/reviews/{$answer->id}/retry-transcription");

    $response->assertForbidden();
});

test('teacher can retry transcription for an answer with audio', function () {
    Queue::fake();

    $teacher = User::factory()->teacher()->create();
    $answer = TestAnswer::factory()->create();
    $audioFile = AnswerAudioFile::factory()->for($answer, 'testAnswer')->create();
    Transcription::factory()->for($answer, 'testAnswer')->create([
        'status' => TranscriptionStatus::Failed->value,
        'error_message' => 'Timeout',
    ]);

    $response = $this->actingAs($teacher)->post("/teacher/reviews/{$answer->id}/retry-transcription");

    $response->assertOk()->assertJsonPath('success', true);

    $this->assertDatabaseHas('transcriptions', [
        'test_answer_id' => $answer->id,
        'status' => TranscriptionStatus::Pending->value,
        'error_message' => null,
    ]);

    Queue::assertPushed(TranscribeAnswerJob::class, fn (TranscribeAnswerJob $job) => $job->answerAudioFileId === $audioFile->id);
});

test('retry transcription fails gracefully when answer has no audio', function () {
    Queue::fake();

    $teacher = User::factory()->teacher()->create();
    $answer = TestAnswer::factory()->create();

    $response = $this->actingAs($teacher)->post("/teacher/reviews/{$answer->id}/retry-transcription");

    $response
        ->assertStatus(422)
        ->assertJsonPath('success', false);

    Queue::assertNotPushed(TranscribeAnswerJob::class);
});

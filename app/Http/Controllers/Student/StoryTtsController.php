<?php

namespace App\Http\Controllers\Student;

use App\Enums\TestPackageStatus;
use App\Http\Controllers\Controller;
use App\Models\MoralCase;
use App\Models\Student;
use App\Services\TextToSpeech\Exceptions\TextToSpeechException;
use App\Services\TextToSpeech\TextToSpeechService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StoryTtsController extends Controller
{
    public function __invoke(
        Request $request,
        MoralCase $moralCase,
        TextToSpeechService $tts,
    ): BinaryFileResponse {
        $student = Student::query()
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $this->canAccessStory($student, $moralCase)) {
            Log::warning('StoryTtsController: story tts access denied.', [
                'user_id' => $request->user()->id,
                'moral_case_id' => $moralCase->id,
            ]);

            abort(403);
        }

        if (! config('tts.enabled', true)) {
            abort(404);
        }

        $disk = Storage::disk((string) config('tts.cache_disk', 'local'));
        $hash = sha1($moralCase->story);
        $path = (string) config('tts.cache_path', 'tts/stories')."/{$hash}.wav";

        $source = 'cache';

        if (! $this->hasCachedAudio($path)) {
            $lock = Cache::lock('tts:'.$hash, 60);

            try {
                $lock->block(10);
            } catch (\Throwable) {
                Log::warning('StoryTtsController: synthesis lock timeout.', [
                    'moral_case_id' => $moralCase->id,
                    'story_hash' => $hash,
                ]);

                abort(503, 'Suara cerita sedang sibuk, coba lagi sebentar.');
            }

            try {
                if (! $this->hasCachedAudio($path)) {
                    $startedAt = hrtime(true);
                    $result = $tts->synthesize($moralCase->story);
                    $durationMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

                    $disk->put($path, $result->audio);
                    $source = 'synthesized';

                    Log::info('StoryTtsController: story audio synthesized and cached.', [
                        'student_id' => $student->id,
                        'moral_case_id' => $moralCase->id,
                        'story_hash' => $hash,
                        'provider' => $result->provider,
                        'model' => $result->model,
                        'sampling_rate' => $result->samplingRate,
                        'duration_ms' => $durationMs,
                        'size_bytes' => strlen($result->audio),
                    ]);
                }
            } catch (TextToSpeechException $exception) {
                Log::error('StoryTtsController: story synthesis failed.', [
                    'student_id' => $student->id,
                    'moral_case_id' => $moralCase->id,
                    'story_hash' => $hash,
                    'error' => $exception->getMessage(),
                ]);

                abort(502, 'Suara cerita sedang tidak tersedia, coba lagi nanti.');
            } finally {
                $lock->release();
            }
        }

        Log::info('StoryTtsController: story audio served.', [
            'student_id' => $student->id,
            'moral_case_id' => $moralCase->id,
            'story_hash' => $hash,
            'source' => $source,
            'size_bytes' => $disk->size($path),
        ]);

        return response()->file($disk->path($path), [
            'Content-Type' => 'audio/wav',
            'Content-Disposition' => 'inline; filename="cerita-'.$moralCase->id.'.wav"',
        ]);
    }

    /**
     * @phpstan-impure
     */
    private function hasCachedAudio(string $path): bool
    {
        return Storage::disk((string) config('tts.cache_disk', 'local'))->exists($path);
    }

    private function canAccessStory(?Student $student, MoralCase $moralCase): bool
    {
        if ($student === null || $student->current_group_id === null) {
            return false;
        }

        return $moralCase->testPackages()
            ->where('status', TestPackageStatus::Published)
            ->whereHas('groups', fn ($query) => $query->where('groups.id', $student->current_group_id))
            ->where(fn ($query) => $query->whereNull('start_at')->orWhere('start_at', '<=', now()))
            ->where(fn ($query) => $query->whereNull('end_at')->orWhere('end_at', '>=', now()))
            ->exists();
    }
}

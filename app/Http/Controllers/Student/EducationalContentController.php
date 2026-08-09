<?php

namespace App\Http\Controllers\Student;

use App\Domain\EducationalContent\EducationalContentRecommendationService;
use App\Enums\ContentEmotionResponse;
use App\Enums\EducationalContentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\Contents\StoreContentInteractionRequest;
use App\Models\CharacterIndicator;
use App\Models\ContentInteraction;
use App\Models\EducationalContent;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EducationalContentController extends Controller
{
    public function __construct(
        private readonly EducationalContentRecommendationService $recommendationService,
    ) {}

    public function index(Request $request): Response
    {
        $student = $this->studentFor($request);
        $recommended = $this->recommendationService->recommendedForStudent($student, 4);

        $contents = EducationalContent::query()
            ->with(['indicators:id,code,name,category'])
            ->where('status', EducationalContentStatus::Published)
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('content_body', 'like', "%{$search}%");
                });
            })
            ->when($request->string('content_type')->toString() !== '', fn ($query) => $query->where('content_type', $request->string('content_type')->toString()))
            ->when($request->integer('indicator_id') > 0, fn ($query) => $query->whereHas('indicators', fn ($indicatorQuery) => $indicatorQuery->where('character_indicators.id', $request->integer('indicator_id'))))
            ->latest()
            ->paginate(9)
            ->withQueryString()
            ->through(fn (EducationalContent $content) => $this->listPayload($content, $student));

        return Inertia::render('student/contents/index', [
            'student' => [
                'name' => $request->user()->name,
                'group' => $student?->currentGroup?->name,
            ],
            'contents' => $contents,
            'recommended' => $recommended->map(fn (EducationalContent $content) => $this->listPayload($content, $student))->values(),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'content_type' => $request->string('content_type')->toString(),
                'indicator_id' => $request->integer('indicator_id'),
            ],
            'contentTypes' => ['video', 'comic', 'image', 'audio', 'story'],
            'characterIndicators' => CharacterIndicator::query()
                ->where('is_active', true)
                ->whereHas('educationalContents', fn ($query) => $query->where('status', EducationalContentStatus::Published))
                ->select(['id', 'name', 'category'])
                ->orderBy('category')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function show(Request $request, EducationalContent $educationalContent): Response
    {
        abort_unless($educationalContent->status === EducationalContentStatus::Published, 404);

        $student = $this->studentFor($request);
        $educationalContent->load(['indicators:id,code,name,category']);

        $interaction = $student === null
            ? null
            : ContentInteraction::query()
                ->where('student_id', $student->id)
                ->where('educational_content_id', $educationalContent->id)
                ->latest()
                ->first();

        if ($student !== null && $interaction === null) {
            $interaction = ContentInteraction::query()->create([
                'student_id' => $student->id,
                'educational_content_id' => $educationalContent->id,
                'started_at' => now(),
            ]);
        }

        $related = $this->recommendationService->recommendedForStudent($student, 3, $educationalContent);

        return Inertia::render('student/contents/show', [
            'content' => $this->detailPayload($educationalContent, $interaction, $student),
            'related' => $related->map(fn (EducationalContent $content) => $this->listPayload($content, $student))->values(),
            'emotionOptions' => $this->emotionOptions(),
            'studentHasProfile' => $student !== null,
        ]);
    }

    public function interact(StoreContentInteractionRequest $request, EducationalContent $educationalContent): RedirectResponse
    {
        abort_unless($educationalContent->status === EducationalContentStatus::Published, 404);

        $student = $this->studentFor($request);

        if ($student === null) {
            return back()->withErrors([
                'student' => 'Profil santri belum lengkap. Materi tetap bisa dibaca, tetapi respons belum dapat disimpan.',
            ]);
        }

        $validated = $request->validated();

        ContentInteraction::query()->updateOrCreate(
            [
                'student_id' => $student->id,
                'educational_content_id' => $educationalContent->id,
            ],
            [
                'emotion_response' => (string) $validated['emotion_response'],
                'started_at' => now(),
                'completed_at' => $request->boolean('completed', true) ? now() : null,
            ]
        );

        return back()->with('status', 'Responsmu sudah tersimpan. Terima kasih sudah berbagi perasaan baikmu!');
    }

    private function studentFor(Request $request): ?Student
    {
        return Student::query()
            ->with('currentGroup:id,name')
            ->where('user_id', $request->user()->id)
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function listPayload(EducationalContent $content, ?Student $student): array
    {
        $completed = $student === null
            ? false
            : ContentInteraction::query()
                ->where('student_id', $student->id)
                ->where('educational_content_id', $content->id)
                ->whereNotNull('completed_at')
                ->exists();

        return [
            'id' => $content->id,
            'title' => $content->title,
            'slug' => $content->slug,
            'content_type' => $content->content_type->value,
            'description' => $content->description,
            'thumbnail_url' => $content->thumbnail_path === null ? null : route('educational-contents.media', ['educationalContent' => $content->id, 'type' => 'thumbnail']),
            'duration_seconds' => $content->duration_seconds,
            'completed' => $completed,
            'indicators' => $content->indicators->map(fn (CharacterIndicator $indicator) => [
                'id' => $indicator->id,
                'name' => $indicator->name,
                'category' => $indicator->category,
            ])->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detailPayload(EducationalContent $content, ?ContentInteraction $interaction, ?Student $student): array
    {
        return [
            ...$this->listPayload($content, $student),
            'content_body' => $content->content_body,
            'media_url' => $content->media_path === null ? null : route('educational-contents.media', ['educationalContent' => $content->id, 'type' => 'media']),
            'interaction' => $interaction === null ? null : [
                'emotion_response' => $interaction->emotion_response?->value,
                'started_at' => $interaction->started_at?->toISOString(),
                'completed_at' => $interaction->completed_at?->toISOString(),
            ],
        ];
    }

    /**
     * @return array<int, array{value: string, label: string, emoji: string}>
     */
    private function emotionOptions(): array
    {
        return [
            ['value' => ContentEmotionResponse::Happy->value, 'label' => 'Senang', 'emoji' => '😊'],
            ['value' => ContentEmotionResponse::Inspired->value, 'label' => 'Semangat', 'emoji' => '🤩'],
            ['value' => ContentEmotionResponse::Curious->value, 'label' => 'Penasaran', 'emoji' => '🤔'],
            ['value' => ContentEmotionResponse::Calm->value, 'label' => 'Tenang', 'emoji' => '😌'],
        ];
    }
}

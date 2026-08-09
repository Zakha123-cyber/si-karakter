<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EducationalContentStatus;
use App\Enums\EducationalContentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EducationalContents\AssignEducationalContentIndicatorsRequest;
use App\Http\Requests\Admin\EducationalContents\StoreEducationalContentRequest;
use App\Http\Requests\Admin\EducationalContents\UpdateEducationalContentRequest;
use App\Http\Requests\Admin\EducationalContents\UploadEducationalContentMediaRequest;
use App\Models\CharacterIndicator;
use App\Models\EducationalContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EducationalContentController extends Controller
{
    public function index(Request $request): Response
    {
        $contents = EducationalContent::query()
            ->with([
                'creator:id,name',
                'indicators' => fn ($query) => $query->select('character_indicators.id', 'code', 'name', 'category')->orderBy('category')->orderBy('name'),
            ])
            ->withCount(['indicators', 'interactions'])
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('content_body', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString() !== '', fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->string('content_type')->toString() !== '', fn ($query) => $query->where('content_type', $request->string('content_type')->toString()))
            ->when($request->integer('indicator_id') > 0, fn ($query) => $query->whereHas('indicators', fn ($indicatorQuery) => $indicatorQuery->where('character_indicators.id', $request->integer('indicator_id'))))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (EducationalContent $content) => $this->contentPayload($content));

        return Inertia::render('admin/educational-contents/index', [
            'contents' => $contents,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
                'content_type' => $request->string('content_type')->toString(),
                'indicator_id' => $request->integer('indicator_id'),
            ],
            'contentTypes' => EducationalContentType::values(),
            'statuses' => EducationalContentStatus::values(),
            'characterIndicators' => CharacterIndicator::query()
                ->select(['id', 'code', 'name', 'category'])
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreEducationalContentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        EducationalContent::query()->create([
            ...$data,
            'slug' => $this->uniqueSlug((string) $data['title']),
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('status', 'Materi edukasi berhasil dibuat.');
    }

    public function update(UpdateEducationalContentRequest $request, EducationalContent $educationalContent): RedirectResponse
    {
        $data = $request->validated();
        $title = (string) $data['title'];

        $educationalContent->forceFill([
            ...$data,
            'slug' => $title !== $educationalContent->title
                ? $this->uniqueSlug($title, $educationalContent)
                : $educationalContent->slug,
        ])->save();

        return back()->with('status', 'Materi edukasi berhasil diperbarui.');
    }

    public function destroy(EducationalContent $educationalContent): RedirectResponse
    {
        if ($educationalContent->interactions()->exists()) {
            return back()->withErrors([
                'content' => 'Materi yang sudah memiliki interaksi santri tidak dapat dihapus. Ubah status menjadi arsip jika tidak ingin ditampilkan.',
            ]);
        }

        DB::transaction(function () use ($educationalContent) {
            $mediaPath = $educationalContent->media_path;
            $thumbnailPath = $educationalContent->thumbnail_path;

            $educationalContent->delete();

            $this->deleteMedia($mediaPath);
            $this->deleteMedia($thumbnailPath);
        });

        return back()->with('status', 'Materi edukasi berhasil dihapus.');
    }

    public function assignIndicators(AssignEducationalContentIndicatorsRequest $request, EducationalContent $educationalContent): RedirectResponse
    {
        $educationalContent->indicators()->sync($request->input('indicator_ids', []));

        return back()->with('status', 'Pemetaan indikator materi berhasil diperbarui.');
    }

    public function uploadMedia(UploadEducationalContentMediaRequest $request, EducationalContent $educationalContent): RedirectResponse
    {
        $type = $request->string('type')->toString();
        $file = $request->file('media');
        abort_unless($file instanceof UploadedFile, 422);

        $directory = $type === 'thumbnail' ? 'educational-contents/thumbnails' : 'educational-contents/media';
        $column = $type === 'thumbnail' ? 'thumbnail_path' : 'media_path';
        $oldPath = $educationalContent->{$column};
        $filename = Str::uuid()->toString().'.'.$file->extension();
        $path = $file->storeAs($directory, $filename, 'public');

        $educationalContent->forceFill([
            $column => $path,
        ])->save();

        $this->deleteMedia($oldPath);

        return back()->with('status', $type === 'thumbnail' ? 'Thumbnail materi berhasil diupload.' : 'Media materi berhasil diupload.');
    }

    /**
     * @return array<string, mixed>
     */
    private function contentPayload(EducationalContent $content): array
    {
        return [
            'id' => $content->id,
            'title' => $content->title,
            'slug' => $content->slug,
            'content_type' => $content->content_type->value,
            'description' => $content->description,
            'content_body' => $content->content_body,
            'media_path' => $content->media_path,
            'media_url' => $content->media_path === null ? null : route('educational-contents.media', ['educationalContent' => $content->id, 'type' => 'media']),
            'thumbnail_path' => $content->thumbnail_path,
            'thumbnail_url' => $content->thumbnail_path === null ? null : route('educational-contents.media', ['educationalContent' => $content->id, 'type' => 'thumbnail']),
            'duration_seconds' => $content->duration_seconds,
            'status' => $content->status->value,
            'indicators_count' => (int) $content->getAttribute('indicators_count'),
            'interactions_count' => (int) $content->getAttribute('interactions_count'),
            'creator_name' => $content->creator?->name,
            'indicators' => $content->indicators->map(fn (CharacterIndicator $indicator) => [
                'id' => $indicator->id,
                'code' => $indicator->code,
                'name' => $indicator->name,
                'category' => $indicator->category,
            ])->values(),
            'created_at' => $content->created_at?->toISOString(),
        ];
    }

    private function uniqueSlug(string $title, ?EducationalContent $ignore = null): string
    {
        $base = Str::slug($title) ?: 'materi-edukasi';
        $slug = $base;
        $suffix = 2;

        while (EducationalContent::query()
            ->where('slug', $slug)
            ->when($ignore !== null, fn ($query) => $query->whereKeyNot($ignore->id))
            ->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function deleteMedia(?string $path): void
    {
        if ($path !== null) {
            Storage::disk('public')->delete($path);
        }
    }
}

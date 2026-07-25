<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\MoralCases\AssignMoralCaseIndicatorsRequest;
use App\Http\Requests\Teacher\MoralCases\StoreMoralCaseOptionRequest;
use App\Http\Requests\Teacher\MoralCases\StoreMoralCaseRequest;
use App\Http\Requests\Teacher\MoralCases\UpdateMoralCaseOptionRequest;
use App\Http\Requests\Teacher\MoralCases\UpdateMoralCaseRequest;
use App\Http\Requests\Teacher\MoralCases\UploadMoralCaseMediaRequest;
use App\Models\CharacterIndicator;
use App\Models\MoralCase;
use App\Models\MoralCaseOption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MoralCaseController extends Controller
{
    public function index(Request $request): Response
    {
        $cases = MoralCase::query()
            ->with([
                'options' => fn ($query) => $query->orderBy('sort_order')->orderBy('label'),
                'indicators' => fn ($query) => $query->select('character_indicators.id', 'code', 'name', 'category')->orderBy('category')->orderBy('name'),
            ])
            ->withCount(['options', 'indicators', 'testPackages'])
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('story', 'like', "%{$search}%");
                });
            })
            ->when($request->string('active')->toString() !== '', fn ($query) => $query->where('is_active', $request->boolean('active')))
            ->orderBy('sort_order')
            ->orderBy('title')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (MoralCase $moralCase) => $this->casePayload($moralCase));

        return Inertia::render('teacher/moral-cases/index', [
            'moralCases' => $cases,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'active' => $request->string('active')->toString(),
            ],
            'characterIndicators' => CharacterIndicator::query()
                ->select(['id', 'code', 'name', 'category', 'is_warning_indicator'])
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreMoralCaseRequest $request): RedirectResponse
    {
        MoralCase::query()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('status', 'Kasus moral berhasil dibuat.');
    }

    public function update(UpdateMoralCaseRequest $request, MoralCase $moralCase): RedirectResponse
    {
        $moralCase->forceFill([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ])->save();

        return back()->with('status', 'Kasus moral berhasil diperbarui.');
    }

    public function destroy(MoralCase $moralCase): RedirectResponse
    {
        if ($moralCase->testPackages()->exists()) {
            return back()->withErrors([
                'case' => 'Kasus yang sudah dipakai paket tes tidak dapat dihapus.',
            ]);
        }

        $this->deleteMedia($moralCase->image_path);
        $this->deleteMedia($moralCase->audio_path);
        $moralCase->delete();

        return back()->with('status', 'Kasus moral berhasil dihapus.');
    }

    public function storeOption(StoreMoralCaseOptionRequest $request, MoralCase $moralCase): RedirectResponse
    {
        $moralCase->options()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('status', 'Pilihan kasus berhasil dibuat.');
    }

    public function updateOption(UpdateMoralCaseOptionRequest $request, MoralCase $moralCase, MoralCaseOption $option): RedirectResponse
    {
        $this->ensureOptionBelongsToCase($moralCase, $option);

        $option->forceFill([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ])->save();

        return back()->with('status', 'Pilihan kasus berhasil diperbarui.');
    }

    public function destroyOption(MoralCase $moralCase, MoralCaseOption $option): RedirectResponse
    {
        $this->ensureOptionBelongsToCase($moralCase, $option);
        $option->delete();

        return back()->with('status', 'Pilihan kasus berhasil dihapus.');
    }

    public function assignIndicators(AssignMoralCaseIndicatorsRequest $request, MoralCase $moralCase): RedirectResponse
    {
        $sync = collect($request->input('indicators', []))
            ->mapWithKeys(fn (array $indicator) => [
                (int) $indicator['id'] => [
                    'weight' => $indicator['weight'],
                ],
            ])
            ->all();

        $moralCase->indicators()->sync($sync);

        return back()->with('status', 'Indikator kasus berhasil diperbarui.');
    }

    public function uploadMedia(UploadMoralCaseMediaRequest $request, MoralCase $moralCase): RedirectResponse
    {
        $type = $request->string('type')->toString();
        $file = $request->file('media');
        $directory = $type === 'audio' ? 'moral-cases/audio' : 'moral-cases/images';
        $column = $type === 'audio' ? 'audio_path' : 'image_path';
        $oldPath = $moralCase->{$column};
        $filename = Str::uuid()->toString().'.'.$file->extension();
        $path = $file->storeAs($directory, $filename, 'local');

        $moralCase->forceFill([
            $column => $path,
        ])->save();

        $this->deleteMedia($oldPath);

        return back()->with('status', $type === 'audio' ? 'Audio kasus berhasil diupload.' : 'Gambar kasus berhasil diupload.');
    }

    /**
     * @return array<string, mixed>
     */
    private function casePayload(MoralCase $moralCase): array
    {
        return [
            'id' => $moralCase->id,
            'title' => $moralCase->title,
            'story' => $moralCase->story,
            'sort_order' => $moralCase->sort_order,
            'is_active' => $moralCase->is_active,
            'image_path' => $moralCase->image_path,
            'audio_path' => $moralCase->audio_path,
            'options_count' => $moralCase->options_count,
            'indicators_count' => $moralCase->indicators_count,
            'test_packages_count' => $moralCase->test_packages_count,
            'options' => $moralCase->options->map(fn (MoralCaseOption $option) => [
                'id' => $option->id,
                'label' => $option->label,
                'text' => $option->text,
                'internal_value' => $option->internal_value,
                'sort_order' => $option->sort_order,
                'is_active' => $option->is_active,
            ])->values(),
            'indicators' => $moralCase->indicators->map(fn (CharacterIndicator $indicator) => [
                'id' => $indicator->id,
                'code' => $indicator->code,
                'name' => $indicator->name,
                'category' => $indicator->category,
                'weight' => (float) $indicator->pivot->weight,
            ])->values(),
            'created_at' => $moralCase->created_at?->toISOString(),
        ];
    }

    private function ensureOptionBelongsToCase(MoralCase $moralCase, MoralCaseOption $option): void
    {
        abort_if($option->moral_case_id !== $moralCase->id, 404);
    }

    private function deleteMedia(?string $path): void
    {
        if ($path !== null) {
            Storage::disk('local')->delete($path);
        }
    }
}

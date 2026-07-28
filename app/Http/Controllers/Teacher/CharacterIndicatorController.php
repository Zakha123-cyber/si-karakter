<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\IndicatorCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCharacterIndicatorRequest;
use App\Http\Requests\UpdateCharacterIndicatorRequest;
use App\Models\CharacterIndicator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CharacterIndicatorController extends Controller
{
    public function index(Request $request): Response
    {
        $indicators = CharacterIndicator::query()
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($request->string('category')->toString() !== '', fn ($q) => $q->where('category', $request->string('category')->toString()))
            ->when($request->filled('is_warning_indicator'), function ($q) use ($request) {
                $q->where('is_warning_indicator', $request->boolean('is_warning_indicator'));
            })
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('teacher/character-indicators/index', [
            'indicators' => $indicators,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'category' => $request->string('category')->toString(),
                'is_warning_indicator' => $request->input('is_warning_indicator', ''),
            ],
            'categories' => IndicatorCategory::options(),
        ]);
    }

    public function store(StoreCharacterIndicatorRequest $request): RedirectResponse
    {
        $data = $request->validated();

        CharacterIndicator::query()->create([
            'code' => $data['code'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'],
            'is_warning_indicator' => $request->boolean('is_warning_indicator'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('status', 'Indikator karakter berhasil ditambahkan.');
    }

    public function update(UpdateCharacterIndicatorRequest $request, CharacterIndicator $characterIndicator): RedirectResponse
    {
        $data = $request->validated();

        $characterIndicator->update([
            'code' => $data['code'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'],
            'is_warning_indicator' => $request->boolean('is_warning_indicator'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('status', 'Indikator karakter berhasil diperbarui.');
    }

    public function updateStatus(Request $request, CharacterIndicator $characterIndicator): RedirectResponse
    {
        $data = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $characterIndicator->forceFill($data)->save();

        return back()->with('status', 'Status indikator berhasil diperbarui.');
    }

    public function destroy(CharacterIndicator $characterIndicator): RedirectResponse
    {
        $characterIndicator->delete();

        return back()->with('status', 'Indikator karakter berhasil dihapus.');
    }
}

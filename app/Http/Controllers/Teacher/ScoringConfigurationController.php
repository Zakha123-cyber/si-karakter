<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScoringConfigurationRequest;
use App\Http\Requests\UpdateScoringConfigurationRequest;
use App\Models\ScoringConfiguration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScoringConfigurationController extends Controller
{
    public function index(Request $request): Response
    {
        $configurations = ScoringConfiguration::query()
            ->with('creator')
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('teacher/scoring-configurations/index', [
            'configurations' => $configurations,
            'filters' => [
                'search' => $request->string('search')->toString(),
            ],
        ]);
    }

    public function store(StoreScoringConfigurationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->boolean('is_active')) {
            ScoringConfiguration::query()->where('is_active', true)->update(['is_active' => false]);
        }

        ScoringConfiguration::query()->create([
            ...$data,
            'is_active' => $request->boolean('is_active', false),
            'created_by' => $request->user()->id,
        ]);

        return back()->with('status', 'Konfigurasi bobot berhasil ditambahkan.');
    }

    public function update(UpdateScoringConfigurationRequest $request, ScoringConfiguration $scoringConfiguration): RedirectResponse
    {
        $data = $request->validated();

        if ($request->boolean('is_active')) {
            ScoringConfiguration::query()
                ->where('is_active', true)
                ->where('id', '!=', $scoringConfiguration->id)
                ->update(['is_active' => false]);
        }

        $scoringConfiguration->update([
            ...$data,
            'is_active' => $request->boolean('is_active', false),
        ]);

        return back()->with('status', 'Konfigurasi bobot berhasil diperbarui.');
    }

    public function destroy(ScoringConfiguration $scoringConfiguration): RedirectResponse
    {
        $scoringConfiguration->delete();

        return back()->with('status', 'Konfigurasi bobot berhasil dihapus.');
    }
}

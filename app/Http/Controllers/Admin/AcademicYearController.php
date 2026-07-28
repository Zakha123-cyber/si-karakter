<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    public function index(Request $request): Response
    {
        $academicYears = AcademicYear::query()
            ->when($request->string('search')->toString() !== '', function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where('name', 'like', "%{$search}%");
            })
            ->withCount('groups')
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (AcademicYear $ay) => [
                'id' => $ay->id,
                'name' => $ay->name,
                'start_date' => $ay->start_date->toDateString(),
                'end_date' => $ay->end_date->toDateString(),
                'is_active' => $ay->is_active,
                'groups_count' => $ay->groups_count,
            ]);

        return Inertia::render('admin/academic-years/index', [
            'academic_years' => $academicYears,
            'filters' => [
                'search' => $request->string('search')->toString(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($data['is_active'] ?? false) {
            AcademicYear::query()->where('is_active', true)->update(['is_active' => false]);
        }

        AcademicYear::query()->create($data);

        return back()->with('status', 'Tahun ajaran berhasil dibuat.');
    }

    public function update(Request $request, AcademicYear $academicYear): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after:start_date'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (($data['is_active'] ?? false) && !$academicYear->is_active) {
            AcademicYear::query()->where('is_active', true)->update(['is_active' => false]);
        }

        $academicYear->update($data);

        return back()->with('status', 'Tahun ajaran berhasil diperbarui.');
    }

    public function destroy(AcademicYear $academicYear): RedirectResponse
    {
        if ($academicYear->groups()->exists()) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus tahun ajaran yang memiliki kelompok.']);
        }

        $academicYear->delete();

        return back()->with('status', 'Tahun ajaran berhasil dihapus.');
    }

    public function activate(AcademicYear $academicYear): RedirectResponse
    {
        AcademicYear::query()->where('is_active', true)->update(['is_active' => false]);
        $academicYear->forceFill(['is_active' => true])->save();

        return back()->with('status', 'Tahun ajaran berhasil diaktifkan.');
    }
}

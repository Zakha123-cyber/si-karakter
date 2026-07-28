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
            ->withCount('groups')
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (AcademicYear $academicYear) => [
                'id' => $academicYear->id,
                'name' => $academicYear->name,
                'start_date' => $academicYear->start_date?->toISOString(),
                'end_date' => $academicYear->end_date?->toISOString(),
                'is_active' => $academicYear->is_active,
                'groups_count' => $academicYear->groups_count,
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
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        AcademicYear::query()->create($data);

        return back()->with('status', 'Tahun ajaran berhasil dibuat.');
    }

    public function update(Request $request, AcademicYear $academicYear): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

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

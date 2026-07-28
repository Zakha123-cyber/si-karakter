<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(Request $request): Response
    {
        $groups = Group::query()
            ->with('academicYear')
            ->with('teacher:id,name,username')
            ->withCount('students')
            ->when($request->string('search')->toString() !== '', function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where('name', 'like', "%{$search}%");
            })
            ->when($request->integer('academic_year_id'), fn ($q, $id) => $q->where('academic_year_id', $id))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Group $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'description' => $g->description,
                'academic_year_id' => $g->academic_year_id,
                'teacher_id' => $g->teacher_id,
                'is_active' => $g->is_active,
                'students_count' => $g->students_count,
                'academic_year' => $g->academicYear ? [
                    'id' => $g->academicYear->id,
                    'name' => $g->academicYear->name,
                ] : null,
                'teacher' => $g->teacher ? [
                    'id' => $g->teacher->id,
                    'name' => $g->teacher->name,
                ] : null,
            ]);

        $academicYears = AcademicYear::query()->select('id', 'name')->get();
        $teachers = User::query()->where('role', 'teacher')->select('id', 'name')->get();

        return Inertia::render('admin/groups/index', [
            'groups' => $groups,
            'academic_years' => $academicYears,
            'teachers' => $teachers,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'academic_year_id' => $request->integer('academic_year_id'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        Group::query()->create($data);

        return back()->with('status', 'Kelompok berhasil dibuat.');
    }

    public function update(Request $request, Group $group): RedirectResponse
    {
        $data = $request->validate([
            'academic_year_id' => ['sometimes', 'exists:academic_years,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $group->update($data);

        return back()->with('status', 'Kelompok berhasil diperbarui.');
    }

    public function destroy(Group $group): RedirectResponse
    {
        if ($group->students()->exists()) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus kelompok yang memiliki santri.']);
        }

        $group->delete();

        return back()->with('status', 'Kelompok berhasil dihapus.');
    }

    public function assignStudents(Request $request, Group $group): RedirectResponse
    {
        $data = $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'integer', 'exists:students,id'],
        ]);

        $academicYear = AcademicYear::query()->where('is_active', true)->first();

        if (!$academicYear) {
            return back()->withErrors(['error' => 'Tidak ada tahun ajaran aktif.']);
        }

        DB::transaction(function () use ($data, $group, $academicYear) {
            foreach ($data['student_ids'] as $studentId) {
                $student = Student::query()->findOrFail($studentId);

                if ($student->current_group_id === $group->id) {
                    continue;
                }

                if ($student->current_group_id) {
                    GroupStudentHistory::query()->where('student_id', $studentId)
                        ->whereNull('left_at')
                        ->update(['left_at' => now()->toDateString()]);
                }

                GroupStudentHistory::query()->create([
                    'student_id' => $studentId,
                    'group_id' => $group->id,
                    'academic_year_id' => $academicYear->id,
                    'joined_at' => now()->toDateString(),
                ]);

                $student->forceFill(['current_group_id' => $group->id])->save();
            }
        });

        return back()->with('status', 'Santri berhasil ditambahkan ke kelompok.');
    }

    public function removeStudent(Group $group, Student $student): RedirectResponse
    {
        if ($student->current_group_id !== $group->id) {
            return back()->withErrors(['error' => 'Santri tidak berada di kelompok ini.']);
        }

        DB::transaction(function () use ($student, $group) {
            GroupStudentHistory::query()->where('student_id', $student->id)
                ->where('group_id', $group->id)
                ->whereNull('left_at')
                ->update(['left_at' => now()->toDateString()]);

            $student->forceFill(['current_group_id' => null])->save();
        });

        return back()->with('status', 'Santri berhasil dikeluarkan dari kelompok.');
    }
}

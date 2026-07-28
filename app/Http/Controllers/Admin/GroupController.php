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
use Illuminate\Support\Arr;
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

        $academicYears = AcademicYear::query()->select('id', 'name', 'is_active')->get()->map(fn ($ay) => [
            'id' => $ay->id,
            'name' => $ay->name,
            'is_active' => $ay->is_active,
        ]);
        $teachers = User::query()->where('role', 'teacher')->select('id', 'name')->get();
        $students = Student::query()
            ->with('user:id,name,username')
            ->with('currentGroup:id,name,academic_year_id')
            ->get()
            ->map(fn (Student $s) => [
                'id' => $s->id,
                'student_code' => $s->student_code,
                'user' => $s->user ? ['id' => $s->user->id, 'name' => $s->user->name] : null,
                'current_group_id' => $s->current_group_id,
                'current_group' => $s->currentGroup ? [
                    'id' => $s->currentGroup->id,
                    'name' => $s->currentGroup->name,
                    'academic_year_id' => $s->currentGroup->academic_year_id,
                ] : null,
            ]);

        return Inertia::render('admin/groups/index', [
            'groups' => $groups,
            'academic_years' => $academicYears,
            'teachers' => $teachers,
            'students' => $students,
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
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'exists:students,id'],
        ]);

        $studentIds = array_unique(array_filter(($data['student_ids'] ?? [])));
        $data['teacher_id'] = $data['teacher_id'] ?: null;
        $data['description'] = $data['description'] ?: null;

        DB::transaction(function () use ($data, $studentIds) {
            $group = Group::query()->create(Arr::except($data, 'student_ids'));

            foreach ($studentIds as $studentId) {
                GroupStudentHistory::query()->create([
                    'student_id' => $studentId,
                    'group_id' => $group->id,
                    'academic_year_id' => $data['academic_year_id'],
                    'joined_at' => now()->toDateString(),
                ]);
                Student::query()->where('id', $studentId)->update(['current_group_id' => $group->id]);
            }
        });

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
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'exists:students,id'],
        ]);

        $newIds = array_unique(array_filter(($data['student_ids'] ?? [])));
        $data['teacher_id'] = $data['teacher_id'] ?: null;
        $data['description'] = $data['description'] ?: null;

        DB::transaction(function () use ($data, $group, $newIds) {
            $group->update(Arr::except($data, 'student_ids'));

            $currentIds = $group->students()->pluck('id')->toArray();
            $ayId = $data['academic_year_id'] ?? $group->academic_year_id;

            $toRemove = array_diff($currentIds, $newIds);
            foreach ($toRemove as $sid) {
                GroupStudentHistory::query()->where('student_id', $sid)
                    ->where('group_id', $group->id)->whereNull('left_at')
                    ->update(['left_at' => now()->toDateString()]);
                Student::query()->where('id', $sid)->update(['current_group_id' => null]);
            }

            $toAdd = array_diff($newIds, $currentIds);
            foreach ($toAdd as $sid) {
                GroupStudentHistory::query()->where('student_id', $sid)
                    ->whereNull('left_at')->update(['left_at' => now()->toDateString()]);
                GroupStudentHistory::query()->create([
                    'student_id' => $sid,
                    'group_id' => $group->id,
                    'academic_year_id' => $ayId,
                    'joined_at' => now()->toDateString(),
                ]);
                Student::query()->where('id', $sid)->update(['current_group_id' => $group->id]);
            }
        });

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
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'exists:students,id'],
        ]);

        $newIds = array_unique(array_filter(($data['student_ids'] ?? [])));

        DB::transaction(function () use ($data, $group, $newIds) {
            $currentIds = $group->students()->pluck('id')->toArray();

            $toRemove = array_diff($currentIds, $newIds);
            foreach ($toRemove as $sid) {
                GroupStudentHistory::query()->where('student_id', $sid)
                    ->where('group_id', $group->id)->whereNull('left_at')
                    ->update(['left_at' => now()->toDateString()]);
                Student::query()->where('id', $sid)->update(['current_group_id' => null]);
            }

            $toAdd = array_diff($newIds, $currentIds);
            foreach ($toAdd as $sid) {
                GroupStudentHistory::query()->where('student_id', $sid)
                    ->whereNull('left_at')->update(['left_at' => now()->toDateString()]);
                GroupStudentHistory::query()->create([
                    'student_id' => $sid,
                    'group_id' => $group->id,
                    'academic_year_id' => $group->academic_year_id,
                    'joined_at' => now()->toDateString(),
                ]);
                Student::query()->where('id', $sid)->update(['current_group_id' => $group->id]);
            }
        });

        return back()->with('status', 'Santri berhasil diperbarui.');
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

<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(Request $request): Response
    {
        $groups = Group::query()
            ->with(['academicYear', 'teacher'])
            ->withCount('students')
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->integer('academic_year_id'), fn ($query, $id) => $query->where('academic_year_id', $id))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Group $group) => [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'academic_year_id' => $group->academic_year_id,
                'academic_year' => $group->academicYear ? ['id' => $group->academicYear->id, 'name' => $group->academicYear->name] : null,
                'teacher_id' => $group->teacher_id,
                'teacher' => $group->teacher ? ['id' => $group->teacher->id, 'name' => $group->teacher->name] : null,
                'is_active' => $group->is_active,
                'students_count' => $group->students_count,
            ]);

        return Inertia::render('admin/groups/index', [
            'groups' => $groups,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'academic_year_id' => $request->integer('academic_year_id'),
            ],
            'academic_years' => AcademicYear::query()->select('id', 'name')->latest()->get(),
            'teachers' => User::query()
                ->where('role', UserRole::Teacher->value)
                ->where('is_active', true)
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'academic_year_id' => ['required', Rule::exists(AcademicYear::class, 'id')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', Rule::exists(User::class, 'id')->where('role', UserRole::Teacher->value)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        Group::query()->create($data);

        return back()->with('status', 'Kelompok berhasil dibuat.');
    }

    public function update(Request $request, Group $group): RedirectResponse
    {
        $data = $request->validate([
            'academic_year_id' => ['required', Rule::exists(AcademicYear::class, 'id')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'teacher_id' => ['nullable', Rule::exists(User::class, 'id')->where('role', UserRole::Teacher->value)],
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

    public function assignStudent(Request $request, Group $group): RedirectResponse
    {
        $data = $request->validate([
            'student_id' => ['required', Rule::exists(Student::class, 'id')],
        ]);

        $student = Student::query()->findOrFail($data['student_id']);
        $previousGroupId = $student->current_group_id;

        $student->forceFill(['current_group_id' => $group->id])->save();

        if ($previousGroupId) {
            GroupStudentHistory::query()
                ->where('student_id', $student->id)
                ->where('group_id', $previousGroupId)
                ->whereNull('left_at')
                ->update(['left_at' => Carbon::today()]);
        }

        GroupStudentHistory::query()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'academic_year_id' => $group->academic_year_id,
            'joined_at' => Carbon::today(),
        ]);

        return back()->with('status', 'Santri berhasil ditambahkan ke kelompok.');
    }

    public function removeStudent(Group $group, Student $student): RedirectResponse
    {
        if ($student->current_group_id !== $group->id) {
            return back()->withErrors(['error' => 'Santri tidak berada di kelompok ini.']);
        }

        $student->forceFill(['current_group_id' => null])->save();

        GroupStudentHistory::query()
            ->where('student_id', $student->id)
            ->where('group_id', $group->id)
            ->whereNull('left_at')
            ->update(['left_at' => Carbon::today()]);

        return back()->with('status', 'Santri berhasil dikeluarkan dari kelompok.');
    }
}

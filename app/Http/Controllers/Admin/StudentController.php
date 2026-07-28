<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $students = Student::query()
            ->with(['user', 'currentGroup'])
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('student_code', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%"));
                });
            })
            ->when($request->integer('group_id'), fn ($query, $id) => $query->where('current_group_id', $id))
            ->when($request->string('status')->toString() !== '', fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Student $student) => [
                'id' => $student->id,
                'user_id' => $student->user_id,
                'student_code' => $student->student_code,
                'name' => $student->user->name,
                'username' => $student->user->username,
                'birth_date' => $student->birth_date?->toISOString(),
                'gender' => $student->gender,
                'current_group_id' => $student->current_group_id,
                'current_group' => $student->currentGroup?->name,
                'enrollment_date' => $student->enrollment_date?->toISOString(),
                'status' => $student->status,
            ]);

        $groups = Group::query()->where('is_active', true)->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('admin/students/index', [
            'students' => $students,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'group_id' => $request->integer('group_id'),
                'status' => $request->string('status')->toString(),
            ],
            'groups' => $groups,
            'statuses' => ['active', 'inactive', 'graduated', 'transferred'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
            'student_code' => ['required', 'string', 'max:50', Rule::unique(Student::class)],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:20'],
            'current_group_id' => ['nullable', Rule::exists(Group::class, 'id')],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'graduated', 'transferred'])],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'username' => $data['username'],
            'password' => $data['password'],
            'role' => UserRole::Student->value,
            'is_active' => true,
        ]);

        Student::query()->create([
            'user_id' => $user->id,
            'student_code' => $data['student_code'],
            'birth_date' => $data['birth_date'] ?? null,
            'gender' => $data['gender'] ?? null,
            'current_group_id' => $data['current_group_id'] ?? null,
            'enrollment_date' => $data['enrollment_date'] ?? now(),
            'status' => $data['status'] ?? 'active',
        ]);

        return back()->with('status', 'Santri berhasil dibuat.');
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique(User::class)->ignore($student->user_id)],
            'student_code' => ['required', 'string', 'max:50', Rule::unique(Student::class)->ignore($student->id)],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:20'],
            'current_group_id' => ['nullable', Rule::exists(Group::class, 'id')],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['active', 'inactive', 'graduated', 'transferred'])],
        ]);

        $student->user->forceFill([
            'name' => $data['name'],
            'username' => $data['username'],
        ])->save();

        $student->update([
            'student_code' => $data['student_code'],
            'birth_date' => $data['birth_date'] ?? null,
            'gender' => $data['gender'] ?? null,
            'current_group_id' => $data['current_group_id'] ?? null,
            'enrollment_date' => $data['enrollment_date'] ?? null,
            'status' => $data['status'],
        ]);

        return back()->with('status', 'Santri berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive', 'graduated', 'transferred'])],
        ]);

        $student->forceFill(['status' => $data['status']])->save();

        return back()->with('status', 'Status santri berhasil diperbarui.');
    }

    public function show(Student $student): Response
    {
        $student->load(['user', 'currentGroup', 'groupStudentHistories.group', 'groupStudentHistories.academicYear']);

        return Inertia::render('admin/students/show', [
            'student' => [
                'id' => $student->id,
                'user_id' => $student->user_id,
                'student_code' => $student->student_code,
                'name' => $student->user->name,
                'username' => $student->user->username,
                'birth_date' => $student->birth_date?->toISOString(),
                'gender' => $student->gender,
                'current_group_id' => $student->current_group_id,
                'current_group' => $student->currentGroup?->name,
                'enrollment_date' => $student->enrollment_date?->toISOString(),
                'status' => $student->status,
                'is_active' => $student->user->is_active,
            ],
            'timeline' => $student->groupStudentHistories->map(fn ($history) => [
                'id' => $history->id,
                'group_name' => $history->group->name,
                'academic_year' => $history->academicYear->name,
                'joined_at' => $history->joined_at?->toISOString(),
                'left_at' => $history->left_at?->toISOString(),
            ]),
        ]);
    }
}

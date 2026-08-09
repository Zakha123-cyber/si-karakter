<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $students = Student::query()
            ->with('user:id,name,username')
            ->with('currentGroup:id,name')
            ->when($request->string('search')->toString() !== '', function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(function ($q) use ($search) {
                    $q->where('student_code', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%"));
                });
            })
            ->when($request->integer('current_group_id'), fn ($q, $id) => $q->where('current_group_id', $id))
            ->when($request->string('status')->toString() !== '', fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Student $s) => [
                'id' => $s->id,
                'user_id' => $s->user_id,
                'student_code' => $s->student_code,
                'birth_date' => $s->birth_date?->toDateString(),
                'gender' => $s->gender,
                'current_group_id' => $s->current_group_id,
                'status' => $s->status,
                'user' => $s->user ? [
                    'id' => $s->user->id,
                    'name' => $s->user->name,
                    'username' => $s->user->username,
                ] : null,
                'current_group' => $s->currentGroup ? [
                    'id' => $s->currentGroup->id,
                    'name' => $s->currentGroup->name,
                ] : null,
            ]);

        $groups = Group::query()->select('id', 'name')->get();
        $users = User::query()->where('role', 'student')
            ->whereNotIn('id', Student::query()->select('user_id'))
            ->select('id', 'name', 'username')
            ->get();

        return Inertia::render('admin/students/index', [
            'students' => $students,
            'groups' => $groups,
            'users' => $users,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'current_group_id' => $request->integer('current_group_id'),
                'status' => $request->string('status')->toString(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', Rule::unique(Student::class), 'exists:users,id'],
            'student_code' => ['required', 'string', 'max:50', Rule::unique(Student::class)],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'status' => ['sometimes', 'string', 'in:active,inactive,graduated,transferred'],
        ]);

        $data['gender'] = $data['gender'] ?: null;
        $data['birth_date'] = $data['birth_date'] ?: null;

        Student::query()->create($data);

        return back()->with('status', 'Santri berhasil dibuat.');
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate([
            'student_code' => ['sometimes', 'string', 'max:50', Rule::unique(Student::class)->ignore($student->id)],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:male,female'],
            'status' => ['sometimes', 'string', 'in:active,inactive,graduated,transferred'],
        ]);

        $data['gender'] = $data['gender'] ?: null;
        $data['birth_date'] = $data['birth_date'] ?: null;

        $student->update($data);

        return back()->with('status', 'Santri berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:active,inactive,graduated,transferred'],
        ]);

        $student->forceFill($data)->save();

        return back()->with('status', 'Status santri berhasil diperbarui.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $hasHistory = $student->testAttempts()->exists()
            || $student->observationEntries()->exists()
            || $student->goodnessPointTransactions()->exists()
            || $student->warnings()->exists()
            || $student->contentInteractions()->exists();

        if ($hasHistory) {
            return back()->withErrors([
                'student' => 'Santri memiliki riwayat tes, observasi, reward, peringatan, atau interaksi materi sehingga tidak dapat dihapus. Nonaktifkan status santri jika tidak lagi digunakan.',
            ]);
        }

        DB::transaction(function () use ($student) {
            $student->groupStudentHistories()->delete();
            $student->delete();
        });

        return back()->with('status', 'Santri berhasil dihapus.');
    }
}

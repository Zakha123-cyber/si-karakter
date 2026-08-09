<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\EarlyWarning\StudentWarningGenerator;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Warnings\GenerateWarningRequest;
use App\Http\Requests\Teacher\Warnings\ResolveWarningRequest;
use App\Http\Requests\Teacher\Warnings\ReviewWarningRequest;
use App\Http\Resources\Teacher\StudentWarningResource;
use App\Models\Student;
use App\Models\StudentWarning;
use App\Models\User;
use App\Models\WarningRule;
use App\Services\Audit\AuditLogger;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarningController extends Controller
{
    public function __construct(
        private readonly StudentWarningGenerator $warningGenerator,
        private readonly AuditLogger $auditLogger,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = StudentWarning::query()
            ->with(['student.user', 'student.currentGroup', 'warningRule', 'reviewer'])
            ->when($user?->role === UserRole::Teacher, function ($q) use ($user) {
                $q->whereHas('student.currentGroup', fn ($groupQuery) => $groupQuery->where('teacher_id', $user->id));
            });

        $search = $request->string('search')->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('student.user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('warningRule', fn ($ruleQuery) => $ruleQuery->where('name', 'like', "%{$search}%"));
            });
        }

        $query->when($request->string('status')->toString() !== '', fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->string('severity')->toString() !== '', fn ($q) => $q->where('severity', $request->string('severity')->toString()))
            ->when($request->integer('student_id'), fn ($q, $studentId) => $q->where('student_id', $studentId))
            ->latest('detected_at');

        $summaryBase = StudentWarning::query()
            ->when($user?->role === UserRole::Teacher, function ($q) use ($user) {
                $q->whereHas('student.currentGroup', fn ($groupQuery) => $groupQuery->where('teacher_id', $user->id));
            });

        $summary = [
            'total' => (clone $summaryBase)->count(),
            'open' => (clone $summaryBase)->where('status', 'open')->count(),
            'reviewed' => (clone $summaryBase)->where('status', 'reviewed')->count(),
            'resolved' => (clone $summaryBase)->where('status', 'resolved')->count(),
        ];

        $warnings = $query->paginate($request->integer('per_page', 10))->withQueryString();
        $warnings->getCollection()->transform(function (StudentWarning $warning) use ($user) {
            $canManage = $this->canAccessWarning($user, $warning);

            return (new StudentWarningResource(
                $warning,
                $canManage && $warning->status === 'open',
                $canManage && in_array($warning->status, ['open', 'reviewed'], true),
            ))->resolve();
        });

        return Inertia::render('teacher/warnings/index', [
            'warnings' => $warnings,
            'summary' => $summary,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
                'severity' => $request->string('severity')->toString(),
                'student_id' => $request->integer('student_id') ?: null,
            ],
            'students' => $this->studentOptions($user),
            'rules' => WarningRule::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'rule_type', 'severity']),
            'statuses' => $this->statusOptions(),
            'severities' => $this->severityOptions(),
        ]);
    }

    public function generate(GenerateWarningRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $studentId = $data['student_id'] ?? null;

        if ($studentId !== null) {
            /** @var Student $student */
            $student = Student::query()->with(['user', 'currentGroup'])->findOrFail($studentId);
            $this->ensureStudentVisible($student, $user);
            $created = $this->warningGenerator->generateForStudent($student);
        } else {
            $created = [];
            foreach ($this->visibleStudents($user) as $student) {
                array_push($created, ...$this->warningGenerator->generateForStudent($student));
            }
        }

        $message = count($created) > 0
            ? count($created).' catatan pendampingan baru berhasil dibuat.'
            : 'Tidak ada catatan pendampingan baru dari aturan aktif saat ini.';

        return back()->with('status', $message);
    }

    public function review(ReviewWarningRequest $request, StudentWarning $warning): RedirectResponse
    {
        $user = $request->user();
        $warning->loadMissing(['student.currentGroup']);
        $this->ensureCanManageWarning($user, $warning);

        if ($warning->status !== 'open') {
            return back()->with('status', 'Catatan pendampingan ini sudah ditinjau sebelumnya.');
        }

        $oldValues = $warning->only(['status', 'reviewed_by', 'reviewed_at', 'resolution_note']);
        $note = $request->validated('resolution_note');

        $warning->update([
            'status' => 'reviewed',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'resolution_note' => $note ?: $warning->resolution_note,
        ]);

        $this->auditLogger->record('warning.reviewed', $warning, $oldValues, $warning->only(['status', 'reviewed_by', 'reviewed_at', 'resolution_note']));

        return back()->with('status', 'Catatan pendampingan berhasil ditandai sudah ditinjau.');
    }

    public function resolve(ResolveWarningRequest $request, StudentWarning $warning): RedirectResponse
    {
        $user = $request->user();
        $warning->loadMissing(['student.currentGroup']);
        $this->ensureCanManageWarning($user, $warning);

        if ($warning->status === 'resolved') {
            return back()->with('status', 'Catatan pendampingan ini sudah diselesaikan.');
        }

        $oldValues = $warning->only(['status', 'reviewed_by', 'reviewed_at', 'resolution_note']);

        $warning->update([
            'status' => 'resolved',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'resolution_note' => $request->validated('resolution_note'),
        ]);

        $this->auditLogger->record('warning.resolved', $warning, $oldValues, $warning->only(['status', 'reviewed_by', 'reviewed_at', 'resolution_note']));

        return back()->with('status', 'Catatan pendampingan berhasil diselesaikan.');
    }

    /**
     * @return array<int, array{id: int, name: ?string, student_code: ?string, group_name: ?string}>
     */
    private function studentOptions(?User $user): array
    {
        return $this->visibleStudents($user)
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'name' => $student->user?->name,
                'student_code' => $student->student_code,
                'group_name' => $student->currentGroup?->name,
            ])
            ->all();
    }

    /**
     * @return Collection<int, Student>
     */
    private function visibleStudents(?User $user)
    {
        return Student::query()
            ->with(['user', 'currentGroup'])
            ->when($user?->role === UserRole::Teacher, function ($q) use ($user) {
                $q->whereHas('currentGroup', fn ($groupQuery) => $groupQuery->where('teacher_id', $user->id));
            })
            ->orderBy('student_code')
            ->get();
    }

    private function ensureStudentVisible(Student $student, ?User $user): void
    {
        if ($user?->role === UserRole::Admin) {
            return;
        }

        if ($student->current_group_id === null || $student->currentGroup?->teacher_id !== $user?->id) {
            abort(403, 'Santri tidak berada di kelompok Anda.');
        }
    }

    private function ensureCanManageWarning(?User $user, StudentWarning $warning): void
    {
        if (! $this->canAccessWarning($user, $warning)) {
            abort(403, 'Catatan pendampingan ini bukan kewenangan Anda.');
        }
    }

    private function canAccessWarning(?User $user, StudentWarning $warning): bool
    {
        if ($user?->role === UserRole::Admin) {
            return true;
        }

        return $user?->role === UserRole::Teacher
            && $warning->student?->currentGroup?->teacher_id === $user->id;
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return [
            ['value' => 'open', 'label' => 'Terbuka'],
            ['value' => 'reviewed', 'label' => 'Sudah Ditinjau'],
            ['value' => 'resolved', 'label' => 'Selesai'],
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function severityOptions(): array
    {
        return [
            ['value' => 'low', 'label' => 'Ringan'],
            ['value' => 'medium', 'label' => 'Sedang'],
            ['value' => 'high', 'label' => 'Prioritas Tinggi'],
        ];
    }
}

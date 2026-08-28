<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Reporting\CharacterReportService;
use App\Domain\Reporting\ReportSummaryBuilder;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Reports\GenerateReportRequest;
use App\Http\Requests\Teacher\Reports\ReviewReportRequest;
use App\Http\Requests\Teacher\Reports\UpdateReportRequest;
use App\Http\Resources\Teacher\ReportResource;
use App\Models\CharacterReport;
use App\Models\Student;
use App\Models\User;
use App\Services\AI\Exceptions\AiAssessmentException;
use App\Services\Reporting\CharacterReportPdfService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly CharacterReportService $reportService,
        private readonly ReportSummaryBuilder $summaryBuilder,
        private readonly CharacterReportPdfService $pdfService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = CharacterReport::query()
            ->with(['student.user', 'student.currentGroup', 'teacher'])
            ->when($user?->role === UserRole::Teacher, function ($q) use ($user) {
                $q->whereHas('student.currentGroup', fn ($groupQuery) => $groupQuery->where('teacher_id', $user->id));
            });

        if ($search = $request->string('search')->toString()) {
            $query->whereHas('student.user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
        }

        $query->when($request->string('status')->toString() !== '', fn ($q) => $q->where('status', $request->string('status')->toString()));

        $reports = $query->latest()->paginate($request->integer('per_page', 10))->withQueryString();

        $reports->getCollection()->transform(function (CharacterReport $report) {
            return (new ReportResource($report))->resolve();
        });

        return Inertia::render('teacher/reports/index', [
            'reports' => $reports,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'students' => $this->studentOptions($user),
            'statuses' => [
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'reviewed', 'label' => 'Direview'],
                ['value' => 'published', 'label' => 'Terbit'],
            ],
        ]);
    }

    public function generate(GenerateReportRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        /** @var Student $student */
        $student = Student::query()->with(['user', 'currentGroup'])->findOrFail($data['student_id']);
        $this->ensureStudentVisible($student, $user);

        $report = $this->reportService->generateDraft(
            $student,
            \Illuminate\Support\Carbon::parse($data['period_start']),
            \Illuminate\Support\Carbon::parse($data['period_end']),
            $user->id,
        );

        return back()->with('status', 'Draft laporan berhasil dibuat untuk '.($student->user?->name ?? 'santri').'.');
    }

    public function show(Request $request, CharacterReport $report): Response
    {
        $this->ensureReportVisible($request->user(), $report);

        $report->load(['student.user', 'student.currentGroup', 'teacher']);
        $summary = $this->summaryBuilder->buildForPeriod($report->student, $report->period_start, $report->period_end);

        return Inertia::render('teacher/reports/show', [
            'report' => (new ReportResource($report))->resolve(),
            'summary' => [
                'test_complete' => $summary->testComplete(),
                'observation_complete' => $summary->observationComplete(),
                'complete' => $summary->complete(),
            ],
        ]);
    }

    public function update(UpdateReportRequest $request, CharacterReport $report): RedirectResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        $report->update($request->validated());

        return back()->with('status', 'Narasi laporan berhasil diperbarui.');
    }

    public function generateNarrative(Request $request, CharacterReport $report): RedirectResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        try {
            $this->reportService->generateNarrativeDraft($report);
        } catch (AiAssessmentException $e) {
            return back()->with('error', 'Draft narasi AI gagal dibuat: '.$e->getMessage());
        }

        return back()->with('status', 'Draft narasi AI berhasil dibuat. Periksa dan sesuaikan sebelum disetujui.');
    }

    public function review(ReviewReportRequest $request, CharacterReport $report): RedirectResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        if ($report->status !== 'draft') {
            return back()->with('status', 'Laporan ini sudah dikonfirmasi sebelumnya.');
        }

        $this->reportService->review(
            $report,
            $request->validated('final_narrative'),
            $request->validated('recommendation'),
            $request->user()->id,
        );

        return back()->with('status', 'Laporan berhasil dikonfirmasi ustadz. Siap untuk diterbitkan.');
    }

    public function publish(Request $request, CharacterReport $report): RedirectResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        try {
            $this->reportService->publish($report);
        } catch (\LogicException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('status', 'Laporan berhasil diterbitkan beserta PDF-nya.');
    }

    public function pdf(Request $request, CharacterReport $report): BinaryFileResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        $payload = $this->pdfService->downloadPayload($report);

        return response()->file($payload['path'], [
            'Content-Type' => $payload['contentType'],
            'Content-Disposition' => 'inline; filename="'.$payload['name'].'"',
        ]);
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

    private function ensureReportVisible(?User $user, CharacterReport $report): void
    {
        if ($user?->role === UserRole::Admin) {
            return;
        }

        $report->loadMissing(['student.currentGroup']);

        if ($report->student?->currentGroup?->teacher_id !== $user?->id) {
            abort(403, 'Laporan ini bukan kewenangan Anda.');
        }
    }
}

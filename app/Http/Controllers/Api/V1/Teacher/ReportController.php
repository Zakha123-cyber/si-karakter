<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Domain\Reporting\CharacterReportService;
use App\Domain\Reporting\ReportSummaryBuilder;
use App\Enums\UserRole;
use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Reports\GenerateReportRequest;
use App\Http\Requests\Teacher\Reports\ReviewReportRequest;
use App\Http\Requests\Teacher\Reports\UpdateReportRequest;
use App\Http\Resources\Teacher\ReportResource;
use App\Models\CharacterReport;
use App\Models\Student;
use App\Services\AI\Exceptions\AiAssessmentException;
use App\Services\Reporting\CharacterReportPdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    use RespondsWithApiResponse;

    public function __construct(
        private readonly CharacterReportService $reportService,
        private readonly ReportSummaryBuilder $summaryBuilder,
        private readonly CharacterReportPdfService $pdfService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = CharacterReport::query()
            ->with(['student.user', 'student.currentGroup', 'teacher'])
            ->when($user?->role === UserRole::Teacher, function ($query) use ($user) {
                $query->whereHas('student.currentGroup', fn ($groupQuery) => $groupQuery->where('teacher_id', $user->id));
            });

        if ($search = $request->string('search')->toString()) {
            $query->whereHas('student.user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
        }

        if ($request->string('status')->toString() !== '') {
            $query->where('status', $request->string('status')->toString());
        }

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->integer('student_id'));
        }

        $reports = $query->latest()->paginate(min($request->integer('per_page', 15), 100));

        return $this->success('Reports retrieved', ReportResource::collection($reports));
    }

    public function generate(GenerateReportRequest $request): JsonResponse
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

        return $this->success('Report draft generated', [
            'report' => new ReportResource($report),
        ], 201);
    }

    public function show(Request $request, CharacterReport $report): JsonResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        $report->load(['student.user', 'student.currentGroup', 'teacher']);

        return $this->success('Report retrieved', [
            'report' => new ReportResource($report),
        ]);
    }

    public function update(UpdateReportRequest $request, CharacterReport $report): JsonResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        $report->update($request->validated());

        return $this->success('Report updated', [
            'report' => new ReportResource($report->fresh()->load(['student.user', 'student.currentGroup', 'teacher'])),
        ]);
    }

    public function generateNarrative(Request $request, CharacterReport $report): JsonResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        try {
            $this->reportService->generateNarrativeDraft($report);
        } catch (AiAssessmentException $e) {
            return $this->error('Gagal membuat draft narasi AI: '.$e->getMessage(), 502);
        }

        return $this->success('Narrative draft generated. Periksa dan sesuaikan sebelum disetujui.', [
            'report' => new ReportResource($report->fresh()->load(['student.user', 'student.currentGroup', 'teacher'])),
        ]);
    }

    public function review(ReviewReportRequest $request, CharacterReport $report): JsonResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        if ($report->status !== 'draft') {
            return $this->error('Laporan ini sudah dikonfirmasi sebelumnya.', 422);
        }

        $this->reportService->review(
            $report,
            $request->validated('final_narrative'),
            $request->validated('recommendation'),
            $request->user()->id,
        );

        return $this->success('Report reviewed', [
            'report' => new ReportResource($report->fresh()->load(['student.user', 'student.currentGroup', 'teacher'])),
        ]);
    }

    public function publish(Request $request, CharacterReport $report): JsonResponse
    {
        $this->ensureReportVisible($request->user(), $report);

        try {
            $this->reportService->publish($report);
        } catch (\LogicException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success('Report published', [
            'report' => new ReportResource($report->fresh()->load(['student.user', 'student.currentGroup', 'teacher'])),
        ]);
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

    private function ensureStudentVisible(Student $student, ?\App\Models\User $user): void
    {
        if ($user?->role === UserRole::Admin) {
            return;
        }

        if ($student->current_group_id === null || $student->currentGroup?->teacher_id !== $user?->id) {
            abort(403, 'Santri tidak berada di kelompok Anda.');
        }
    }

    private function ensureReportVisible(?\App\Models\User $user, CharacterReport $report): void
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

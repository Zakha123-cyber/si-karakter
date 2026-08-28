<?php

namespace App\Domain\Reporting;

use App\Domain\Scoring\CombinedScoreCalculator;
use App\Domain\Scoring\MoralLevelMapper;
use App\DTOs\ReportNarrativeInput;
use App\Models\CharacterReport;
use App\Models\Student;
use App\Services\AI\ReportNarrativeService;
use App\Services\Audit\AuditLogger;
use App\Services\Reporting\CharacterReportPdfService;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class CharacterReportService
{
    public function __construct(
        private readonly ReportSummaryBuilder $summaryBuilder,
        private readonly CombinedScoreCalculator $combinedCalculator,
        private readonly MoralLevelMapper $levelMapper,
        private readonly ReportNarrativeService $narrativeService,
        private readonly CharacterReportPdfService $pdfService,
        private readonly AuditLogger $auditLogger,
    ) {}

    /**
     * Buat laporan draft untuk satu santri pada periode.
     * Bila laporan untuk santri+periode yang sama sudah ada, isinya diperbarui.
     */
    public function generateDraft(
        Student $student,
        CarbonInterface $periodStart,
        CarbonInterface $periodEnd,
        int $teacherId,
    ): CharacterReport {
        $summary = $this->summaryBuilder->buildForPeriod($student, $periodStart, $periodEnd);
        $combined = $this->combinedCalculator->calculate(
            $summary->testScore,
            $summary->observationScore,
        );

        $payload = [
            'test_summary_json' => $summary->toTestSummaryJson(),
            'observation_summary_json' => $summary->toObservationSummaryJson(),
            'final_narrative' => '',
            'recommendation' => '',
            'ai_generated_narrative' => null,
        ];

        return DB::transaction(function () use ($student, $periodStart, $periodEnd, $teacherId, $payload, $combined) {
            $existing = CharacterReport::query()
                ->where('student_id', $student->id)
                ->whereDate('period_start', $periodStart->toDateString())
                ->whereDate('period_end', $periodEnd->toDateString())
                ->first();

            if ($existing !== null) {
                $existing->update([
                    ...$payload,
                    'status' => 'draft',
                    'pdf_path' => null,
                    'published_at' => null,
                    'teacher_id' => $teacherId,
                ]);

                $report = $existing;
            } else {
                $report = CharacterReport::query()->create([
                    'student_id' => $student->id,
                    'period_start' => $periodStart->toDateString(),
                    'period_end' => $periodEnd->toDateString(),
                    'status' => 'draft',
                    'teacher_id' => $teacherId,
                    ...$payload,
                ]);
            }

            $this->auditLogger->record('report.generated', $report, null, [
                'student_id' => $student->id,
                'period_start' => $report->period_start->toDateString(),
                'period_end' => $report->period_end->toDateString(),
                'test_score' => $combined->testScore,
                'observation_score' => $combined->observationScore,
                'combined_score' => $combined->score,
            ]);

            return $report;
        });
    }

    /**
     * Buat draft narasi memakai LLM. Draft disimpan di ai_generated_narrative,
     * bukan sebagai narasi final (hasil AI bukan keputusan final).
     */
    public function generateNarrativeDraft(CharacterReport $report): CharacterReport
    {
        $summary = $this->summaryBuilder->buildForPeriod(
            $report->student,
            $report->period_start,
            $report->period_end,
        );
        $combined = $this->combinedCalculator->calculate(
            $summary->testScore,
            $summary->observationScore,
        );

        $result = $this->narrativeService->generate(new ReportNarrativeInput(
            studentName: $report->student?->user?->name ?? 'Santri',
            periodStart: $report->period_start->toDateString(),
            periodEnd: $report->period_end->toDateString(),
            testSummary: $report->test_summary_json ?? $summary->toTestSummaryJson(),
            observationSummary: $report->observation_summary_json ?? $summary->toObservationSummaryJson(),
            combined: [
                'score' => $combined->score,
                'level' => $combined->score !== null ? $this->levelMapper->levelForScore($combined->score) : null,
                'test_weight' => $combined->testWeight,
                'observation_weight' => $combined->observationWeight,
            ],
        ));

        $report->update([
            'ai_generated_narrative' => $result->narrative,
            'recommendation' => $result->recommendation ?: $report->recommendation,
        ]);

        $this->auditLogger->record('report.narrative_generated', $report, null, [
            'provider' => $result->provider,
            'model' => $result->model,
            'prompt_version' => $result->promptVersion,
        ]);

        return $report->fresh();
    }

    /**
     * Konfirmasi ustadz: narasi final dipakai sebagai narasi laporan.
     */
    public function review(CharacterReport $report, string $finalNarrative, string $recommendation, int $teacherId): CharacterReport
    {
        $oldValues = $report->only(['status', 'final_narrative', 'recommendation', 'teacher_id']);

        $report->update([
            'status' => 'reviewed',
            'final_narrative' => $finalNarrative,
            'recommendation' => $recommendation,
            'teacher_id' => $teacherId,
        ]);

        $this->auditLogger->record('report.reviewed', $report, $oldValues, $report->only(['status', 'final_narrative', 'recommendation', 'teacher_id']));

        return $report->fresh();
    }

    /**
     * Publish laporan: membuat PDF dan menandai diterbitkan.
     */
    public function publish(CharacterReport $report): CharacterReport
    {
        if ($report->status !== 'reviewed') {
            throw new \LogicException('Hanya laporan berstatus reviewed yang dapat dipublikasikan.');
        }

        $pdfPath = $this->pdfService->generate($report);

        $oldValues = $report->only(['status', 'pdf_path', 'published_at']);

        $report->update([
            'status' => 'published',
            'pdf_path' => $pdfPath,
            'published_at' => now(),
        ]);

        $this->auditLogger->record('report.published', $report, $oldValues, $report->only(['status', 'pdf_path', 'published_at']));

        return $report->fresh();
    }
}

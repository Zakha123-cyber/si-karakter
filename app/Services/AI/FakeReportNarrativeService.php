<?php

namespace App\Services\AI;

use App\DTOs\ReportNarrativeInput;
use App\DTOs\ReportNarrativeResult;
use App\Services\AI\Exceptions\AiAssessmentException;

class FakeReportNarrativeService implements ReportNarrativeService
{
    private bool $shouldFail = false;

    private string $failureMessage = 'Fake AI narrative failure';

    private string $narrative = '';

    public function failNext(string $message = 'Fake AI narrative failure'): static
    {
        $this->shouldFail = true;
        $this->failureMessage = $message;

        return $this;
    }

    public function returning(string $narrative): static
    {
        $this->narrative = $narrative;

        return $this;
    }

    public function generate(ReportNarrativeInput $input): ReportNarrativeResult
    {
        if ($this->shouldFail) {
            throw new AiAssessmentException($this->failureMessage);
        }

        $level = $input->combined['level'] ?? 'conventional';

        return new ReportNarrativeResult(
            narrative: $this->narrative !== ''
                ? $this->narrative
                : "Santri {$input->studentName} menunjukkan perkembangan karakter pada tingkat {$level} selama periode laporan. Santri mengikuti tes moral dan observasi harian dengan baik.",
            recommendation: 'Ustadz disarankan memberikan pendampingan lanjutan dan mencatat perkembangan positif dalam keseharian santri.',
            provider: 'fake',
            model: 'fake-report-narrative',
            promptVersion: 'report-narrative-v1',
            rawResponse: ['note' => 'fake narrative result'],
        );
    }
}

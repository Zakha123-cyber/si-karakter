<?php

namespace App\Services\AI;

use App\DTOs\MoralAssessmentInput;
use App\DTOs\MoralAssessmentResult;
use App\Services\AI\Exceptions\AiAssessmentException;

class FakeMoralAssessmentService implements MoralAssessmentService
{
    private bool $shouldFail = false;

    private string $failureMessage = 'Fake AI assessment failure';

    private string $moralLevel = 'conventional';

    public function failNext(string $message = 'Fake AI assessment failure'): static
    {
        $this->shouldFail = true;
        $this->failureMessage = $message;

        return $this;
    }

    public function returning(string $moralLevel): static
    {
        $this->moralLevel = $moralLevel;

        return $this;
    }

    public function assess(MoralAssessmentInput $input): MoralAssessmentResult
    {
        if ($this->shouldFail) {
            throw new AiAssessmentException($this->failureMessage);
        }

        return new MoralAssessmentResult(
            moralLevel: $this->moralLevel,
            confidence: 0.85,
            indicators: [
                ['code' => 'honesty', 'score' => 0.8],
                ['code' => 'responsibility', 'score' => 0.7],
            ],
            reasoningSummary: 'Santri memberikan alasan berdasarkan aturan yang berlaku di lingkungannya.',
            warningSignals: [],
            suggestedIntervention: null,
            provider: 'fake',
            model: 'fake-moral-classifier',
            promptVersion: 'moral-classifier-v1',
            rawResponse: ['note' => 'fake assessment result'],
        );
    }
}

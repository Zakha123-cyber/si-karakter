<?php

namespace App\Services\AI;

use App\DTOs\ReportNarrativeInput;
use App\DTOs\ReportNarrativeResult;
use App\Services\AI\Exceptions\AiAssessmentException;

interface ReportNarrativeService
{
    /**
     * @throws AiAssessmentException
     */
    public function generate(ReportNarrativeInput $input): ReportNarrativeResult;
}

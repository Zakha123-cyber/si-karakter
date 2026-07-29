<?php

namespace App\Services\AI;

use App\DTOs\MoralAssessmentInput;
use App\DTOs\MoralAssessmentResult;
use App\Services\AI\Exceptions\AiAssessmentException;

interface MoralAssessmentService
{
    /**
     * @throws AiAssessmentException
     */
    public function assess(MoralAssessmentInput $input): MoralAssessmentResult;
}

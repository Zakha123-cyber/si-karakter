<?php

namespace App\DTOs;

readonly class MoralAssessmentInput
{
    /**
     * @param  array{title: string, story: string, selected_option: string}  $case
     * @param  array{typed_reason: ?string, transcript: ?string}  $studentAnswer
     * @param  array{levels: string[]}  $rubric
     * @param  string[]  $allowedIndicators
     */
    public function __construct(
        public array $case,
        public array $studentAnswer,
        public array $rubric,
        public array $allowedIndicators,
    ) {}
}

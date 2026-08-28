<?php

namespace App\Domain\EarlyWarning;

use App\Models\Student;
use App\Models\WarningRule;

final readonly class DetectedWarning
{
    /**
     * @param  array<string, mixed>  $evidence
     */
    public function __construct(
        public WarningRule $rule,
        public Student $student,
        public string $sourceType,
        public ?int $sourceId,
        public string $title,
        public string $description,
        public string $severity,
        public array $evidence,
    ) {}
}

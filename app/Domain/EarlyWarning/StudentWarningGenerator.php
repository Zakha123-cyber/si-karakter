<?php

namespace App\Domain\EarlyWarning;

use App\Models\ObservationEntry;
use App\Models\Student;
use App\Models\StudentWarning;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;

class StudentWarningGenerator
{
    public function __construct(
        private readonly WarningRuleEngine $ruleEngine,
        private readonly AuditLogger $auditLogger,
    ) {}

    /**
     * @return array<int, StudentWarning>
     */
    public function generateForObservation(ObservationEntry $entry): array
    {
        return $this->persistDetectedWarnings(
            $this->ruleEngine->evaluateForObservation($entry),
        );
    }

    /**
     * @return array<int, StudentWarning>
     */
    public function generateForStudent(Student $student): array
    {
        return $this->persistDetectedWarnings(
            $this->ruleEngine->evaluateForStudent($student),
        );
    }

    /**
     * @param  array<int, DetectedWarning>  $detectedWarnings
     * @return array<int, StudentWarning>
     */
    private function persistDetectedWarnings(array $detectedWarnings): array
    {
        $created = [];

        foreach ($detectedWarnings as $detectedWarning) {
            $warning = DB::transaction(function () use ($detectedWarning) {
                $existing = StudentWarning::query()
                    ->where('student_id', $detectedWarning->student->id)
                    ->where('warning_rule_id', $detectedWarning->rule->id)
                    ->whereIn('status', ['open', 'reviewed'])
                    ->first();

                if ($existing !== null) {
                    return null;
                }

                $warning = StudentWarning::query()->create([
                    'student_id' => $detectedWarning->student->id,
                    'warning_rule_id' => $detectedWarning->rule->id,
                    'source_type' => $detectedWarning->sourceType,
                    'source_id' => $detectedWarning->sourceId,
                    'title' => $detectedWarning->title,
                    'description' => $detectedWarning->description,
                    'severity' => $detectedWarning->severity,
                    'status' => 'open',
                    'detected_at' => now(),
                    'resolution_note' => null,
                ]);

                $this->auditLogger->record('warning.generated', $warning, null, [
                    'student_id' => $warning->student_id,
                    'warning_rule_id' => $warning->warning_rule_id,
                    'source_type' => $warning->source_type,
                    'source_id' => $warning->source_id,
                    'severity' => $warning->severity,
                    'status' => $warning->status,
                    'evidence' => $detectedWarning->evidence,
                ]);

                return $warning;
            });

            if ($warning !== null) {
                $created[] = $warning;
            }
        }

        return $created;
    }
}

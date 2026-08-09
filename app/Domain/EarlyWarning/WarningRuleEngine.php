<?php

namespace App\Domain\EarlyWarning;

use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\WarningRule;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class WarningRuleEngine
{
    /**
     * @return array<int, DetectedWarning>
     */
    public function evaluateForObservation(ObservationEntry $entry): array
    {
        $entry->loadMissing(['student.user', 'student.currentGroup', 'items.characterIndicator']);

        if ($entry->student === null) {
            return [];
        }

        return $this->activeRules()
            ->filter(fn (WarningRule $rule) => $rule->rule_type === 'observation_negative_indicator')
            ->map(fn (WarningRule $rule) => $this->evaluateObservationRule($rule, $entry))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return array<int, DetectedWarning>
     */
    public function evaluateForStudent(Student $student): array
    {
        $student->loadMissing(['user', 'currentGroup']);

        return $this->activeRules()
            ->filter(fn (WarningRule $rule) => $rule->rule_type === 'observation_negative_indicator')
            ->map(fn (WarningRule $rule) => $this->evaluateStudentObservationRule($rule, $student))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @return EloquentCollection<int, WarningRule>
     */
    private function activeRules(): EloquentCollection
    {
        return WarningRule::query()
            ->where('is_active', true)
            ->orderBy('severity')
            ->get();
    }

    private function evaluateObservationRule(WarningRule $rule, ObservationEntry $entry): ?DetectedWarning
    {
        $conditions = $rule->conditions_json ?? [];
        $windowDays = $this->intCondition($conditions, 'window_days', 14);
        $minimumNegativeItems = $this->intCondition($conditions, 'minimum_negative_items', 1);
        $requireWarningIndicator = (bool) ($conditions['require_warning_indicator'] ?? true);
        $indicatorCodes = $this->stringListCondition($conditions, 'indicator_codes');
        $sourceDate = $entry->observed_at;
        $windowStart = $sourceDate->copy()->subDays(max(0, $windowDays - 1))->startOfDay();
        $windowEnd = $sourceDate->copy()->endOfDay();

        $matches = $this->matchingObservationItems($entry->student_id, $windowStart, $windowEnd, $requireWarningIndicator, $indicatorCodes);

        if ($matches->count() < $minimumNegativeItems) {
            return null;
        }

        if (! $matches->contains(fn (ObservationItem $item) => $item->observation_entry_id === $entry->id)) {
            return null;
        }

        return $this->makeDetectedWarning($rule, $entry->student, 'observation', $entry->id, $matches, $windowDays);
    }

    private function evaluateStudentObservationRule(WarningRule $rule, Student $student): ?DetectedWarning
    {
        $conditions = $rule->conditions_json ?? [];
        $windowDays = $this->intCondition($conditions, 'window_days', 14);
        $minimumNegativeItems = $this->intCondition($conditions, 'minimum_negative_items', 1);
        $requireWarningIndicator = (bool) ($conditions['require_warning_indicator'] ?? true);
        $indicatorCodes = $this->stringListCondition($conditions, 'indicator_codes');
        $windowEnd = now()->endOfDay();
        $windowStart = now()->subDays(max(0, $windowDays - 1))->startOfDay();

        $matches = $this->matchingObservationItems($student->id, $windowStart, $windowEnd, $requireWarningIndicator, $indicatorCodes);

        if ($matches->count() < $minimumNegativeItems) {
            return null;
        }

        $sourceId = $matches->sortByDesc(fn (ObservationItem $item) => $item->observationEntry?->observed_at->timestamp ?? 0)->first()?->observation_entry_id;

        return $this->makeDetectedWarning($rule, $student, 'observation', $sourceId, $matches, $windowDays);
    }

    /**
     * @param  array<int, string>  $indicatorCodes
     * @return EloquentCollection<int, ObservationItem>
     */
    private function matchingObservationItems(
        int $studentId,
        CarbonInterface $windowStart,
        CarbonInterface $windowEnd,
        bool $requireWarningIndicator,
        array $indicatorCodes,
    ): EloquentCollection {
        return ObservationItem::query()
            ->with(['characterIndicator', 'observationEntry'])
            ->where('sentiment', 'negative')
            ->whereHas('observationEntry', function ($query) use ($studentId, $windowStart, $windowEnd) {
                $query->where('student_id', $studentId)
                    ->whereDate('observed_at', '>=', $windowStart->toDateString())
                    ->whereDate('observed_at', '<=', $windowEnd->toDateString());
            })
            ->when($requireWarningIndicator, function ($query) {
                $query->whereHas('characterIndicator', fn ($indicatorQuery) => $indicatorQuery->where('is_warning_indicator', true));
            })
            ->when($indicatorCodes !== [], function ($query) use ($indicatorCodes) {
                $query->whereHas('characterIndicator', fn ($indicatorQuery) => $indicatorQuery->whereIn('code', $indicatorCodes));
            })
            ->get();
    }

    /**
     * @param  EloquentCollection<int, ObservationItem>  $matches
     */
    private function makeDetectedWarning(
        WarningRule $rule,
        Student $student,
        string $sourceType,
        ?int $sourceId,
        EloquentCollection $matches,
        int $windowDays,
    ): DetectedWarning {
        $studentName = $student->user?->name ?: 'Santri';
        $indicatorNames = $matches
            ->map(fn (ObservationItem $item) => $item->characterIndicator?->name)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $title = $this->titleFor($rule, $studentName);
        $description = $this->descriptionFor($rule, $studentName, $matches->count(), $windowDays, $indicatorNames);

        return new DetectedWarning(
            rule: $rule,
            student: $student,
            sourceType: $sourceType,
            sourceId: $sourceId,
            title: $title,
            description: $description,
            severity: $rule->severity,
            evidence: [
                'window_days' => $windowDays,
                'negative_items_count' => $matches->count(),
                'indicator_names' => $indicatorNames,
                'observation_entry_ids' => $matches->pluck('observation_entry_id')->unique()->values()->all(),
            ],
        );
    }

    private function titleFor(WarningRule $rule, string $studentName): string
    {
        $template = $rule->conditions_json['title_template'] ?? ':student membutuhkan pendampingan karakter';

        return str_replace(':student', $studentName, (string) $template);
    }

    /**
     * @param  array<int, string>  $indicatorNames
     */
    private function descriptionFor(WarningRule $rule, string $studentName, int $matchCount, int $windowDays, array $indicatorNames): string
    {
        $template = $rule->conditions_json['description_template'] ?? ':student menunjukkan :count catatan observasi yang membutuhkan pendampingan dalam :days hari terakhir. Indikator: :indicators.';
        $indicators = $indicatorNames === [] ? 'indikator pendampingan' : implode(', ', $indicatorNames);

        return strtr((string) $template, [
            ':student' => $studentName,
            ':count' => (string) $matchCount,
            ':days' => (string) $windowDays,
            ':indicators' => $indicators,
        ]);
    }

    /**
     * @param  array<string, mixed>  $conditions
     */
    private function intCondition(array $conditions, string $key, int $default): int
    {
        $value = $conditions[$key] ?? $default;

        return is_numeric($value) ? max(1, (int) $value) : $default;
    }

    /**
     * @param  array<string, mixed>  $conditions
     * @return array<int, string>
     */
    private function stringListCondition(array $conditions, string $key): array
    {
        $value = $conditions[$key] ?? [];

        if (! is_array($value)) {
            return [];
        }

        return array_values(array_filter($value, fn ($item) => is_string($item) && $item !== ''));
    }
}

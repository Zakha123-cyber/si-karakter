<?php

namespace App\Domain\EducationalContent;

use App\Enums\EducationalContentStatus;
use App\Models\CharacterIndicator;
use App\Models\EducationalContent;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\TeacherValidation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

class EducationalContentRecommendationService
{
    /**
     * @return Collection<int, EducationalContent>
     */
    public function recommendedForStudent(?Student $student, int $limit = 6, ?EducationalContent $exclude = null): Collection
    {
        $baseQuery = EducationalContent::query()
            ->with(['indicators:id,code,name,category'])
            ->where('status', EducationalContentStatus::Published)
            ->when($exclude !== null, fn ($query) => $query->whereKeyNot($exclude->id));

        if ($student === null) {
            return $baseQuery
                ->latest()
                ->limit($limit)
                ->get();
        }

        $indicatorIds = $this->indicatorIdsForStudent($student);

        if ($indicatorIds === []) {
            return $baseQuery
                ->latest()
                ->limit($limit)
                ->get();
        }

        /** @var Collection<int, EducationalContent> $matched */
        $matched = (clone $baseQuery)
            ->whereHas('indicators', fn ($query) => $query->whereIn('character_indicators.id', $indicatorIds))
            ->withCount([
                'interactions as student_completed_interactions_count' => fn ($query) => $query
                    ->where('student_id', $student->id)
                    ->whereNotNull('completed_at'),
            ])
            ->orderBy('student_completed_interactions_count')
            ->latest()
            ->limit($limit)
            ->get();

        if ($matched->count() >= $limit) {
            return $matched;
        }

        $fallback = (clone $baseQuery)
            ->whereNotIn('id', $matched->pluck('id')->all())
            ->latest()
            ->limit($limit - $matched->count())
            ->get();

        return $matched->concat($fallback)->values();
    }

    /**
     * @return array<int, int>
     */
    private function indicatorIdsForStudent(Student $student): array
    {
        $codes = $this->validatedIndicatorCodes($student);

        $idsFromValidations = $codes->isEmpty()
            ? collect()
            : CharacterIndicator::query()
                ->whereIn('code', $codes->all())
                ->pluck('id');

        $idsFromObservations = ObservationItem::query()
            ->whereHas('observationEntry', fn ($query) => $query->where('student_id', $student->id))
            ->latest()
            ->limit(20)
            ->pluck('character_indicator_id');

        return $idsFromValidations
            ->merge($idsFromObservations)
            ->map(fn ($id) => (int) $id)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return SupportCollection<int, string>
     */
    private function validatedIndicatorCodes(Student $student): SupportCollection
    {
        return TeacherValidation::query()
            ->whereHas('testAnswer.testAttempt', fn ($query) => $query->where('student_id', $student->id))
            ->latest('validated_at')
            ->limit(10)
            ->pluck('final_indicators_json')
            ->flatMap(fn ($indicators) => $this->extractIndicatorCodes($indicators))
            ->unique()
            ->values();
    }

    /**
     * @return array<int, string>
     */
    private function extractIndicatorCodes(mixed $indicators): array
    {
        if (! is_array($indicators)) {
            return [];
        }

        return collect($indicators)
            ->map(function ($indicator) {
                if (is_string($indicator)) {
                    return $indicator;
                }

                if (is_array($indicator) && isset($indicator['code']) && is_string($indicator['code'])) {
                    return $indicator['code'];
                }

                return null;
            })
            ->filter(fn ($code) => is_string($code) && $code !== '')
            ->values()
            ->all();
    }
}

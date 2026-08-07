<?php

namespace App\Domain\Scoring;

use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use Carbon\CarbonInterface;

class ObservationScoreCalculator
{
    /**
     * Skor fallback per sentiment ketika assessment_score tidak diisi.
     *
     * @var array<string, int>
     */
    private const SENTIMENT_SCORES = [
        'positive' => 100,
        'neutral' => 50,
        'negative' => 0,
    ];

    /**
     * Hitung skor observasi satu santri pada rentang periode.
     * Item memakai assessment_score ustadz; bila kosong memakai sentiment.
     */
    public function calculateForPeriod(Student $student, CarbonInterface $periodStart, CarbonInterface $periodEnd): ObservationScoreResult
    {
        $entries = $student->observationEntries()
            ->whereBetween('observed_at', [$periodStart->startOfDay(), $periodEnd->endOfDay()])
            ->with(['items' => fn ($query) => $query->orderBy('id')])
            ->get();

        $scores = [];
        $details = [];
        $counted = 0;
        $total = 0;

        foreach ($entries as $entry) {
            foreach ($entry->items as $item) {
                $total++;

                $score = $this->itemScore($item);
                if ($score === null) {
                    continue;
                }

                $counted++;
                $scores[] = $score;
                $details[] = [
                    'entry_id' => $entry->id,
                    'item_id' => $item->id,
                    'observed_at' => $entry->observed_at->toDateString(),
                    'character_indicator_id' => $item->character_indicator_id,
                    'sentiment' => $item->sentiment,
                    'source' => $item->assessment_score !== null ? 'assessment_score' : 'sentiment',
                    'score' => $score,
                ];
            }
        }

        if ($scores === []) {
            return new ObservationScoreResult(null, $details, $counted, $total);
        }

        return new ObservationScoreResult(
            round(array_sum($scores) / count($scores), 2),
            $details,
            $counted,
            $total,
        );
    }

    /**
     * Hitung skor satu entry observasi (rata-rata skor item-nya).
     * Memakai logika yang sama dengan calculateForPeriod.
     */
    public function calculateForEntry(ObservationEntry $entry): ObservationScoreResult
    {
        $items = $entry->items()->orderBy('id')->get();

        $scores = [];
        $details = [];
        $counted = 0;
        $total = 0;

        foreach ($items as $item) {
            $total++;

            $score = $this->itemScore($item);
            if ($score === null) {
                continue;
            }

            $counted++;
            $scores[] = $score;
            $details[] = [
                'item_id' => $item->id,
                'character_indicator_id' => $item->character_indicator_id,
                'sentiment' => $item->sentiment,
                'source' => $item->assessment_score !== null ? 'assessment_score' : 'sentiment',
                'score' => $score,
            ];
        }

        if ($scores === []) {
            return new ObservationScoreResult(null, $details, $counted, $total);
        }

        return new ObservationScoreResult(
            round(array_sum($scores) / count($scores), 2),
            $details,
            $counted,
            $total,
        );
    }

    private function itemScore(ObservationItem $item): ?float
    {
        if ($item->assessment_score !== null) {
            return round((float) $item->assessment_score, 2);
        }

        if (! isset(self::SENTIMENT_SCORES[$item->sentiment])) {
            return null;
        }

        return self::SENTIMENT_SCORES[$item->sentiment];
    }
}

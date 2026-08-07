<?php

namespace App\Domain\Observation;

use App\Enums\ObservationSentiment;

class EntrySentimentResolver
{
    public const POSITIVE_THRESHOLD = 85.0;

    public const NEGATIVE_THRESHOLD = 60.0;

    /**
     * Resolve sentimen agregat sebuah entry observasi.
     * Memakai sentimen item yang paling banyak dipilih; bila seri (tie),
     * mengikuti ambang skor rata-rata.
     *
     * @param  array<int, string>  $itemSentiments
     */
    public function resolve(array $itemSentiments, ?float $score = null): string
    {
        if ($itemSentiments === []) {
            return $this->fromScore($score);
        }

        $counts = array_count_values($itemSentiments);
        arsort($counts);

        $modes = array_keys($counts, max($counts), true);

        if (count($modes) === 1) {
            return $modes[0];
        }

        return $this->fromScore($score);
    }

    public function fromScore(?float $score): string
    {
        if ($score === null) {
            return ObservationSentiment::Neutral->value;
        }

        if ($score >= self::POSITIVE_THRESHOLD) {
            return ObservationSentiment::Positive->value;
        }

        if ($score < self::NEGATIVE_THRESHOLD) {
            return ObservationSentiment::Negative->value;
        }

        return ObservationSentiment::Neutral->value;
    }
}

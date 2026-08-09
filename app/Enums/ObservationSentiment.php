<?php

namespace App\Enums;

enum ObservationSentiment: string
{
    case Positive = 'positive';
    case Neutral = 'neutral';
    case Negative = 'negative';

    public function label(): string
    {
        return match ($this) {
            self::Positive => 'Positif',
            self::Neutral => 'Netral',
            self::Negative => 'Negatif',
        };
    }

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return array<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $sentiment) => [
            'value' => $sentiment->value,
            'label' => $sentiment->label(),
        ], self::cases());
    }
}

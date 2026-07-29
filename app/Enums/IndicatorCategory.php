<?php

namespace App\Enums;

enum IndicatorCategory: string
{
    case MORAL_REASONING = 'moral_reasoning';
    case SOCIAL = 'social';
    case RESPONSIBILITY = 'responsibility';
    case WORSHIP = 'worship';

    public function label(): string
    {
        return match ($this) {
            self::MORAL_REASONING => 'Penalaran Moral',
            self::SOCIAL => 'Sosial & Emosional',
            self::RESPONSIBILITY => 'Tanggung Jawab & Kemandirian',
            self::WORSHIP => 'Ibadah & Adab',
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
        return array_map(fn (self $category) => [
            'value' => $category->value,
            'label' => $category->label(),
        ], self::cases());
    }
}

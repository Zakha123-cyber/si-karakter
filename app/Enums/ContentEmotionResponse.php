<?php

namespace App\Enums;

enum ContentEmotionResponse: string
{
    case Happy = 'happy';
    case Inspired = 'inspired';
    case Curious = 'curious';
    case Calm = 'calm';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

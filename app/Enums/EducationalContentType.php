<?php

namespace App\Enums;

enum EducationalContentType: string
{
    case Video = 'video';
    case Comic = 'comic';
    case Image = 'image';
    case Audio = 'audio';
    case Story = 'story';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

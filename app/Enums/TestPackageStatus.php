<?php

namespace App\Enums;

enum TestPackageStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Closed = 'closed';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

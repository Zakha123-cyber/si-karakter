<?php

namespace App\Models;

use Database\Factories\CharacterIndicatorFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property string $category
 * @property bool $is_warning_indicator
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['code', 'name', 'description', 'category', 'is_warning_indicator', 'is_active'])]
class CharacterIndicator extends Model
{
    /** @use HasFactory<CharacterIndicatorFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_warning_indicator' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}

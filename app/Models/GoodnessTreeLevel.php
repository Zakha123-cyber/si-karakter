<?php

namespace App\Models;

use Database\Factories\GoodnessTreeLevelFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $level
 * @property string $name
 * @property int $minimum_points
 * @property string $asset_path
 * @property string|null $description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['level', 'name', 'minimum_points', 'asset_path', 'description'])]
class GoodnessTreeLevel extends Model
{
    /** @use HasFactory<GoodnessTreeLevelFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'minimum_points' => 'integer',
        ];
    }
}

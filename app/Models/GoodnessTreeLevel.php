<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['level', 'name', 'minimum_points', 'asset_path', 'description'])]
class GoodnessTreeLevel extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'minimum_points' => 'integer',
        ];
    }
}

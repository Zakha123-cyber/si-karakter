<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'rule_type', 'conditions_json', 'severity', 'is_active'])]
class WarningRule extends Model
{
    use HasFactory;

    public function studentWarnings(): HasMany
    {
        return $this->hasMany(StudentWarning::class);
    }

    protected function casts(): array
    {
        return [
            'conditions_json' => 'array',
            'is_active' => 'boolean',
        ];
    }
}

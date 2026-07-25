<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'slug', 'content_type', 'description', 'content_body', 'media_path', 'thumbnail_path', 'duration_seconds', 'status', 'created_by'])]
class EducationalContent extends Model
{
    use HasFactory;

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function indicators(): BelongsToMany
    {
        return $this->belongsToMany(CharacterIndicator::class, 'educational_content_indicators')->withTimestamps();
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(ContentInteraction::class);
    }

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
        ];
    }
}

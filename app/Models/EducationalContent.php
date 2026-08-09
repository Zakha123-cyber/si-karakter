<?php

namespace App\Models;

use App\Enums\EducationalContentStatus;
use App\Enums\EducationalContentType;
use Database\Factories\EducationalContentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property EducationalContentType $content_type
 * @property string|null $description
 * @property string|null $content_body
 * @property string|null $media_path
 * @property string|null $thumbnail_path
 * @property int|null $duration_seconds
 * @property EducationalContentStatus $status
 * @property int|null $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $creator
 * @property-read Collection<int, CharacterIndicator> $indicators
 */
#[Fillable(['title', 'slug', 'content_type', 'description', 'content_body', 'media_path', 'thumbnail_path', 'duration_seconds', 'status', 'created_by'])]
class EducationalContent extends Model
{
    /** @use HasFactory<EducationalContentFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsToMany<CharacterIndicator, $this>
     */
    public function indicators(): BelongsToMany
    {
        return $this->belongsToMany(CharacterIndicator::class, 'educational_content_indicators')->withTimestamps();
    }

    /**
     * @return HasMany<ContentInteraction, $this>
     */
    public function interactions(): HasMany
    {
        return $this->hasMany(ContentInteraction::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content_type' => EducationalContentType::class,
            'duration_seconds' => 'integer',
            'status' => EducationalContentStatus::class,
        ];
    }
}

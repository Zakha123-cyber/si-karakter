<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
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
 * @property string|null $description
 * @property Carbon|null $start_at
 * @property Carbon|null $end_at
 * @property int $attempt_limit
 * @property string $status
 * @property int|null $created_by
 */
#[Fillable(['title', 'slug', 'description', 'start_at', 'end_at', 'attempt_limit', 'status', 'created_by'])]
class TestPackage extends Model
{
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsToMany<Group, $this>
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'test_package_groups')->withTimestamps();
    }

    /**
     * @return BelongsToMany<MoralCase, $this>
     */
    public function cases(): BelongsToMany
    {
        return $this->belongsToMany(MoralCase::class, 'test_package_cases')
            ->withPivot('sort_order')
            ->withTimestamps();
    }

    /**
     * @return HasMany<TestPackageCase, $this>
     */
    public function packageCases(): HasMany
    {
        return $this->hasMany(TestPackageCase::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'attempt_limit' => 'integer',
        ];
    }
}

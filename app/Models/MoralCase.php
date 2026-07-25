<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'story', 'image_path', 'audio_path', 'sort_order', 'is_active', 'created_by'])]
class MoralCase extends Model
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
     * @return HasMany<MoralCaseOption, $this>
     */
    public function options(): HasMany
    {
        return $this->hasMany(MoralCaseOption::class);
    }

    /**
     * @return BelongsToMany<TestPackage, $this>
     */
    public function testPackages(): BelongsToMany
    {
        return $this->belongsToMany(TestPackage::class, 'test_package_cases')
            ->withPivot('sort_order')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany<CharacterIndicator, $this>
     */
    public function indicators(): BelongsToMany
    {
        return $this->belongsToMany(CharacterIndicator::class, 'moral_case_indicators')
            ->withPivot('weight')
            ->withTimestamps();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}

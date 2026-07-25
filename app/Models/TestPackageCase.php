<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['test_package_id', 'moral_case_id', 'sort_order'])]
class TestPackageCase extends Model
{
    /**
     * @return BelongsTo<TestPackage, $this>
     */
    public function testPackage(): BelongsTo
    {
        return $this->belongsTo(TestPackage::class);
    }

    /**
     * @return BelongsTo<MoralCase, $this>
     */
    public function moralCase(): BelongsTo
    {
        return $this->belongsTo(MoralCase::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['test_package_id', 'group_id'])]
class TestPackageGroup extends Model
{
    /**
     * @return BelongsTo<TestPackage, $this>
     */
    public function testPackage(): BelongsTo
    {
        return $this->belongsTo(TestPackage::class);
    }

    /**
     * @return BelongsTo<Group, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }
}

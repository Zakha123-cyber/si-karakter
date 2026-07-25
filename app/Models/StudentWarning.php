<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'warning_rule_id', 'source_type', 'source_id', 'title', 'description', 'severity', 'status', 'detected_at', 'reviewed_by', 'reviewed_at', 'resolution_note'])]
class StudentWarning extends Model
{
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function warningRule(): BelongsTo
    {
        return $this->belongsTo(WarningRule::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    protected function casts(): array
    {
        return [
            'source_id' => 'integer',
            'detected_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }
}

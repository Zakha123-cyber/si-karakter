<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['test_answer_id', 'provider', 'model', 'original_text', 'edited_text', 'language', 'confidence', 'status', 'error_message', 'raw_response_json', 'processed_at'])]
class Transcription extends Model
{
    use HasFactory;

    public function testAnswer(): BelongsTo
    {
        return $this->belongsTo(TestAnswer::class);
    }

    protected function casts(): array
    {
        return [
            'confidence' => 'decimal:4',
            'raw_response_json' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}

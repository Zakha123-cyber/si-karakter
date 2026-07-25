<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('observation_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->restrictOnDelete();
            $table->date('observed_at');
            $table->text('general_note')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'observed_at']);
            $table->index(['teacher_id', 'observed_at']);
        });

        Schema::create('observation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('observation_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('character_indicator_id')->constrained()->restrictOnDelete();
            $table->string('sentiment', 20);
            $table->decimal('assessment_score', 5, 2)->nullable();
            $table->integer('reward_points')->default(0);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['observation_entry_id', 'sentiment'], 'obs_item_entry_sentiment_idx');
            $table->index('character_indicator_id');
        });

        Schema::create('scoring_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('test_weight', 5, 2);
            $table->decimal('observation_weight', 5, 2);
            $table->boolean('is_active')->default(false);
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'effective_from', 'effective_until'], 'scoring_active_period_idx');
            $table->index('created_by');
        });

        Schema::create('character_score_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('test_score', 6, 2)->default(0);
            $table->decimal('observation_score', 6, 2)->default(0);
            $table->decimal('calculated_score', 6, 2)->default(0);
            $table->decimal('manual_adjustment', 6, 2)->nullable();
            $table->decimal('final_score', 6, 2)->default(0);
            $table->string('final_level')->nullable();
            $table->foreignId('adjusted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('adjustment_reason')->nullable();
            $table->json('calculation_detail_json');
            $table->timestamps();

            $table->unique(['student_id', 'period_start', 'period_end'], 'score_snapshot_unique_period');
            $table->index(['period_start', 'period_end']);
            $table->index('adjusted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('character_score_snapshots');
        Schema::dropIfExists('scoring_configurations');
        Schema::dropIfExists('observation_items');
        Schema::dropIfExists('observation_entries');
    }
};

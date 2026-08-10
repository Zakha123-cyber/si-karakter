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
        Schema::table('goodness_point_transactions', function (Blueprint $table) {
            $table->index(['student_id', 'points'], 'idx_gpt_student_points');
        });

        Schema::table('observation_items', function (Blueprint $table) {
            $table->index(['sentiment', 'observation_entry_id'], 'idx_oi_sentiment_entry');
        });
        
        Schema::table('character_score_snapshots', function (Blueprint $table) {
            $table->index('period_start', 'idx_css_period_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('goodness_point_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_gpt_student_points');
        });

        Schema::table('observation_items', function (Blueprint $table) {
            $table->dropIndex('idx_oi_sentiment_entry');
        });
        
        Schema::table('character_score_snapshots', function (Blueprint $table) {
            $table->dropIndex('idx_css_period_start');
        });
    }
};

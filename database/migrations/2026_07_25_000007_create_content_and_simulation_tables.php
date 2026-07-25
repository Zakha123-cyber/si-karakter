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
        Schema::create('educational_contents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('content_type', 30);
            $table->text('description')->nullable();
            $table->longText('content_body')->nullable();
            $table->string('media_path')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->string('status', 30)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['content_type', 'status']);
            $table->index('created_by');
        });

        Schema::create('educational_content_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('educational_content_id');
            $table->foreignId('character_indicator_id');
            $table->timestamps();

            $table->unique(['educational_content_id', 'character_indicator_id'], 'content_indicator_unique');
            $table->index('character_indicator_id');

            $table->foreign('educational_content_id', 'content_indicator_content_fk')
                ->references('id')
                ->on('educational_contents')
                ->cascadeOnDelete();
            $table->foreign('character_indicator_id', 'content_indicator_indicator_fk')
                ->references('id')
                ->on('character_indicators')
                ->restrictOnDelete();
        });

        Schema::create('content_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->foreignId('educational_content_id');
            $table->string('emotion_response')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'started_at']);
            $table->index(['educational_content_id', 'completed_at'], 'content_interaction_content_completed_idx');

            $table->foreign('educational_content_id', 'content_interaction_content_fk')
                ->references('id')
                ->on('educational_contents')
                ->cascadeOnDelete();
        });

        Schema::create('simulation_scenarios', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('opening_text');
            $table->string('audio_path')->nullable();
            $table->string('image_path')->nullable();
            $table->string('status', 30)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
            $table->index('created_by');
        });

        Schema::create('simulation_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('simulation_scenario_id');
            $table->text('text');
            $table->text('feedback_text')->nullable();
            $table->decimal('score', 6, 2)->default(0);
            $table->integer('reward_points')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['simulation_scenario_id', 'sort_order'], 'simulation_option_scenario_order_idx');

            $table->foreign('simulation_scenario_id', 'simulation_option_scenario_fk')
                ->references('id')
                ->on('simulation_scenarios')
                ->cascadeOnDelete();
        });

        Schema::create('simulation_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->foreignId('simulation_scenario_id');
            $table->foreignId('selected_option_id');
            $table->decimal('score', 6, 2)->default(0);
            $table->integer('reward_points')->default(0);
            $table->dateTime('completed_at');
            $table->timestamps();

            $table->index(['student_id', 'completed_at']);
            $table->index('simulation_scenario_id');
            $table->index('selected_option_id');

            $table->foreign('simulation_scenario_id', 'simulation_attempt_scenario_fk')
                ->references('id')
                ->on('simulation_scenarios')
                ->restrictOnDelete();
            $table->foreign('selected_option_id', 'simulation_attempt_option_fk')
                ->references('id')
                ->on('simulation_options')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('simulation_attempts');
        Schema::dropIfExists('simulation_options');
        Schema::dropIfExists('simulation_scenarios');
        Schema::dropIfExists('content_interactions');
        Schema::dropIfExists('educational_content_indicators');
        Schema::dropIfExists('educational_contents');
    }
};

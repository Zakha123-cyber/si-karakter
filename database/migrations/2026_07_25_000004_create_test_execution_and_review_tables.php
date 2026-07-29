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
        Schema::create('test_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_package_id')->constrained()->restrictOnDelete();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('attempt_number');
            $table->string('status', 30)->default('in_progress');
            $table->dateTime('started_at');
            $table->dateTime('submitted_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['test_package_id', 'student_id', 'attempt_number'], 'test_attempt_unique_number');
            $table->index(['student_id', 'status']);
            $table->index(['test_package_id', 'status'], 'attempt_package_status_idx');
        });

        Schema::create('test_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('moral_case_id')->constrained()->restrictOnDelete();
            $table->foreignId('selected_option_id')->nullable()->constrained('moral_case_options')->nullOnDelete();
            $table->text('typed_reason')->nullable();
            $table->text('final_transcript')->nullable();
            $table->string('answer_status', 30)->default('draft');
            $table->timestamps();

            $table->unique(['test_attempt_id', 'moral_case_id'], 'attempt_case_unique');
            $table->index('selected_option_id');
            $table->index('answer_status');
        });

        Schema::create('answer_audio_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_answer_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->string('checksum')->nullable();
            $table->timestamps();

            $table->index('test_answer_id');
            $table->index('checksum');
        });

        Schema::create('transcriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_answer_id')->constrained()->cascadeOnDelete();
            $table->string('provider');
            $table->string('model');
            $table->text('original_text')->nullable();
            $table->text('edited_text')->nullable();
            $table->string('language', 20)->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->string('status', 30)->default('pending');
            $table->text('error_message')->nullable();
            $table->json('raw_response_json')->nullable();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();

            $table->index(['test_answer_id', 'status'], 'transcription_answer_status_idx');
            $table->index(['provider', 'model']);
        });

        Schema::create('ai_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_answer_id')->constrained()->cascadeOnDelete();
            $table->string('provider');
            $table->string('model');
            $table->string('moral_level', 40)->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->text('reasoning_summary')->nullable();
            $table->text('suggested_intervention')->nullable();
            $table->json('warning_signals_json')->nullable();
            $table->json('indicators_json')->nullable();
            $table->string('prompt_version')->nullable();
            $table->json('raw_response_json')->nullable();
            $table->string('status', 30)->default('completed');
            $table->text('error_message')->nullable();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();

            $table->index(['test_answer_id', 'status'], 'ai_assessment_answer_status_idx');
            $table->index(['provider', 'model']);
            $table->index('moral_level');
        });

        Schema::create('teacher_validations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_answer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ai_assessment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->restrictOnDelete();
            $table->string('decision', 30);
            $table->string('final_moral_level', 40);
            $table->json('final_indicators_json');
            $table->text('teacher_note')->nullable();
            $table->text('override_reason')->nullable();
            $table->dateTime('validated_at');
            $table->timestamps();

            $table->index(['test_answer_id', 'decision'], 'validation_answer_decision_idx');
            $table->index('teacher_id');
            $table->index('final_moral_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_validations');
        Schema::dropIfExists('ai_assessments');
        Schema::dropIfExists('transcriptions');
        Schema::dropIfExists('answer_audio_files');
        Schema::dropIfExists('test_answers');
        Schema::dropIfExists('test_attempts');
    }
};

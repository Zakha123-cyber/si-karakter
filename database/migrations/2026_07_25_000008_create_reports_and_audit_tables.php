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
        Schema::create('character_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->string('status', 30)->default('draft');
            $table->json('test_summary_json');
            $table->json('observation_summary_json');
            $table->longText('ai_generated_narrative')->nullable();
            $table->longText('final_narrative');
            $table->longText('recommendation');
            $table->foreignId('teacher_id')->constrained('users')->restrictOnDelete();
            $table->string('pdf_path')->nullable();
            $table->dateTime('published_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'period_start', 'period_end']);
            $table->index(['status', 'published_at']);
            $table->index('teacher_id');
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('old_values_json')->nullable();
            $table->json('new_values_json')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('user_id');
            $table->index('action');
            $table->index(['auditable_type', 'auditable_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('character_reports');
    }
};

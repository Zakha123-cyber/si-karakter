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
        Schema::create('warning_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('rule_type', 50);
            $table->json('conditions_json');
            $table->string('severity', 30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['rule_type', 'is_active']);
            $table->index('severity');
        });

        Schema::create('student_warnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->foreignId('warning_rule_id')->constrained()->restrictOnDelete();
            $table->string('source_type');
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('severity', 30);
            $table->string('status', 30)->default('open');
            $table->dateTime('detected_at');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable();
            $table->text('resolution_note')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['warning_rule_id', 'status'], 'student_warning_rule_status_idx');
            $table->index(['source_type', 'source_id']);
            $table->index('reviewed_by');
        });

        Schema::create('goodness_point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->string('source_type');
            $table->unsignedBigInteger('source_id')->nullable();
            $table->integer('points');
            $table->string('description');
            $table->foreignId('awarded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();

            $table->index(['student_id', 'created_at']);
            $table->index(['source_type', 'source_id']);
            $table->index('awarded_by');
        });

        Schema::create('goodness_tree_levels', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('level')->unique();
            $table->string('name');
            $table->integer('minimum_points')->unique();
            $table->string('asset_path');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('minimum_points');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goodness_tree_levels');
        Schema::dropIfExists('goodness_point_transactions');
        Schema::dropIfExists('student_warnings');
        Schema::dropIfExists('warning_rules');
    }
};

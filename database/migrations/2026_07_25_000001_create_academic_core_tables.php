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
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index(['is_active', 'start_date', 'end_date']);
        });

        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['academic_year_id', 'is_active']);
            $table->index('teacher_id');
        });

        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->restrictOnDelete();
            $table->string('student_code')->unique();
            $table->date('birth_date')->nullable();
            $table->string('gender', 20)->nullable();
            $table->foreignId('current_group_id')->nullable()->constrained('groups')->nullOnDelete();
            $table->date('enrollment_date')->nullable();
            $table->string('status', 30)->default('active');
            $table->timestamps();

            $table->index(['current_group_id', 'status']);
        });

        Schema::create('group_student_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->foreignId('group_id')->constrained()->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained()->restrictOnDelete();
            $table->date('joined_at');
            $table->date('left_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'joined_at', 'left_at']);
            $table->index(['group_id', 'academic_year_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_student_histories');
        Schema::dropIfExists('students');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('academic_years');
    }
};

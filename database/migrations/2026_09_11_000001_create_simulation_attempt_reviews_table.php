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
        Schema::create('simulation_attempt_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('simulation_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->restrictOnDelete();
            $table->text('teacher_note')->nullable();
            $table->dateTime('reviewed_at');
            $table->timestamps();

            $table->unique('simulation_attempt_id');
            $table->index('teacher_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('simulation_attempt_reviews');
    }
};

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
        Schema::create('test_packages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->dateTime('start_at')->nullable();
            $table->dateTime('end_at')->nullable();
            $table->unsignedInteger('attempt_limit')->default(1);
            $table->string('status', 30)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'start_at', 'end_at']);
            $table->index('created_by');
        });

        Schema::create('test_package_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['test_package_id', 'group_id'], 'pkg_group_unique');
            $table->index('group_id');
        });

        Schema::create('moral_cases', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('story');
            $table->string('image_path')->nullable();
            $table->string('audio_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
            $table->index('created_by');
        });

        Schema::create('test_package_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_package_id')->constrained()->cascadeOnDelete();
            $table->foreignId('moral_case_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['test_package_id', 'moral_case_id'], 'pkg_case_unique');
            $table->index(['test_package_id', 'sort_order']);
            $table->index('moral_case_id');
        });

        Schema::create('moral_case_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moral_case_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->text('text');
            $table->string('internal_value')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['moral_case_id', 'is_active', 'sort_order']);
        });

        Schema::create('moral_case_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moral_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('character_indicator_id')->constrained()->restrictOnDelete();
            $table->decimal('weight', 5, 2)->default(1);
            $table->timestamps();

            $table->unique(['moral_case_id', 'character_indicator_id'], 'case_indicator_unique');
            $table->index('character_indicator_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('moral_case_indicators');
        Schema::dropIfExists('moral_case_options');
        Schema::dropIfExists('test_package_cases');
        Schema::dropIfExists('moral_cases');
        Schema::dropIfExists('test_package_groups');
        Schema::dropIfExists('test_packages');
    }
};

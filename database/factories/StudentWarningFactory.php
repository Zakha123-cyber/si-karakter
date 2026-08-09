<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\StudentWarning;
use App\Models\User;
use App\Models\WarningRule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentWarning>
 */
class StudentWarningFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'warning_rule_id' => WarningRule::factory(),
            'source_type' => 'observation',
            'source_id' => null,
            'title' => 'Santri membutuhkan pendampingan karakter',
            'description' => 'Terdapat pola observasi yang membutuhkan pendampingan lanjutan.',
            'severity' => 'medium',
            'status' => 'open',
            'detected_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'resolution_note' => null,
        ];
    }

    public function reviewed(?User $reviewer = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reviewed',
            'reviewed_by' => $reviewer instanceof User ? $reviewer->id : User::factory()->teacher(),
            'reviewed_at' => now(),
            'resolution_note' => 'Sudah ditinjau untuk pendampingan.',
        ]);
    }

    public function resolved(?User $reviewer = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'resolved',
            'reviewed_by' => $reviewer instanceof User ? $reviewer->id : User::factory()->teacher(),
            'reviewed_at' => now(),
            'resolution_note' => 'Pendampingan sudah ditindaklanjuti.',
        ]);
    }
}

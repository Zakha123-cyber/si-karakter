<?php

namespace Database\Factories;

use App\Models\CharacterReport;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CharacterReport>
 */
class CharacterReportFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $student = Student::factory()->create();

        return [
            'student_id' => $student->id,
            'period_start' => now()->subMonth()->startOfMonth()->toDateString(),
            'period_end' => now()->subMonth()->endOfMonth()->toDateString(),
            'status' => 'draft',
            'test_summary_json' => [
                'score' => 85.5,
                'validated_answers' => 3,
                'total_answers' => 3,
                'details' => [],
            ],
            'observation_summary_json' => [
                'score' => 78.0,
                'counted_items' => 4,
                'total_items' => 4,
                'details' => [],
            ],
            'ai_generated_narrative' => null,
            'final_narrative' => '',
            'recommendation' => '',
            'teacher_id' => User::factory()->teacher(),
            'pdf_path' => null,
            'published_at' => null,
        ];
    }

    public function reviewed(?string $finalNarrative = null, ?string $recommendation = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reviewed',
            'final_narrative' => $finalNarrative ?? 'Santri menunjukkan perkembangan positif dalam pembiasaan ibadah dan akhlak.',
            'recommendation' => $recommendation ?? 'Lanjutkan pembiasaan dan beri penguatan positif.',
        ]);
    }

    public function published(?string $finalNarrative = null, ?string $recommendation = null): static
    {
        return $this->reviewed($finalNarrative, $recommendation)->state(fn (array $attributes) => [
            'status' => 'published',
            'pdf_path' => 'reports/character-report-1.pdf',
            'published_at' => now(),
        ]);
    }
}

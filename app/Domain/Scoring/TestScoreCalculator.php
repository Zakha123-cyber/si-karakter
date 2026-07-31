<?php

namespace App\Domain\Scoring;

use App\Models\Student;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use Carbon\CarbonInterface;

class TestScoreCalculator
{
    /**
     * Skor per level moral final (hasil validasi ustadz).
     *
     * @var array<string, int>
     */
    private const LEVEL_SCORES = [
        'pre_conventional' => 0,
        'conventional' => 50,
        'post_conventional' => 100,
    ];

    /**
     * Hitung skor tes untuk satu attempt.
     * Hanya jawaban dengan validasi ustadz yang dihitung.
     */
    public function calculateAttempt(TestAttempt $attempt): TestScoreResult
    {
        $answers = $attempt->answers()
            ->with(['teacherValidations' => fn ($query) => $query->latest('validated_at')])
            ->get();

        return $this->aggregate($answers, $attempt->id);
    }

    /**
     * Hitung skor tes untuk satu santri pada rentang periode.
     * Semua attempt berstatus submitted dalam periode diakumulasi,
     * skor adalah rata-rata seluruh jawaban tervalidasi.
     */
    public function calculateForPeriod(Student $student, CarbonInterface $periodStart, CarbonInterface $periodEnd): TestScoreResult
    {
        $attempts = TestAttempt::query()
            ->where('student_id', $student->id)
            ->where('status', 'submitted')
            ->whereBetween('submitted_at', [$periodStart->startOfDay(), $periodEnd->endOfDay()])
            ->with(['answers.teacherValidations' => fn ($query) => $query->latest('validated_at')])
            ->get();

        $scores = [];
        $details = [];
        $validated = 0;
        $total = 0;

        foreach ($attempts as $attempt) {
            $result = $this->aggregate($attempt->answers, $attempt->id);

            foreach ($result->details as $detail) {
                $details[] = $detail;
                $scores[] = $detail['score'];
            }

            $validated += $result->validatedAnswers;
            $total += $result->totalAnswers;
        }

        if ($scores === []) {
            return new TestScoreResult(null, $details, $validated, $total);
        }

        return new TestScoreResult(
            round(array_sum($scores) / count($scores), 2),
            $details,
            $validated,
            $total,
        );
    }

    /**
     * @param  iterable<array-key, TestAnswer>  $answers
     */
    private function aggregate(iterable $answers, int $attemptId): TestScoreResult
    {
        $scores = [];
        $details = [];
        $total = 0;

        foreach ($answers as $answer) {
            $total++;

            $validation = $answer->teacherValidations->first();
            if ($validation === null) {
                continue;
            }

            $level = $validation->final_moral_level;
            if (! isset(self::LEVEL_SCORES[$level])) {
                continue;
            }

            $score = self::LEVEL_SCORES[$level];
            $scores[] = $score;
            $details[] = [
                'attempt_id' => $attemptId,
                'answer_id' => $answer->id,
                'moral_case_id' => $answer->moral_case_id,
                'final_moral_level' => $level,
                'score' => $score,
            ];
        }

        if ($scores === []) {
            return new TestScoreResult(null, $details, 0, $total);
        }

        return new TestScoreResult(
            round(array_sum($scores) / count($scores), 2),
            $details,
            count($scores),
            $total,
        );
    }
}

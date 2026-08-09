<?php

namespace App\Http\Controllers\Student;

use App\Domain\GoodnessTree\GoodnessTreeProgress;
use App\Domain\GoodnessTree\GoodnessTreeService;
use App\Http\Controllers\Controller;
use App\Models\GoodnessPointTransaction;
use App\Models\GoodnessTreeLevel;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoodnessTreeController extends Controller
{
    public function __construct(
        private readonly GoodnessTreeService $treeService,
    ) {}

    public function __invoke(Request $request): Response
    {
        /** @var Student|null $student */
        $student = Student::query()
            ->with(['user', 'currentGroup'])
            ->where('user_id', $request->user()->id)
            ->first();

        $progress = $student === null
            ? $this->treeService->progressForPoints(0)
            : $this->treeService->progressForStudent($student);

        $transactionsQuery = GoodnessPointTransaction::query()
            ->with('awardedBy')
            ->where('points', '>', 0);

        if ($student === null) {
            $transactionsQuery->whereRaw('1 = 0');
        } else {
            $transactionsQuery->where('student_id', $student->id);
        }

        $transactions = $transactionsQuery
            ->latest('created_at')
            ->latest('id')
            ->paginate(8)
            ->withQueryString();

        $transactions->through(fn (GoodnessPointTransaction $transaction) => [
            'id' => $transaction->id,
            'points' => $transaction->points,
            'description' => $transaction->description,
            'source_type' => $transaction->source_type,
            'source_label' => $this->sourceLabel($transaction->source_type),
            'awarded_by' => $transaction->awardedBy?->name,
            'created_at' => $transaction->created_at?->toDateTimeString(),
            'created_at_label' => $transaction->created_at?->translatedFormat('d M Y'),
        ]);

        return Inertia::render('student/goodness-tree', [
            'student' => [
                'name' => $request->user()->name,
                'group' => $student?->currentGroup?->name,
                'student_code' => $student?->student_code,
            ],
            'tree' => $this->treePayload($progress),
            'transactions' => $transactions,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function treePayload(GoodnessTreeProgress $progress): array
    {
        return [
            'points' => $progress->points,
            'progress_percent' => $progress->progressPercent,
            'points_to_next_level' => $progress->pointsToNextLevel,
            'is_max_level' => $progress->isMaxLevel(),
            'current_level' => $this->levelPayload($progress->currentLevel),
            'next_level' => $this->levelPayload($progress->nextLevel),
            'levels' => array_map(fn (GoodnessTreeLevel $level) => [
                'id' => $level->id,
                'level' => $level->level,
                'name' => $level->name,
                'minimum_points' => $level->minimum_points,
                'asset_path' => $level->asset_path,
                'description' => $level->description,
                'unlocked' => $progress->points >= $level->minimum_points,
            ], $progress->levels),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function levelPayload(?GoodnessTreeLevel $level): ?array
    {
        if ($level === null) {
            return null;
        }

        return [
            'id' => $level->id,
            'level' => $level->level,
            'name' => $level->name,
            'minimum_points' => $level->minimum_points,
            'asset_path' => $level->asset_path,
            'description' => $level->description,
        ];
    }

    private function sourceLabel(string $sourceType): string
    {
        return match ($sourceType) {
            'observation' => 'Observasi Harian',
            'simulation' => 'Simulasi',
            'mission' => 'Misi Kebaikan',
            'manual' => 'Apresiasi Ustadz',
            default => 'Reward Kebaikan',
        };
    }
}

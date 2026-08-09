<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Observation\EntrySentimentResolver;
use App\Domain\Scoring\ObservationScoreCalculator;
use App\Enums\IndicatorCategory;
use App\Enums\ObservationSentiment;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\Observations\StoreObservationRequest;
use App\Http\Requests\Teacher\Observations\UpdateObservationRequest;
use App\Http\Resources\Teacher\ObservationResource;
use App\Models\CharacterIndicator;
use App\Models\GoodnessPointTransaction;
use App\Models\ObservationEntry;
use App\Models\Student;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ObservationController extends Controller
{
    public function __construct(
        private readonly ObservationScoreCalculator $scoreCalculator,
        private readonly EntrySentimentResolver $sentimentResolver,
        private readonly AuditLogger $auditLogger,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = ObservationEntry::query()
            ->with(['student.user', 'student.currentGroup', 'teacher', 'items.characterIndicator'])
            ->when($user->role->value === UserRole::Teacher->value, function ($q) use ($user) {
                $q->whereHas('student', function ($studentQuery) use ($user) {
                    $studentQuery->whereHas('currentGroup', fn ($groupQuery) => $groupQuery->where('teacher_id', $user->id));
                });
            });

        $search = $request->string('search')->toString();
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('general_note', 'like', "%{$search}%")
                    ->orWhereHas('student.user', fn ($u) => $u->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('teacher', fn ($t) => $t->where('name', 'like', "%{$search}%"));
            });
        }

        $query->when($request->filled('date_from'), fn ($q) => $q->whereDate('observed_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->whereDate('observed_at', '<=', $request->date('date_to')))
            ->when($request->integer('student_id'), fn ($q, $studentId) => $q->where('student_id', $studentId))
            ->when($request->integer('teacher_id'), fn ($q, $teacherId) => $q->where('teacher_id', $teacherId))
            ->when($request->string('sentiment')->toString() !== '', fn ($q) => $q->where('sentiment', $request->string('sentiment')->toString()))
            ->latest('observed_at');

        $summary = $this->summarize((clone $query)->get());

        $entries = $query->paginate($request->integer('per_page', 10))->withQueryString();
        $entries->getCollection()->transform(function (ObservationEntry $entry) use ($user) {
            $score = $this->scoreCalculator->calculateForEntry($entry)->score;
            $canManage = $user->role->value === UserRole::Admin->value || $entry->teacher_id === $user->id;

            return (new ObservationResource($entry, $score, $canManage, $canManage))->resolve();
        });

        return Inertia::render('teacher/observations/index', [
            'observations' => $entries,
            'summary' => $summary,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'date_from' => $request->filled('date_from') ? $request->date('date_from')->toDateString() : null,
                'date_to' => $request->filled('date_to') ? $request->date('date_to')->toDateString() : null,
                'student_id' => $request->integer('student_id') ?: null,
                'teacher_id' => $request->integer('teacher_id') ?: null,
                'sentiment' => $request->string('sentiment')->toString(),
            ],
            'students' => $this->studentOptions($user),
            'teachers' => $this->teacherOptions(),
            'indicators' => CharacterIndicator::query()->active()->orderBy('name')->get(['id', 'name', 'category']),
            'categories' => IndicatorCategory::options(),
            'sentiments' => ObservationSentiment::options(),
            'scoreThresholds' => [
                'positive' => EntrySentimentResolver::POSITIVE_THRESHOLD,
                'negative' => EntrySentimentResolver::NEGATIVE_THRESHOLD,
            ],
        ]);
    }

    public function store(StoreObservationRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        /** @var Student $student */
        $student = Student::query()->findOrFail($data['student_id']);
        $teacherId = (int) $data['teacher_id'];

        if ($user->role->value === UserRole::Teacher->value) {
            $teacherId = $user->id;
            $this->ensureStudentInTeacherGroup($student, $user);
        }

        $entry = DB::transaction(function () use ($data, $student, $teacherId) {
            $entry = ObservationEntry::query()->create([
                'student_id' => $student->id,
                'teacher_id' => $teacherId,
                'observed_at' => $data['observed_at'],
                'general_note' => $data['general_note'] ?? null,
            ]);

            foreach ($data['items'] as $itemData) {
                $entry->items()->create([
                    'character_indicator_id' => $itemData['character_indicator_id'],
                    'sentiment' => $itemData['sentiment'],
                    'assessment_score' => $itemData['assessment_score'] ?? null,
                    'reward_points' => $itemData['reward_points'] ?? 0,
                    'note' => $itemData['note'] ?? null,
                ]);
            }

            return $entry;
        });

        $entry->load('items');
        $this->finalizeEntry($entry);
        $this->auditLogger->record('observation.created', $entry, null, $this->snapshot($entry));

        return back()->with('status', 'Observasi berhasil disimpan.');
    }

    public function update(UpdateObservationRequest $request, ObservationEntry $observationEntry): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeManage($user, $observationEntry);

        $data = $request->validated();
        $oldSnapshot = $this->snapshot($observationEntry->load('items'));

        if ($user->role->value === UserRole::Teacher->value) {
            $teacherId = $observationEntry->teacher_id;
            /** @var Student $student */
            $student = Student::query()->findOrFail($data['student_id']);
            $this->ensureStudentInTeacherGroup($student, $user);
        } else {
            $teacherId = (int) $data['teacher_id'];
        }

        DB::transaction(function () use ($data, $observationEntry, $teacherId) {
            $observationEntry->update([
                'student_id' => $data['student_id'],
                'teacher_id' => $teacherId,
                'observed_at' => $data['observed_at'],
                'general_note' => $data['general_note'] ?? null,
            ]);

            $observationEntry->items()->delete();

            foreach ($data['items'] as $itemData) {
                $observationEntry->items()->create([
                    'character_indicator_id' => $itemData['character_indicator_id'],
                    'sentiment' => $itemData['sentiment'],
                    'assessment_score' => $itemData['assessment_score'] ?? null,
                    'reward_points' => $itemData['reward_points'] ?? 0,
                    'note' => $itemData['note'] ?? null,
                ]);
            }
        });

        $observationEntry->load('items');
        $this->finalizeEntry($observationEntry);
        $this->auditLogger->record('observation.updated', $observationEntry, $oldSnapshot, $this->snapshot($observationEntry));

        return back()->with('status', 'Observasi berhasil diperbarui.');
    }

    public function destroy(Request $request, ObservationEntry $observationEntry): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeManage($user, $observationEntry);

        $oldSnapshot = $this->snapshot($observationEntry->load('items'));

        GoodnessPointTransaction::query()
            ->where('source_type', 'observation')
            ->where('source_id', $observationEntry->id)
            ->delete();

        $observationEntry->items()->delete();
        $observationEntry->delete();

        $this->auditLogger->record('observation.deleted', $observationEntry, $oldSnapshot);

        return back()->with('status', 'Observasi berhasil dihapus.');
    }

    /**
     * @param  Collection<int, ObservationEntry>  $entries
     * @return array<string, mixed>
     */
    private function summarize($entries): array
    {
        $scores = [];
        $sentiments = [
            'positive' => 0,
            'neutral' => 0,
            'negative' => 0,
        ];
        $totalRewardPoints = 0;

        foreach ($entries as $entry) {
            $score = $this->scoreCalculator->calculateForEntry($entry)->score;
            if ($score !== null) {
                $scores[] = $score;
            }

            if ($entry->sentiment !== null && array_key_exists($entry->sentiment, $sentiments)) {
                $sentiments[$entry->sentiment]++;
            }

            $totalRewardPoints += $entry->items->sum('reward_points');
        }

        return [
            'total' => $entries->count(),
            'average_score' => $scores === [] ? null : round(array_sum($scores) / count($scores), 2),
            'sentiments' => $sentiments,
            'total_reward_points' => $totalRewardPoints,
        ];
    }

    /**
     * @return array<int, array{id: int, name: ?string, student_code: ?string, group_name: ?string}>
     */
    private function studentOptions(User $user): array
    {
        return Student::query()
            ->with('user')
            ->when($user->role->value === UserRole::Teacher->value, function ($q) use ($user) {
                $q->whereHas('currentGroup', fn ($groupQuery) => $groupQuery->where('teacher_id', $user->id));
            })
            ->orderBy('student_code')
            ->get()
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'name' => $student->user?->name,
                'student_code' => $student->student_code,
                'group_name' => $student->currentGroup?->name,
            ])
            ->all();
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function teacherOptions(): array
    {
        return User::query()
            ->where('role', UserRole::Teacher->value)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ])
            ->all();
    }

    private function ensureStudentInTeacherGroup(Student $student, User $user): void
    {
        if ($student->current_group_id === null || $student->currentGroup?->teacher_id !== $user->id) {
            abort(403, 'Santri tidak berada di kelompok Anda.');
        }
    }

    private function authorizeManage(User $user, ObservationEntry $entry): void
    {
        if ($user->role->value === UserRole::Admin->value) {
            return;
        }

        if ($entry->teacher_id !== $user->id) {
            abort(403, 'Anda hanya dapat mengubah observasi milik Anda sendiri.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function snapshot(ObservationEntry $entry): array
    {
        return [
            'entry' => $entry->only(['student_id', 'teacher_id', 'observed_at', 'general_note', 'sentiment']),
            'items' => $entry->items->map(fn ($item) => $item->only([
                'character_indicator_id',
                'sentiment',
                'assessment_score',
                'reward_points',
                'note',
            ]))->all(),
        ];
    }

    private function finalizeEntry(ObservationEntry $entry): void
    {
        $score = $this->scoreCalculator->calculateForEntry($entry)->score;
        $sentiment = $this->sentimentResolver->resolve(
            $entry->items->pluck('sentiment')->all(),
            $score,
        );

        $entry->update(['sentiment' => $sentiment]);

        $totalPoints = $entry->items->sum('reward_points');

        GoodnessPointTransaction::query()
            ->where('source_type', 'observation')
            ->where('source_id', $entry->id)
            ->delete();

        if ($totalPoints > 0) {
            GoodnessPointTransaction::query()->create([
                'student_id' => $entry->student_id,
                'source_type' => 'observation',
                'source_id' => $entry->id,
                'points' => $totalPoints,
                'description' => 'Poin observasi '.$entry->observed_at->toDateString(),
                'awarded_by' => $entry->teacher_id,
            ]);
        }
    }
}

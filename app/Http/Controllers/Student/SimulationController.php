<?php

namespace App\Http\Controllers\Student;

use App\Domain\GoodnessTree\GoodnessPointAwarder;
use App\Enums\SimulationScenarioStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\Simulations\SubmitSimulationAttemptRequest;
use App\Models\SimulationAttempt;
use App\Models\SimulationOption;
use App\Models\SimulationScenario;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SimulationController extends Controller
{
    public function __construct(
        private readonly GoodnessPointAwarder $pointAwarder,
    ) {}

    public function index(Request $request): Response
    {
        $student = $this->studentForUser($request->user());

        $scenarios = SimulationScenario::query()
            ->where('status', SimulationScenarioStatus::Published)
            ->withCount('options')
            ->latest()
            ->get();

        $latestAttempts = collect();
        if ($student !== null && $scenarios->isNotEmpty()) {
            $latestAttempts = SimulationAttempt::query()
                ->where('student_id', $student->id)
                ->whereIn('simulation_scenario_id', $scenarios->pluck('id'))
                ->orderByDesc('id')
                ->get()
                ->unique('simulation_scenario_id')
                ->keyBy('simulation_scenario_id');
        }

        $scenarios = $scenarios
            ->map(function (SimulationScenario $scenario) use ($latestAttempts) {
                $latestAttempt = $latestAttempts->get($scenario->id);

                return [
                    'id' => $scenario->id,
                    'title' => $scenario->title,
                    'description' => $scenario->description,
                    'opening_text' => $scenario->opening_text,
                    'image' => $scenario->image_path,
                    'options_count' => (int) $scenario->options_count,
                    'latest_attempt' => $latestAttempt === null ? null : [
                        'reward_points' => $latestAttempt->reward_points,
                        'score' => (float) $latestAttempt->score,
                    ],
                ];
            })
            ->values();

        return Inertia::render('student/simulations/index', [
            'scenarios' => $scenarios,
        ]);
    }

    public function show(Request $request, SimulationScenario $simulationScenario): Response
    {
        if ($simulationScenario->status !== SimulationScenarioStatus::Published) {
            abort(404);
        }

        $student = $this->studentForUser($request->user());

        $options = $simulationScenario->options()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'text']);

        $latestAttempt = $student === null
            ? null
            : SimulationAttempt::query()
                ->with('selectedOption')
                ->where('student_id', $student->id)
                ->where('simulation_scenario_id', $simulationScenario->id)
                ->latest('id')
                ->first();

        $result = $request->session()->pull('simulation_result_'.$simulationScenario->id);

        return Inertia::render('student/simulations/show', [
            'scenario' => [
                'id' => $simulationScenario->id,
                'title' => $simulationScenario->title,
                'description' => $simulationScenario->description,
                'opening_text' => $simulationScenario->opening_text,
                'image' => $simulationScenario->image_path,
            ],
            'options' => $options->map(fn (SimulationOption $option) => [
                'id' => $option->id,
                'text' => $option->text,
            ])->values(),
            'latest_attempt' => $latestAttempt === null ? null : [
                'id' => $latestAttempt->id,
                'option_id' => $latestAttempt->selected_option_id,
                'option_text' => $latestAttempt->selectedOption?->text,
                'feedback_text' => $latestAttempt->selectedOption?->feedback_text,
                'score' => (float) $latestAttempt->score,
                'reward_points' => $latestAttempt->reward_points,
                'completed_at' => $latestAttempt->completed_at?->toDateTimeString(),
            ],
            'has_profile' => $student !== null,
            'result' => $result,
        ]);
    }

    public function submit(SubmitSimulationAttemptRequest $request, SimulationScenario $simulationScenario): RedirectResponse
    {
        if ($simulationScenario->status !== SimulationScenarioStatus::Published) {
            abort(404);
        }

        $student = $this->studentForUser($request->user());

        if ($student === null) {
            abort(403);
        }

        $option = SimulationOption::query()
            ->whereKey($request->integer('selected_option_id'))
            ->where('simulation_scenario_id', $simulationScenario->id)
            ->first();

        if ($option === null) {
            return back()->withErrors([
                'selected_option_id' => 'Respons tidak tersedia untuk skenario ini.',
            ]);
        }

        $attempt = DB::transaction(function () use ($student, $simulationScenario, $option) {
            $attempt = SimulationAttempt::query()->create([
                'student_id' => $student->id,
                'simulation_scenario_id' => $simulationScenario->id,
                'selected_option_id' => $option->id,
                'score' => $option->score,
                'reward_points' => $option->reward_points,
                'completed_at' => now(),
            ]);

            $this->pointAwarder->awardSimulationReward($attempt);

            return $attempt;
        });

        $bestScore = (float) $simulationScenario->options()->max('score');

        $request->session()->flash('simulation_result_'.$simulationScenario->id, [
            'option_id' => $attempt->selected_option_id,
            'option_text' => $option->text,
            'feedback' => $option->feedback_text,
            'score' => (float) $attempt->score,
            'reward_points' => $attempt->reward_points,
            'correct_option_ids' => $simulationScenario->options()
                ->where('score', $bestScore)
                ->pluck('id')
                ->values()
                ->all(),
        ]);

        return redirect()->route('student.simulations.show', ['simulationScenario' => $simulationScenario->id]);
    }

    private function studentForUser(?User $user): ?Student
    {
        if ($user === null) {
            return null;
        }

        return Student::query()->where('user_id', $user->id)->first();
    }
}

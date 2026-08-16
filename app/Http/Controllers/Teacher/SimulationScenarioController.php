<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\SimulationScenarioStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\SimulationScenarios\StoreSimulationOptionRequest;
use App\Http\Requests\Teacher\SimulationScenarios\StoreSimulationScenarioRequest;
use App\Http\Requests\Teacher\SimulationScenarios\UpdateSimulationOptionRequest;
use App\Http\Requests\Teacher\SimulationScenarios\UpdateSimulationScenarioRequest;
use App\Models\SimulationOption;
use App\Models\SimulationScenario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SimulationScenarioController extends Controller
{
    public function index(Request $request): Response
    {
        $scenarios = SimulationScenario::query()
            ->with([
                'creator:id,name',
                'options' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ])
            ->withCount(['options', 'attempts'])
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('opening_text', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString() !== '', fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (SimulationScenario $scenario) => $this->scenarioPayload($scenario));

        return Inertia::render('teacher/simulations/index', [
            'simulations' => $scenarios,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statuses' => SimulationScenarioStatus::values(),
        ]);
    }

    public function store(StoreSimulationScenarioRequest $request): RedirectResponse
    {
        SimulationScenario::query()->create([
            ...$request->validated(),
            'status' => $request->string('status')->toString() !== ''
                ? $request->string('status')->toString()
                : SimulationScenarioStatus::Draft->value,
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('status', 'Skenario simulasi berhasil dibuat.');
    }

    public function update(UpdateSimulationScenarioRequest $request, SimulationScenario $simulationScenario): RedirectResponse
    {
        $simulationScenario->forceFill([
            ...$request->validated(),
            'status' => $request->string('status')->toString() !== ''
                ? $request->string('status')->toString()
                : $simulationScenario->status->value,
        ])->save();

        return back()->with('status', 'Skenario simulasi berhasil diperbarui.');
    }

    public function destroy(SimulationScenario $simulationScenario): RedirectResponse
    {
        if ($simulationScenario->attempts()->exists()) {
            return back()->withErrors([
                'scenario' => 'Skenario yang sudah memiliki riwayat simulasi santri tidak dapat dihapus. Ubah status menjadi arsip jika tidak ingin ditampilkan.',
            ]);
        }

        $simulationScenario->delete();

        return back()->with('status', 'Skenario simulasi berhasil dihapus.');
    }

    public function storeOption(StoreSimulationOptionRequest $request, SimulationScenario $simulationScenario): RedirectResponse
    {
        $simulationScenario->options()->create([
            ...$request->validated(),
            'score' => $request->input('score', 0),
            'reward_points' => $request->integer('reward_points', 0),
        ]);

        return back()->with('status', 'Respons simulasi berhasil dibuat.');
    }

    public function updateOption(UpdateSimulationOptionRequest $request, SimulationScenario $simulationScenario, SimulationOption $option): RedirectResponse
    {
        $this->ensureOptionBelongsToScenario($simulationScenario, $option);

        $option->forceFill([
            ...$request->validated(),
            'score' => $request->input('score', 0),
            'reward_points' => $request->integer('reward_points', 0),
        ])->save();

        return back()->with('status', 'Respons simulasi berhasil diperbarui.');
    }

    public function destroyOption(SimulationScenario $simulationScenario, SimulationOption $option): RedirectResponse
    {
        $this->ensureOptionBelongsToScenario($simulationScenario, $option);

        if ($option->attempts()->exists()) {
            return back()->withErrors([
                'option' => 'Respons yang sudah pernah dipilih santri tidak dapat dihapus.',
            ]);
        }

        $option->delete();

        return back()->with('status', 'Respons simulasi berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function scenarioPayload(SimulationScenario $scenario): array
    {
        return [
            'id' => $scenario->id,
            'title' => $scenario->title,
            'description' => $scenario->description,
            'opening_text' => $scenario->opening_text,
            'status' => $scenario->status->value,
            'options_count' => (int) $scenario->getAttribute('options_count'),
            'attempts_count' => (int) $scenario->getAttribute('attempts_count'),
            'creator_name' => $scenario->creator?->name,
            'options' => $scenario->options->map(fn (SimulationOption $option) => [
                'id' => $option->id,
                'text' => $option->text,
                'feedback_text' => $option->feedback_text,
                'score' => (float) $option->score,
                'reward_points' => $option->reward_points,
                'sort_order' => $option->sort_order,
            ])->values(),
            'created_at' => $scenario->created_at?->toISOString(),
        ];
    }

    private function ensureOptionBelongsToScenario(SimulationScenario $scenario, SimulationOption $option): void
    {
        abort_if($option->simulation_scenario_id !== $scenario->id, 404);
    }
}

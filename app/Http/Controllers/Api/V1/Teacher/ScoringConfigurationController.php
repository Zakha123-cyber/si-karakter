<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScoringConfigurationRequest;
use App\Http\Requests\UpdateScoringConfigurationRequest;
use App\Http\Resources\ScoringConfigurationResource;
use App\Models\ScoringConfiguration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScoringConfigurationController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $configurations = ScoringConfiguration::query()
            ->with('creator')
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return $this->success('Scoring configurations retrieved', ScoringConfigurationResource::collection($configurations));
    }

    public function store(StoreScoringConfigurationRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->boolean('is_active')) {
            ScoringConfiguration::query()->where('is_active', true)->update(['is_active' => false]);
        }

        $configuration = ScoringConfiguration::query()->create([
            ...$data,
            'is_active' => $request->boolean('is_active', false),
            'created_by' => $request->user()->id,
        ]);

        return $this->success('Scoring configuration created', [
            'configuration' => new ScoringConfigurationResource($configuration),
        ], 201);
    }

    public function show(ScoringConfiguration $scoringConfiguration): JsonResponse
    {
        $scoringConfiguration->load('creator');

        return $this->success('Scoring configuration retrieved', [
            'configuration' => new ScoringConfigurationResource($scoringConfiguration),
        ]);
    }

    public function update(UpdateScoringConfigurationRequest $request, ScoringConfiguration $scoringConfiguration): JsonResponse
    {
        $data = $request->validated();

        if ($request->boolean('is_active')) {
            ScoringConfiguration::query()
                ->where('is_active', true)
                ->where('id', '!=', $scoringConfiguration->id)
                ->update(['is_active' => false]);
        }

        $scoringConfiguration->update([
            ...$data,
            'is_active' => $request->boolean('is_active', false),
        ]);

        return $this->success('Scoring configuration updated', [
            'configuration' => new ScoringConfigurationResource($scoringConfiguration->fresh()->load('creator')),
        ]);
    }

    public function destroy(ScoringConfiguration $scoringConfiguration): JsonResponse
    {
        $scoringConfiguration->delete();

        return $this->success('Scoring configuration deleted');
    }
}

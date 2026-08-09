<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCharacterIndicatorRequest;
use App\Http\Requests\UpdateCharacterIndicatorRequest;
use App\Http\Resources\CharacterIndicatorResource;
use App\Models\CharacterIndicator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CharacterIndicatorController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $indicators = CharacterIndicator::query()
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($request->string('category')->toString() !== '', fn ($q) => $q->where('category', $request->string('category')->toString()))
            ->when($request->filled('is_warning_indicator'), function ($q) use ($request) {
                $q->where('is_warning_indicator', $request->boolean('is_warning_indicator'));
            })
            ->orderBy('name')
            ->paginate(min($request->integer('per_page', 15), 100));

        return $this->success('Character indicators retrieved', CharacterIndicatorResource::collection($indicators));
    }

    public function store(StoreCharacterIndicatorRequest $request): JsonResponse
    {
        $data = $request->validated();

        $indicator = CharacterIndicator::query()->create([
            'code' => $data['code'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'],
            'is_warning_indicator' => $request->boolean('is_warning_indicator'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return $this->success('Character indicator created', [
            'indicator' => new CharacterIndicatorResource($indicator),
        ], 201);
    }

    public function show(CharacterIndicator $characterIndicator): JsonResponse
    {
        return $this->success('Character indicator retrieved', [
            'indicator' => new CharacterIndicatorResource($characterIndicator),
        ]);
    }

    public function update(UpdateCharacterIndicatorRequest $request, CharacterIndicator $characterIndicator): JsonResponse
    {
        $data = $request->validated();

        $characterIndicator->update($data);

        return $this->success('Character indicator updated', [
            'indicator' => new CharacterIndicatorResource($characterIndicator->refresh()),
        ]);
    }

    public function destroy(CharacterIndicator $characterIndicator): JsonResponse
    {
        $characterIndicator->delete();

        return $this->success('Character indicator deleted');
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AcademicYears\StoreAcademicYearRequest;
use App\Http\Requests\Api\V1\AcademicYears\UpdateAcademicYearRequest;
use App\Http\Resources\Academic\AcademicYearResource;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $academicYears = AcademicYear::query()
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->boolean('is_active'), fn ($q) => $q->where('is_active', true))
            ->withCount('groups')
            ->latest()
            ->paginate(min($request->integer('per_page', 15), 100));

        return $this->success('Academic years retrieved', AcademicYearResource::collection($academicYears));
    }

    public function store(StoreAcademicYearRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($data['is_active'] ?? false) {
            AcademicYear::query()->where('is_active', true)->update(['is_active' => false]);
        }

        $academicYear = AcademicYear::query()->create($data);

        return $this->success('Academic year created', [
            'academic_year' => new AcademicYearResource($academicYear),
        ], 201);
    }

    public function show(AcademicYear $academicYear): JsonResponse
    {
        $academicYear->loadCount('groups');

        return $this->success('Academic year retrieved', [
            'academic_year' => new AcademicYearResource($academicYear),
        ]);
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear): JsonResponse
    {
        $data = $request->validated();

        if (($data['is_active'] ?? false) && ! $academicYear->is_active) {
            AcademicYear::query()->where('is_active', true)->update(['is_active' => false]);
        }

        $academicYear->update($data);

        return $this->success('Academic year updated', [
            'academic_year' => new AcademicYearResource($academicYear->refresh()),
        ]);
    }

    public function destroy(AcademicYear $academicYear): JsonResponse
    {
        if ($academicYear->groups()->exists()) {
            return $this->error('Cannot delete academic year with existing groups', 409);
        }

        $academicYear->delete();

        return $this->success('Academic year deleted');
    }

    public function activate(AcademicYear $academicYear): JsonResponse
    {
        if ($academicYear->is_active) {
            return $this->success('Academic year already active', [
                'academic_year' => new AcademicYearResource($academicYear),
            ]);
        }

        AcademicYear::query()->where('is_active', true)->update(['is_active' => false]);

        $academicYear->forceFill(['is_active' => true])->save();

        return $this->success('Academic year activated', [
            'academic_year' => new AcademicYearResource($academicYear->refresh()),
        ]);
    }
}

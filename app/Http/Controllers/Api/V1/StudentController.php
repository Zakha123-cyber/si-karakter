<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Students\StoreStudentRequest;
use App\Http\Requests\Api\V1\Students\UpdateStudentRequest;
use App\Http\Requests\Api\V1\Students\UpdateStudentStatusRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $students = Student::query()
            ->with(['user', 'currentGroup'])
            ->withCount('groupStudentHistories')
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('student_code', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%"));
                });
            })
            ->when($request->integer('group_id'), fn ($query, $id) => $query->where('current_group_id', $id))
            ->when($request->string('status')->toString() !== '', fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return $this->success('Students retrieved', StudentResource::collection($students));
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $student = Student::query()->create($data);
        $student->load(['user', 'currentGroup']);

        return $this->success('Student created', [
            'student' => new StudentResource($student),
        ], 201);
    }

    public function show(Student $student): JsonResponse
    {
        $student->load(['user', 'currentGroup', 'groupStudentHistories.group', 'groupStudentHistories.academicYear']);

        return $this->success('Student retrieved', [
            'student' => new StudentResource($student),
            'timeline' => $student->groupStudentHistories->map(fn ($history) => [
                'id' => $history->id,
                'group_name' => $history->group->name,
                'academic_year' => $history->academicYear->name,
                'joined_at' => $history->joined_at?->toISOString(),
                'left_at' => $history->left_at?->toISOString(),
            ]),
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $student->update($request->validated());
        $student->load(['user', 'currentGroup']);

        return $this->success('Student updated', [
            'student' => new StudentResource($student->refresh()),
        ]);
    }

    public function updateStatus(UpdateStudentStatusRequest $request, Student $student): JsonResponse
    {
        $student->forceFill([
            'status' => $request->string('status')->toString(),
        ])->save();

        return $this->success('Student status updated', [
            'student' => new StudentResource($student->refresh()),
        ]);
    }

    public function timeline(Student $student): JsonResponse
    {
        $histories = $student->groupStudentHistories()
            ->with(['group', 'academicYear'])
            ->orderBy('joined_at', 'desc')
            ->get();

        return $this->success('Student timeline retrieved', [
            'timeline' => $histories->map(fn ($history) => [
                'id' => $history->id,
                'group_name' => $history->group->name,
                'academic_year' => $history->academicYear->name,
                'joined_at' => $history->joined_at?->toISOString(),
                'left_at' => $history->left_at?->toISOString(),
            ]),
        ]);
    }
}

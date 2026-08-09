<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Students\StoreStudentRequest;
use App\Http\Requests\Api\V1\Students\UpdateStudentRequest;
use App\Http\Requests\Api\V1\Students\UpdateStudentStatusRequest;
use App\Http\Resources\Academic\GroupStudentHistoryResource;
use App\Http\Resources\Academic\StudentResource;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $students = Student::query()
            ->with('user')
            ->with('currentGroup')
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($q) use ($search) {
                    $q->where('student_code', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%"));
                });
            })
            ->when($request->integer('current_group_id'), fn ($q, $id) => $q->where('current_group_id', $id))
            ->when($request->string('status')->toString() !== '', fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate(min($request->integer('per_page', 15), 100));

        return $this->success('Students retrieved', StudentResource::collection($students));
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $student = Student::query()->create($data);
        $student->load('user');
        $student->load('currentGroup');

        return $this->success('Student created', [
            'student' => new StudentResource($student),
        ], 201);
    }

    public function show(Student $student): JsonResponse
    {
        $student->load(['user', 'currentGroup', 'groupStudentHistories.group', 'groupStudentHistories.academicYear']);

        return $this->success('Student retrieved', [
            'student' => new StudentResource($student),
            'timeline' => GroupStudentHistoryResource::collection($student->groupStudentHistories),
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
            'status' => $request->validated('status'),
        ])->save();

        return $this->success('Student status updated', [
            'student' => new StudentResource($student->refresh()->load(['user', 'currentGroup'])),
        ]);
    }

    public function timeline(Student $student): JsonResponse
    {
        $histories = $student->groupStudentHistories()
            ->with(['group', 'academicYear'])
            ->latest('joined_at')
            ->get();

        return $this->success('Student group history retrieved', [
            'timeline' => GroupStudentHistoryResource::collection($histories),
        ]);
    }
}

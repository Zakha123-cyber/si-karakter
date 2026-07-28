<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Groups\AssignStudentRequest;
use App\Http\Requests\Api\V1\Groups\StoreGroupRequest;
use App\Http\Requests\Api\V1\Groups\UpdateGroupRequest;
use App\Http\Resources\Academic\GroupResource;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $groups = Group::query()
            ->with('academicYear')
            ->with('teacher')
            ->withCount('students')
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->integer('academic_year_id'), fn ($q, $id) => $q->where('academic_year_id', $id))
            ->when($request->integer('teacher_id'), fn ($q, $id) => $q->where('teacher_id', $id))
            ->when($request->boolean('is_active'), fn ($q) => $q->where('is_active', true))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return $this->success('Groups retrieved', GroupResource::collection($groups));
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $data = $request->validated();

        $group = Group::query()->create($data);
        $group->load('academicYear');
        $group->load('teacher');

        return $this->success('Group created', [
            'group' => new GroupResource($group),
        ], 201);
    }

    public function show(Group $group): JsonResponse
    {
        $group->load(['academicYear', 'teacher']);
        $group->loadCount('students');

        return $this->success('Group retrieved', [
            'group' => new GroupResource($group),
        ]);
    }

    public function update(UpdateGroupRequest $request, Group $group): JsonResponse
    {
        $group->update($request->validated());
        $group->load(['academicYear', 'teacher']);

        return $this->success('Group updated', [
            'group' => new GroupResource($group->refresh()),
        ]);
    }

    public function destroy(Group $group): JsonResponse
    {
        if ($group->students()->exists()) {
            return $this->error('Cannot delete group with existing students', 409);
        }

        $group->delete();

        return $this->success('Group deleted');
    }

    public function assignStudents(AssignStudentRequest $request, Group $group): JsonResponse
    {
        $academicYear = AcademicYear::query()->where('is_active', true)->first();

        if (!$academicYear) {
            return $this->error('No active academic year found', 400);
        }

        $studentIds = $request->validated('student_ids');

        DB::transaction(function () use ($studentIds, $group, $academicYear) {
            foreach ($studentIds as $studentId) {
                $student = Student::query()->findOrFail($studentId);

                if ($student->current_group_id === $group->id) {
                    continue;
                }

                if ($student->current_group_id) {
                    GroupStudentHistory::query()->where('student_id', $studentId)
                        ->whereNull('left_at')
                        ->update(['left_at' => now()->toDateString()]);
                }

                GroupStudentHistory::query()->create([
                    'student_id' => $studentId,
                    'group_id' => $group->id,
                    'academic_year_id' => $academicYear->id,
                    'joined_at' => now()->toDateString(),
                ]);

                $student->forceFill(['current_group_id' => $group->id])->save();
            }
        });

        $group->loadCount('students');

        return $this->success('Students assigned to group', [
            'group' => new GroupResource($group),
        ]);
    }

    public function removeStudent(Group $group, Student $student): JsonResponse
    {
        if ($student->current_group_id !== $group->id) {
            return $this->error('Student is not in this group', 400);
        }

        DB::transaction(function () use ($student, $group) {
            GroupStudentHistory::query()->where('student_id', $student->id)
                ->where('group_id', $group->id)
                ->whereNull('left_at')
                ->update(['left_at' => now()->toDateString()]);

            $student->forceFill(['current_group_id' => null])->save();
        });

        return $this->success('Student removed from group');
    }
}

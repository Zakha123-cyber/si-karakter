<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\RespondsWithApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Groups\AssignStudentRequest;
use App\Http\Requests\Api\V1\Groups\StoreGroupRequest;
use App\Http\Requests\Api\V1\Groups\UpdateGroupRequest;
use App\Http\Resources\GroupResource;
use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class GroupController extends Controller
{
    use RespondsWithApiResponse;

    public function index(Request $request): JsonResponse
    {
        $groups = Group::query()
            ->with(['academicYear', 'teacher'])
            ->withCount('students')
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->integer('academic_year_id'), fn ($query, $id) => $query->where('academic_year_id', $id))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return $this->success('Groups retrieved', GroupResource::collection($groups));
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $group = Group::query()->create($request->validated());
        $group->load(['academicYear', 'teacher']);

        return $this->success('Group created', [
            'group' => new GroupResource($group),
        ], 201);
    }

    public function show(Group $group): JsonResponse
    {
        $group->load(['academicYear', 'teacher', 'students.user']);

        return $this->success('Group retrieved', [
            'group' => new GroupResource($group),
            'students' => $group->students->map(fn (Student $student) => [
                'id' => $student->id,
                'student_code' => $student->student_code,
                'name' => $student->user->name,
                'username' => $student->user->username,
                'status' => $student->status,
            ]),
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
            return $this->error('Cannot delete group with assigned students', 409);
        }

        $group->delete();

        return $this->success('Group deleted');
    }

    public function assignStudent(AssignStudentRequest $request, Group $group): JsonResponse
    {
        $student = Student::query()->findOrFail($request->integer('student_id'));

        $previousGroupId = $student->current_group_id;

        $student->forceFill([
            'current_group_id' => $group->id,
        ])->save();

        if ($previousGroupId) {
            GroupStudentHistory::query()
                ->where('student_id', $student->id)
                ->where('group_id', $previousGroupId)
                ->whereNull('left_at')
                ->update(['left_at' => Carbon::today()]);
        }

        GroupStudentHistory::query()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'academic_year_id' => $group->academic_year_id,
            'joined_at' => Carbon::today(),
        ]);

        return $this->success('Student assigned to group', [
            'student' => [
                'id' => $student->id,
                'student_code' => $student->student_code,
                'current_group_id' => $student->current_group_id,
            ],
        ]);
    }

    public function removeStudent(Group $group, Student $student): JsonResponse
    {
        if ($student->current_group_id !== $group->id) {
            return $this->error('Student is not in this group', 400);
        }

        $student->forceFill(['current_group_id' => null])->save();

        GroupStudentHistory::query()
            ->where('student_id', $student->id)
            ->where('group_id', $group->id)
            ->whereNull('left_at')
            ->update(['left_at' => Carbon::today()]);

        return $this->success('Student removed from group');
    }
}

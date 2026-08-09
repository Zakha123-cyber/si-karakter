<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\TestResultAttemptResource;
use App\Http\Resources\Admin\TestResultDetailResource;
use App\Models\AnswerAudioFile;
use App\Models\Group;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class TestResultController extends Controller
{
    public function index(Request $request): Response
    {
        $attempts = TestAttempt::query()
            ->with([
                'student.user:id,name,username',
                'student.currentGroup:id,name',
                'testPackage:id,title',
            ])
            ->withCount([
                'answers',
                'answers as answers_audio_files_count' => fn ($query) => $query->has('audioFiles'),
                'answers as answers_completed_transcriptions_count' => fn ($query) => $query->whereHas('transcriptions', fn ($transcriptionQuery) => $transcriptionQuery->where('status', 'completed')),
                'answers as answers_failed_transcriptions_count' => fn ($query) => $query->whereHas('transcriptions', fn ($transcriptionQuery) => $transcriptionQuery->where('status', 'failed')),
                'answers as answers_processing_transcriptions_count' => fn ($query) => $query->whereHas('transcriptions', fn ($transcriptionQuery) => $transcriptionQuery->where('status', 'processing')),
                'answers as answers_teacher_validations_count' => fn ($query) => $query->has('teacherValidations'),
            ])
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->whereHas('student.user', function ($userQuery) use ($search) {
                            $userQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('username', 'like', "%{$search}%");
                        })
                        ->orWhereHas('student', function ($studentQuery) use ($search) {
                            $studentQuery->where('student_code', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->integer('group_id'), function ($query, int $groupId) {
                $query->whereHas('student', fn ($studentQuery) => $studentQuery->where('current_group_id', $groupId));
            })
            ->when($request->integer('test_package_id'), fn ($query, int $packageId) => $query->where('test_package_id', $packageId))
            ->when($request->string('status')->toString() !== '', fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest('submitted_at')
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/test-results/index', [
            'attempts' => TestResultAttemptResource::collection($attempts),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'group_id' => $request->integer('group_id') ?: null,
                'test_package_id' => $request->integer('test_package_id') ?: null,
                'status' => $request->string('status')->toString(),
            ],
            'groups' => Group::query()->select('id', 'name')->orderBy('name')->get(),
            'testPackages' => TestPackage::query()->select('id', 'title')->orderBy('title')->get(),
        ]);
    }

    public function show(TestAttempt $testAttempt): Response
    {
        $testAttempt->load([
            'student.user:id,name,username',
            'student.currentGroup:id,name',
            'testPackage:id,title,description',
            'answers' => fn ($query) => $query->with([
                'moralCase.options' => fn ($optionQuery) => $optionQuery->orderBy('sort_order'),
                'selectedOption',
                'audioFiles' => fn ($audioQuery) => $audioQuery->latest(),
                'transcriptions' => fn ($transcriptionQuery) => $transcriptionQuery->latest(),
                'aiAssessments' => fn ($assessmentQuery) => $assessmentQuery->latest(),
                'teacherValidations' => fn ($validationQuery) => $validationQuery->latest(),
                'teacherValidations.teacher:id,name',
            ])->orderBy('id'),
        ]);

        return Inertia::render('admin/test-results/show', [
            'attempt' => (new TestResultDetailResource($testAttempt))->resolve(),
        ]);
    }

    public function audio(TestAnswer $answer): BinaryFileResponse
    {
        /** @var AnswerAudioFile|null $audioFile */
        $audioFile = $answer->audioFiles()->latest()->first();
        if (! $audioFile) {
            abort(404, 'Audio file not found.');
        }

        $filePath = storage_path('app/private/'.$audioFile->file_path);
        if (! file_exists($filePath)) {
            $filePath = storage_path('app/'.$audioFile->file_path);
        }
        if (! file_exists($filePath)) {
            $filePath = storage_path('app/public/'.$audioFile->file_path);
        }

        if (! file_exists($filePath)) {
            abort(404, 'Audio physical file does not exist.');
        }

        $safeName = preg_replace('/[^\w.\- ]+/u', '_', $audioFile->original_name) ?: 'audio';

        return response()->file($filePath, [
            'Content-Type' => $audioFile->mime_type ?: 'audio/mpeg',
            'Content-Disposition' => 'inline; filename="'.$safeName.'"',
        ]);
    }
}

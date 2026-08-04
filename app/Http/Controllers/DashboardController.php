<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\CharacterIndicator;
use App\Models\Student;
use App\Models\TestAnswer;
use App\Models\TestPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        if ($user?->role === UserRole::Student) {
            abort(redirect()->route('student.dashboard'));
        }

        $totalStudents = Student::query()
            ->when($user?->role === UserRole::Teacher, function ($q) use ($user) {
                $q->whereHas('currentGroup', fn ($g) => $g->where('teacher_id', $user->id));
            })
            ->count();

        $pendingReviewsQuery = TestAnswer::query()
            ->whereDoesntHave('teacherValidations')
            ->whereHas('testAttempt', function ($attemptQuery) use ($user) {
                $attemptQuery->where('status', 'submitted');
                if ($user?->role === UserRole::Teacher) {
                    $attemptQuery->whereHas('student.currentGroup', function ($groupQuery) use ($user) {
                        $groupQuery->where('teacher_id', $user->id);
                    });
                }
            });

        $pendingReviewsCount = (clone $pendingReviewsQuery)->count();

        $recentPendingReviews = (clone $pendingReviewsQuery)
            ->with([
                'testAttempt.student.user',
                'testAttempt.student.currentGroup',
                'testAttempt.testPackage',
                'moralCase',
            ])
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($answer) {
                return [
                    'id' => $answer->id,
                    'student_name' => $answer->testAttempt?->student?->user?->name ?? 'Santri',
                    'group_name' => $answer->testAttempt?->student?->currentGroup?->name ?? '-',
                    'package_title' => $answer->testAttempt?->testPackage?->title ?? '-',
                    'case_title' => $answer->moralCase?->title ?? '-',
                    'submitted_at' => $answer->created_at?->diffForHumans() ?? 'Baru saja',
                ];
            });

        $activePackagesCount = TestPackage::query()
            ->where('status', 'published')
            ->count();

        $totalIndicatorsCount = CharacterIndicator::query()
            ->where('is_active', true)
            ->count();

        $validatedReviewsCount = TestAnswer::query()
            ->whereHas('teacherValidations')
            ->when($user?->role === UserRole::Teacher, function ($q) use ($user) {
                $q->whereHas('testAttempt.student.currentGroup', fn ($g) => $g->where('teacher_id', $user->id));
            })
            ->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_students' => $totalStudents,
                'pending_reviews' => $pendingReviewsCount,
                'validated_reviews' => $validatedReviewsCount,
                'active_packages' => $activePackagesCount,
                'total_indicators' => $totalIndicatorsCount,
            ],
            'recent_pending_reviews' => $recentPendingReviews,
        ]);
    }
}
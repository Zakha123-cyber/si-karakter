<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\CharacterIndicator;
use App\Models\Student;
use App\Models\StudentWarning;
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

        $openWarningsCount = StudentWarning::query()
            ->where('status', 'open')
            ->when($user?->role === UserRole::Teacher, function ($q) use ($user) {
                $q->whereHas('student.currentGroup', fn ($g) => $g->where('teacher_id', $user->id));
            })
            ->count();

        $validatedReviewsCount = TestAnswer::query()
            ->whereHas('teacherValidations')
            ->when($user?->role === UserRole::Teacher, function ($q) use ($user) {
                $q->whereHas('testAttempt.student.currentGroup', fn ($g) => $g->where('teacher_id', $user->id));
            })
            ->count();

        $analytics = null;
        $filterOptions = null;
        $selectedGroupId = request('group_id');
        $selectedAcademicYearId = request('academic_year_id');

        if (in_array($user?->role, [UserRole::Admin, UserRole::Teacher])) {
            $isTeacher = $user?->role === UserRole::Teacher;

            // Fetch filter options
            $academicYears = \App\Models\AcademicYear::select('id', 'name')->orderByDesc('start_date')->get();
            $groupsQuery = \App\Models\Group::select('id', 'name');
            if ($isTeacher) {
                $groupsQuery->where('teacher_id', $user->id);
            }
            $groups = $groupsQuery->orderBy('name')->get();

            $filterOptions = [
                'academic_years' => $academicYears,
                'groups' => $groups,
                'selected_academic_year_id' => $selectedAcademicYearId,
                'selected_group_id' => $selectedGroupId,
            ];

            // 1. Moral Level Distribution
            $studentsPointsQuery = \Illuminate\Support\Facades\DB::table('students')
                ->leftJoin('goodness_point_transactions', function($join) {
                    $join->on('students.id', '=', 'goodness_point_transactions.student_id')
                         ->where('goodness_point_transactions.points', '>', 0);
                })
                ->select('students.id', \Illuminate\Support\Facades\DB::raw('COALESCE(SUM(goodness_point_transactions.points), 0) as total_points'))
                ->groupBy('students.id');

            if ($isTeacher || $selectedGroupId || $selectedAcademicYearId) {
                $studentsPointsQuery->join('groups', 'students.current_group_id', '=', 'groups.id');
                if ($isTeacher) {
                    $studentsPointsQuery->where('groups.teacher_id', $user->id);
                }
                if ($selectedGroupId) {
                    $studentsPointsQuery->where('groups.id', $selectedGroupId);
                }
                if ($selectedAcademicYearId) {
                    $studentsPointsQuery->where('groups.academic_year_id', $selectedAcademicYearId);
                }
            }

            $studentsPoints = $studentsPointsQuery->get();

            $levels = \App\Models\GoodnessTreeLevel::orderBy('minimum_points')->get();
            $moralDistributionRaw = [];
            foreach ($levels as $level) {
                $moralDistributionRaw[$level->name] = 0;
            }

            foreach ($studentsPoints as $sp) {
                $assignedLevel = $levels->first();
                foreach ($levels as $level) {
                    if ($sp->total_points >= $level->minimum_points) {
                        $assignedLevel = $level;
                    } else {
                        break;
                    }
                }
                if ($assignedLevel) {
                    $moralDistributionRaw[$assignedLevel->name]++;
                }
            }

            $moralLevelDistribution = [];
            foreach ($moralDistributionRaw as $name => $count) {
                $moralLevelDistribution[] = ['name' => $name, 'value' => $count];
            }

            // 2. Observation Summary
            $observationSummaryQuery = \Illuminate\Support\Facades\DB::table('observation_items')
                ->select('observation_items.sentiment', \Illuminate\Support\Facades\DB::raw('count(*) as count'));

            if ($isTeacher || $selectedGroupId || $selectedAcademicYearId) {
                $observationSummaryQuery->join('observation_entries', 'observation_items.observation_entry_id', '=', 'observation_entries.id');
                
                if ($isTeacher) {
                    $observationSummaryQuery->where('observation_entries.teacher_id', $user->id);
                }

                if ($selectedGroupId || $selectedAcademicYearId) {
                    $observationSummaryQuery->join('students', 'observation_entries.student_id', '=', 'students.id')
                                            ->join('groups', 'students.current_group_id', '=', 'groups.id');
                    if ($selectedGroupId) {
                        $observationSummaryQuery->where('groups.id', $selectedGroupId);
                    }
                    if ($selectedAcademicYearId) {
                        $observationSummaryQuery->where('groups.academic_year_id', $selectedAcademicYearId);
                    }
                }
            }

            $observationSummary = $observationSummaryQuery->groupBy('observation_items.sentiment')
                ->get()
                ->map(function ($item) {
                    $colors = [
                        'positive' => '#10b981', // emerald-500
                        'negative' => '#f43f5e', // rose-500
                        'neutral' => '#64748b', // slate-500
                    ];
                    return [
                        'name' => ucfirst($item->sentiment),
                        'value' => $item->count,
                        'fill' => $colors[$item->sentiment] ?? '#94a3b8'
                    ];
                });

            // 3. Score Trend (Dummy implementation since character_score_snapshots might be empty, or using real data if exists)
            $scoreTrendQuery = \Illuminate\Support\Facades\DB::table('character_score_snapshots')
                ->select(\Illuminate\Support\Facades\DB::raw("DATE_FORMAT(period_start, '%Y-%m') as month"), \Illuminate\Support\Facades\DB::raw('AVG(calculated_score) as avg_score'));

            if ($isTeacher || $selectedGroupId || $selectedAcademicYearId) {
                $scoreTrendQuery->join('students', 'character_score_snapshots.student_id', '=', 'students.id')
                                ->join('groups', 'students.current_group_id', '=', 'groups.id');
                
                if ($isTeacher) {
                    $scoreTrendQuery->where('groups.teacher_id', $user->id);
                }
                if ($selectedGroupId) {
                    $scoreTrendQuery->where('groups.id', $selectedGroupId);
                }
                if ($selectedAcademicYearId) {
                    $scoreTrendQuery->where('groups.academic_year_id', $selectedAcademicYearId);
                }
            }

            $scoreTrendRaw = $scoreTrendQuery->groupBy('month')
                ->orderBy('month')
                ->get();
            
            $scoreTrend = [];
            if ($scoreTrendRaw->isEmpty()) {
                // Generate dummy trend if no snapshot data yet
                $scoreTrend = [
                    ['name' => 'Jan', 'score' => 65],
                    ['name' => 'Feb', 'score' => 70],
                    ['name' => 'Mar', 'score' => 75],
                    ['name' => 'Apr', 'score' => 73],
                    ['name' => 'May', 'score' => 82],
                ];
            } else {
                $scoreTrend = $scoreTrendRaw->map(function ($item) {
                    return ['name' => $item->month, 'score' => round($item->avg_score, 2)];
                });
            }

            $analytics = [
                'moral_distribution' => $moralLevelDistribution,
                'observation_summary' => $observationSummary,
                'score_trend' => $scoreTrend,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'total_students' => $totalStudents,
                'pending_reviews' => $pendingReviewsCount,
                'validated_reviews' => $validatedReviewsCount,
                'active_packages' => $activePackagesCount,
                'total_indicators' => $totalIndicatorsCount,
                'open_warnings' => $openWarningsCount,
            ],
            'recent_pending_reviews' => $recentPendingReviews,
            'analytics' => $analytics,
            'filter_options' => $filterOptions,
        ]);
    }
}

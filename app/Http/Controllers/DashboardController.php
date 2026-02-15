<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Student;
use App\Models\Submission;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $user = auth()->user();

        // 未登录用户重定向到作品广场
        if (! $user) {
            return redirect()->route('submissions.gallery');
        }

        // 非管理员/老师也重定向到作品广场
        if (! $user->isAdmin() && ! $user->isTeacher()) {
            return redirect()->route('submissions.gallery');
        }

        // 管理员/老师显示仪表盘
        return $this->renderDashboard();
    }

    private function renderDashboard(): Response
    {
        // 基础统计数据
        $stats = [
            'total_students' => Student::count(),
            'total_lessons' => Lesson::where('is_active', true)->count(),
            'today_submissions' => Submission::whereDate('created_at', Carbon::today())->count(),
            'pending_reviews' => Submission::whereNull('score')->count(),
        ];

        // 各课时提交统计
        $lessonSubmissions = Lesson::select('lessons.id', 'lessons.name')
            ->selectRaw('COUNT(submissions.id) as submission_count')
            ->leftJoin('assignments', 'lessons.id', '=', 'assignments.lesson_id')
            ->leftJoin('submissions', 'assignments.id', '=', 'submissions.assignment_id')
            ->where('lessons.is_active', true)
            ->groupBy('lessons.id', 'lessons.name')
            ->orderBy('submission_count', 'desc')
            ->limit(10)
            ->get();

        // 成绩分布统计
        $scoreDistribution = [
            'G' => Submission::where('score', 12)->count(),
            'A' => Submission::where('score', 10)->count(),
            'B' => Submission::where('score', 8)->count(),
            'C' => Submission::where('score', 6)->count(),
            'O' => Submission::where('score', 0)->count(),
            'unrated' => Submission::whereNull('score')->count(),
        ];

        // 最近提交的作品（最近10条）
        $recentSubmissions = Submission::with([
            'student:id,name',
            'assignment:id,name,lesson_id',
            'assignment.lesson:id,name',
        ])
            ->select('id', 'student_id', 'assignment_id', 'file_name', 'score', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'student_name' => $submission->student?->name ?? '未知',
                    'assignment_name' => $submission->assignment?->name ?? '未知',
                    'lesson_name' => $submission->assignment?->lesson?->name ?? '未知',
                    'file_name' => $submission->file_name,
                    'score' => $submission->score,
                    'created_at' => $submission->created_at->diffForHumans(),
                ];
            });

        // 待评分作品（最近10条）
        $pendingSubmissions = Submission::with([
            'student:id,name',
            'assignment:id,name,lesson_id',
            'assignment.lesson:id,name',
        ])
            ->select('id', 'student_id', 'assignment_id', 'file_name', 'created_at')
            ->whereNull('score')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'student_name' => $submission->student?->name ?? '未知',
                    'assignment_name' => $submission->assignment?->name ?? '未知',
                    'lesson_name' => $submission->assignment?->lesson?->name ?? '未知',
                    'file_name' => $submission->file_name,
                    'created_at' => $submission->created_at->diffForHumans(),
                ];
            });

        // 最近7天提交趋势
        $submissionTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Submission::whereDate('created_at', $date)->count();
            $submissionTrend[] = [
                'date' => $date->format('m-d'),
                'count' => $count,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'lessonSubmissions' => $lessonSubmissions,
            'scoreDistribution' => $scoreDistribution,
            'recentSubmissions' => $recentSubmissions,
            'pendingSubmissions' => $pendingSubmissions,
            'submissionTrend' => $submissionTrend,
        ]);
    }
}

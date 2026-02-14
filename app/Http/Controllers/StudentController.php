<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $selectedYear = $request->query('year');

        // 获取所有可用年份（降序排列）
        $years = Student::query()
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        // 如果没有指定年份且有年份可用，默认选择最新年份
        if ($selectedYear === null && ! empty($years)) {
            $selectedYear = $years[0];
        }

        // 构建查询
        $query = Student::query()->with(['submissions' => function ($query): void {
            $query->whereNotNull('score');
        }]);

        // 如果指定了年份且不是 'all'，则筛选
        if ($selectedYear && $selectedYear !== 'all') {
            $query->where('year', $selectedYear);
        }

        $students = $query->latest()->get()->map(function (Student $student): array {
            $scores = $student->submissions->pluck('score')->filter();
            $totalScore = $scores->sum();
            $totalSubmissions = $student->submissions->count();

            return [
                'id' => $student->id,
                'name' => $student->name,
                'grade' => $student->grade,
                'class' => $student->class,
                'year' => $student->year,
                'created_at' => $student->created_at,
                'total_score' => $totalScore,
                'total_submissions' => $totalSubmissions,
            ];
        });

        return Inertia::render('students/index', [
            'students' => $students,
            'years' => $years,
            'selectedYear' => $selectedYear === 'all' ? null : $selectedYear,
        ]);
    }

    public function create(): \Inertia\Response
    {
        return Inertia::render('students/create');
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'grade' => 'required|integer|min:1|max:6',
            'class' => 'required|integer|min:1|max:20',
            'year' => 'required|integer|min:2020|max:2030',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        // 处理头像上传 - 按入学年份分类存放
        if ($request->hasFile('avatar')) {
            $year = $validated['year'];
            $validated['avatar'] = $request->file('avatar')->store("avatars/students/{$year}", 'public');
        }

        Student::create($validated);

        return redirect()->route('students.index')->with('success', '学生创建成功');
    }

    public function show(Student $student): \Inertia\Response
    {
        $student->load(['submissions' => function ($query): void {
            $query->with('assignment')
                ->latest()
                ->get();
        }]);

        $submissions = $student->submissions->map(function ($submission): array {
            return [
                'id' => $submission->id,
                'assignment_name' => $submission->assignment?->name ?? '未知作业',
                'file_name' => $submission->file_name,
                'file_size' => $this->formatFileSize($submission->file_size),
                'preview_image_path' => $submission->preview_image_path,
                'status' => $submission->status,
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'created_at' => $submission->created_at->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('students/show', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'grade' => $student->grade,
                'grade_text' => $student->grade_text,
                'class' => $student->class,
                'year' => $student->year,
                'avatar' => $student->avatar,
                'created_at' => $student->created_at->format('Y-m-d'),
            ],
            'submissions' => $submissions,
            'stats' => [
                'total_submissions' => $submissions->count(),
                'scored_submissions' => $submissions->whereNotNull('score')->count(),
                'total_score' => $submissions->sum('score') ?? 0,
                'avg_score' => (float) ($submissions->whereNotNull('score')->avg('score') ?? 0),
            ],
        ]);
    }

    private function formatFileSize(int $bytes): string
    {
        if ($bytes === 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = floor(log($bytes, 1024));

        return round($bytes / (1024 ** $unitIndex), 2).' '.$units[$unitIndex];
    }

    public function edit(Student $student): \Inertia\Response
    {
        return Inertia::render('students/edit', [
            'student' => $student,
        ]);
    }

    public function update(Request $request, Student $student): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'grade' => 'required|integer|min:1|max:6',
            'class' => 'required|integer|min:1|max:20',
            'year' => 'required|integer|min:2020|max:2030',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'remove_avatar' => 'nullable|boolean',
        ]);

        // 处理头像删除
        if (! empty($validated['remove_avatar']) && $student->avatar) {
            \Storage::disk('public')->delete($student->avatar);
            $validated['avatar'] = null;
        }

        // 处理新头像上传 - 按入学年份分类存放
        if ($request->hasFile('avatar')) {
            // 删除旧头像
            if ($student->avatar) {
                \Storage::disk('public')->delete($student->avatar);
            }
            $year = $validated['year'];
            $validated['avatar'] = $request->file('avatar')->store("avatars/students/{$year}", 'public');
        }

        unset($validated['remove_avatar']);

        $student->update($validated);

        return redirect()->route('students.index')->with('success', '学生更新成功');
    }

    public function destroy(Student $student): \Illuminate\Http\RedirectResponse
    {
        $student->delete();

        return redirect()->route('students.index')->with('success', '学生删除成功');
    }
}

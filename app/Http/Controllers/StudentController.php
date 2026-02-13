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
        ]);

        Student::create($validated);

        return redirect()->route('students.index')->with('success', '学生创建成功');
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
        ]);

        $student->update($validated);

        return redirect()->route('students.index')->with('success', '学生更新成功');
    }

    public function destroy(Student $student): \Illuminate\Http\RedirectResponse
    {
        $student->delete();

        return redirect()->route('students.index')->with('success', '学生删除成功');
    }
}

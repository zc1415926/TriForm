<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(): \Inertia\Response
    {
        $students = Student::latest()->get();

        return Inertia::render('students/index', [
            'students' => $students,
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

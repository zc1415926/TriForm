<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\UploadType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function index(): \Inertia\Response
    {
        $assignments = Assignment::with('uploadType')->latest()->get();

        return Inertia::render('assignments/index', [
            'assignments' => $assignments,
            'uploadTypes' => UploadType::all(['id', 'name', 'description']),
        ]);
    }

    public function create(): \Inertia\Response
    {
        return Inertia::render('assignments/create', [
            'uploadTypes' => UploadType::all(['id', 'name', 'description']),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'upload_type_id' => 'required|exists:upload_types,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'is_required' => 'required|boolean',
            'is_published' => 'required|boolean',
        ]);

        Assignment::create($validated);

        return redirect()->route('assignments.index')->with('success', '作业创建成功');
    }

    public function edit(Assignment $assignment): \Inertia\Response
    {
        return Inertia::render('assignments/edit', [
            'assignment' => $assignment,
            'uploadTypes' => UploadType::all(['id', 'name', 'description']),
        ]);
    }

    public function update(Request $request, Assignment $assignment): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'upload_type_id' => 'required|exists:upload_types,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'is_required' => 'required|boolean',
            'is_published' => 'required|boolean',
        ]);

        $assignment->update($validated);

        return redirect()->route('assignments.index')->with('success', '作业更新成功');
    }

    public function destroy(Assignment $assignment): \Illuminate\Http\RedirectResponse
    {
        $assignment->delete();

        return redirect()->route('assignments.index')->with('success', '作业删除成功');
    }
}

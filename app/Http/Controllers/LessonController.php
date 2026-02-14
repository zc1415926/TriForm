<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LessonController extends Controller
{
    public function index(): \Inertia\Response
    {
        $lessons = Lesson::with('assignments')->withCount('assignments')->latest()->get();

        return Inertia::render('lessons/index', [
            'lessons' => $lessons,
            'uploadTypes' => \App\Models\UploadType::all(['id', 'name', 'description']),
        ]);
    }

    public function create(): \Inertia\Response
    {
        return Inertia::render('lessons/create', [
            'uploadTypes' => \App\Models\UploadType::all(['id', 'name', 'description']),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|string|max:10',
            'is_active' => 'required|boolean',
            'content' => 'nullable|string',
            'assignments' => 'nullable|array',
            'assignments.*.name' => 'required|string|max:255',
            'assignments.*.upload_type_id' => 'required|exists:upload_types,id',
            'assignments.*.is_required' => 'required|boolean',
            'assignments.*.is_published' => 'required|boolean',
        ]);

        $lesson = Lesson::create([
            'name' => $validated['name'],
            'year' => $validated['year'],
            'is_active' => $validated['is_active'],
            'content' => $validated['content'] ?? null,
        ]);

        // 创建作业
        if (! empty($validated['assignments'])) {
            foreach ($validated['assignments'] as $assignmentData) {
                Assignment::create([
                    'name' => $assignmentData['name'],
                    'upload_type_id' => $assignmentData['upload_type_id'],
                    'lesson_id' => $lesson->id,
                    'is_required' => $assignmentData['is_required'],
                    'is_published' => $assignmentData['is_published'],
                ]);
            }
        }

        return redirect()->route('lessons.index')
            ->with('success', '课时创建成功')
            ->with('lesson', $lesson);
    }

    public function edit(Lesson $lesson): \Inertia\Response
    {
        return Inertia::render('lessons/edit', [
            'lesson' => $lesson->load('assignments'),
            'uploadTypes' => \App\Models\UploadType::all(['id', 'name', 'description']),
        ]);
    }

    public function update(Request $request, Lesson $lesson): \Illuminate\Http\RedirectResponse
    {
        \Log::debug('Update called', [
            'lesson_id' => $lesson->id,
            'lesson_name_before' => $lesson->name,
            'request_name' => $request->input('name'),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|string|max:10',
            'is_active' => 'required|boolean',
            'content' => 'nullable|string',
            'assignments' => 'nullable|array',
            'assignments.*.name' => 'required|string|max:255',
            'assignments.*.upload_type_id' => 'required|exists:upload_types,id',
            'assignments.*.is_required' => 'required|boolean',
            'assignments.*.is_published' => 'required|boolean',
        ]);

        $lesson->update([
            'name' => $validated['name'],
            'year' => $validated['year'],
            'is_active' => $validated['is_active'],
            'content' => $validated['content'] ?? null,
        ]);

        // 更新作业（删除原有作业，创建新作业）
        if (isset($validated['assignments'])) {
            $lesson->assignments()->delete();
            foreach ($validated['assignments'] as $assignmentData) {
                Assignment::create([
                    'name' => $assignmentData['name'],
                    'upload_type_id' => $assignmentData['upload_type_id'],
                    'lesson_id' => $lesson->id,
                    'is_required' => $assignmentData['is_required'],
                    'is_published' => $assignmentData['is_published'],
                ]);
            }
        }

        return redirect()->route('lessons.index')->with('success', '课时更新成功');
    }

    public function destroy(Lesson $lesson): \Illuminate\Http\RedirectResponse
    {
        $lesson->delete();

        return redirect()->route('lessons.index')->with('success', '课时删除成功');
    }
}

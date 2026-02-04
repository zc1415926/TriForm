<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Lesson;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    public function index(): \Inertia\Response
    {
        // 获取学生表中存在的年份
        $years = \App\Models\Student::select('year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->map(fn ($year) => (string) $year);

        return Inertia::render('submissions/index', [
            'years' => $years,
        ]);
    }

    public function show(): \Inertia\Response
    {
        // 获取学生表中存在的年份
        $years = \App\Models\Student::select('year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->map(fn ($year) => (string) $year);

        return Inertia::render('submissions/show', [
            'years' => $years,
        ]);
    }

    public function getStudentsByYear(Request $request): \Illuminate\Http\JsonResponse
    {
        $year = $request->query('year');
        $students = \App\Models\Student::where('year', $year)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($students);
    }

    public function getLessonsByYear(Request $request): \Illuminate\Http\JsonResponse
    {
        $year = $request->query('year');
        $lessons = Lesson::where('year', $year)
            ->where('is_active', true)
            ->with('assignments:id,name,lesson_id')
            ->orderBy('name')
            ->get(['id', 'name', 'year', 'content']);

        return response()->json($lessons);
    }

    public function getAssignmentsByLesson(Request $request): \Illuminate\Http\JsonResponse
    {
        $lessonId = $request->query('lesson_id');
        $assignments = Assignment::where('lesson_id', $lessonId)
            ->where('is_published', true)
            ->with('uploadType:id,name,extensions,max_size')
            ->orderBy('name')
            ->get(['id', 'name', 'upload_type_id', 'is_required']);

        return response()->json($assignments);
    }

    public function getSubmissionsByAssignment(Request $request): \Illuminate\Http\JsonResponse
    {
        $assignmentId = $request->query('assignment_id');
        $submissions = Submission::where('assignment_id', $assignmentId)
            ->with(['student:id,name,year', 'assignment:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($submissions);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'assignments' => 'required|array',
            'assignments.*.assignment_id' => 'required|exists:assignments,id',
            'assignments.*.file' => 'required|file|max:102400',
            'assignments.*.preview_image' => 'nullable|image|max:5120',
        ]);

        $student = \App\Models\Student::findOrFail($validated['student_id']);

        foreach ($validated['assignments'] as $assignmentData) {
            $file = $assignmentData['file'];
            $previewImage = $assignmentData['preview_image'] ?? null;
            $assignment = Assignment::with('lesson')->findOrFail($assignmentData['assignment_id']);
            $uploadType = $assignment->uploadType;

            // 验证文件类型
            $extension = strtolower($file->getClientOriginalExtension());
            if (! in_array($extension, $uploadType->extensions)) {
                return redirect()->back()->with('error', "作业「{$assignment->name}」的文件类型不支持");
            }

            // 验证文件大小
            if ($file->getSize() > $uploadType->max_size) {
                return redirect()->back()->with('error', "作业「{$assignment->name}」的文件大小超出限制");
            }

            // 构建存储路径：年份/课时ID/作业ID/
            $year = $assignment->lesson->year;
            $lessonId = $assignment->lesson->id;
            $assignmentId = $assignment->id;
            $storagePath = "submissions/{$year}/{$lessonId}/{$assignmentId}";

            // 存储文件（使用 public 磁盘以便通过 Web 访问）
            $filePath = $file->store($storagePath, 'public');
            $previewImagePath = null;

            // 存储预览图（如果存在）
            if ($previewImage) {
                $previewImagePath = $previewImage->store($storagePath, 'public');
            }

            // 检查是否已提交
            $existingSubmission = Submission::where('student_id', $validated['student_id'])
                ->where('assignment_id', $assignmentData['assignment_id'])
                ->first();

            if ($existingSubmission) {
                // 删除旧文件（使用 Storage facade 处理）
                \Storage::disk('public')->delete($existingSubmission->file_path);

                // 删除旧预览图
                if ($existingSubmission->preview_image_path) {
                    \Storage::disk('public')->delete($existingSubmission->preview_image_path);
                }

                // 更新提交记录
                $existingSubmission->update([
                    'file_path' => $filePath,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'preview_image_path' => $previewImagePath,
                    'status' => 'pending',
                ]);
            } else {
                // 创建新提交
                Submission::create([
                    'student_id' => $validated['student_id'],
                    'assignment_id' => $assignmentData['assignment_id'],
                    'file_path' => $filePath,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'preview_image_path' => $previewImagePath,
                    'status' => 'pending',
                ]);
            }
        }

        return redirect()->back()->with('success', '作品提交成功');
    }

    public function updateScore(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'submission_id' => 'required|exists:submissions,id',
            'grade' => 'required|in:G,A,B,C,O',
        ]);

        $submission = Submission::findOrFail($validated['submission_id']);

        // 等级转分数映射
        $gradeScores = [
            'G' => 12,
            'A' => 10,
            'B' => 8,
            'C' => 6,
            'O' => 0,
        ];

        $score = $gradeScores[$validated['grade']];

        $submission->update([
            'score' => $score,
        ]);

        return response()->json([
            'success' => true,
            'score' => $score,
            'grade' => $validated['grade'],
        ]);
    }

    public function cancelScore(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'submission_id' => 'required|exists:submissions,id',
        ]);

        $submission = Submission::findOrFail($validated['submission_id']);

        $submission->update([
            'score' => null,
        ]);

        return response()->json([
            'success' => true,
            'score' => null,
        ]);
    }
}

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

    public function gallery(): \Inertia\Response
    {
        return Inertia::render('submissions/gallery');
    }

    public function getAllSubmissions(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Submission::with([
            'student:id,name,year',
            'assignment:id,name,lesson_id',
            'assignment.lesson:id,name',
        ]);

        // 年份筛选
        if ($request->has('year') && $request->query('year') !== 'all') {
            $query->whereHas('student', function ($q) use ($request): void {
                $q->where('year', $request->query('year'));
            });
        }

        // 学生姓名搜索
        if ($request->has('search') && $request->query('search')) {
            $search = $request->query('search');
            $query->whereHas('student', function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // 排序
        $sortField = $request->query('sort', 'created_at');
        $sortDirection = $request->query('direction', 'desc');

        $allowedSortFields = ['created_at', 'score', 'file_name'];
        if (in_array($sortField, $allowedSortFields)) {
            // 分数排序时，将 null 放在最后
            if ($sortField === 'score') {
                $query->orderByRaw('CASE WHEN score IS NULL THEN 1 ELSE 0 END');
            }
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // 分页
        $perPage = $request->query('per_page', 20);
        $page = $request->query('page', 1);

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'has_more' => $paginated->hasMorePages(),
            ],
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

            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

            // 如果前端已经生成了缩略图（图片或3D模型），直接使用
            if ($previewImage) {
                $previewImagePath = $previewImage->store($storagePath, 'public');
            }
            // 如果是图片类型且前端没有生成缩略图，后端自动生成
            elseif (in_array($extension, $imageExtensions)) {
                // 使用 GD 库生成缩略图
                $imageInfo = getimagesize($file->getPathname());
                if ($imageInfo) {
                    [$width, $height] = $imageInfo;

                    // 如果图片超过 400x300，按比例缩放
                    if ($width > 400 || $height > 300) {
                        $thumbnailWidth = 400;
                        $thumbnailHeight = 300;

                        // 计算缩放比例
                        $ratio = min($thumbnailWidth / $width, $thumbnailHeight / $height);
                        $newWidth = (int) ($width * $ratio);
                        $newHeight = (int) ($height * $ratio);

                        // 创建缩略图
                        $thumbnail = imagecreatetruecolor($newWidth, $newHeight);

                        // 根据图片类型创建源图片
                        $source = null;
                        switch ($imageInfo[2]) {
                            case IMAGETYPE_JPEG:
                                $source = imagecreatefromjpeg($file->getPathname());
                                break;
                            case IMAGETYPE_PNG:
                                $source = imagecreatefrompng($file->getPathname());
                                // 保持 PNG 透明度
                                imagealphablending($thumbnail, false);
                                imagesavealpha($thumbnail, true);
                                $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
                                imagefilledrectangle($thumbnail, 0, 0, $newWidth, $newHeight, $transparent);
                                break;
                            case IMAGETYPE_GIF:
                                $source = imagecreatefromgif($file->getPathname());
                                break;
                            case IMAGETYPE_WEBP:
                                $source = imagecreatefromwebp($file->getPathname());
                                break;
                            case IMAGETYPE_BMP:
                                $source = imagecreatefrombmp($file->getPathname());
                                break;
                        }

                        if ($source) {
                            // 缩放图片
                            imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

                            // 保存缩略图到临时文件
                            $thumbnailPath = tempnam(sys_get_temp_dir(), 'thumbnail_');
                            imagejpeg($thumbnail, $thumbnailPath, 85);

                            // 存储缩略图
                            $thumbnailFile = new \Illuminate\Http\UploadedFile(
                                $thumbnailPath,
                                $file->getClientOriginalName(),
                                'image/jpeg',
                                null,
                                true
                            );
                            $previewImagePath = $thumbnailFile->store($storagePath, 'public');

                            // 清理
                            imagedestroy($thumbnail);
                            imagedestroy($source);
                            unlink($thumbnailPath);
                        }
                    } else {
                        // 图片小于等于 400x300，使用原图作为缩略图
                        $previewImagePath = $filePath;
                    }
                }
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

    public function destroy(string $id): \Illuminate\Http\JsonResponse
    {
        $submission = Submission::findOrFail($id);

        // 删除文件
        Storage::disk('public')->delete($submission->file_path);

        // 删除预览图（如果存在）
        if ($submission->preview_image_path) {
            Storage::disk('public')->delete($submission->preview_image_path);
        }

        // 删除数据库记录
        $submission->delete();

        return response()->json([
            'success' => true,
            'message' => '删除成功',
        ]);
    }

    public function uploadPreview(Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'preview_image' => 'required|string',
        ]);

        $submission = Submission::findOrFail($id);

        // 解码 base64 图片
        $base64Image = $validated['preview_image'];
        if (str_starts_with($base64Image, 'data:image')) {
            $base64Image = preg_replace('/^data:image\/\w+;base64,/', '', $base64Image);
        }

        $imageData = base64_decode($base64Image);
        if ($imageData === false) {
            return response()->json([
                'success' => false,
                'message' => '无效的图片数据',
            ], 400);
        }

        // 生成文件名
        $fileName = uniqid('vox_preview_').'.png';
        $storagePath = "submissions/{$submission->assignment->lesson->id}/{$submission->assignment->id}";

        // 删除旧的预览图
        if ($submission->preview_image_path) {
            Storage::disk('public')->delete($submission->preview_image_path);
        }

        // 保存新图片
        $previewPath = $storagePath.'/'.$fileName;
        Storage::disk('public')->put($previewPath, $imageData);

        // 更新数据库
        $submission->update([
            'preview_image_path' => $previewPath,
        ]);

        return response()->json([
            'success' => true,
            'preview_image_path' => $previewPath,
            'message' => '预览图上传成功',
        ]);
    }
}

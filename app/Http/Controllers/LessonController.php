<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;

class LessonController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $selectedYear = $request->query('year');
        $search = $request->query('search');
        $sortField = $request->query('sort', 'name');
        $sortDirection = $request->query('direction', 'desc');

        // 获取所有可用年份（降序排列）
        $years = Lesson::query()
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        // 构建查询
        $query = Lesson::with('assignments')
            ->withCount('assignments');

        // 年份筛选
        if ($selectedYear && $selectedYear !== 'all') {
            $query->where('year', $selectedYear);
        }

        // 名称搜索
        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        // 排序
        $allowedSortFields = ['id', 'name', 'year', 'is_active', 'created_at', 'assignments_count'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $lessons = $query->get();

        return Inertia::render('lessons/index', [
            'lessons' => $lessons,
            'uploadTypes' => \App\Models\UploadType::all(['id', 'name', 'description']),
            'years' => $years,
            'selectedYear' => $selectedYear === 'all' ? null : $selectedYear,
            'search' => $search,
            'sortField' => $sortField,
            'sortDirection' => $sortDirection,
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

        $lesson = \DB::transaction(function () use ($validated): Lesson {
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

            return $lesson;
        });

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

        \DB::transaction(function () use ($lesson, $validated): void {
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
        });

        return redirect()->route('lessons.index')->with('success', '课时更新成功');
    }

    public function destroy(Lesson $lesson): \Illuminate\Http\RedirectResponse
    {
        $lesson->delete();

        return redirect()->route('lessons.index')->with('success', '课时删除成功');
    }

    /**
     * 复制课时
     */
    public function duplicate(Lesson $lesson): \Illuminate\Http\RedirectResponse
    {
        $newLesson = \DB::transaction(function () use ($lesson): Lesson {
            // 复制课时基本信息
            $newLesson = $lesson->replicate();
            $newLesson->name = $lesson->name.' (副本)';
            $newLesson->is_active = false; // 默认禁用，需要手动启用
            $newLesson->save();

            // 复制作业
            foreach ($lesson->assignments as $assignment) {
                $newAssignment = $assignment->replicate();
                $newAssignment->lesson_id = $newLesson->id;
                $newAssignment->save();
            }

            // 复制附件
            foreach ($lesson->attachments as $attachment) {
                $newAttachment = $attachment->replicate();
                $newAttachment->lesson_id = $newLesson->id;
                $newAttachment->save();

                // 复制文件
                if (Storage::disk('public')->exists($attachment->file_path)) {
                    $newPath = str_replace($lesson->id.'_', $newLesson->id.'_', $attachment->file_path);
                    Storage::disk('public')->copy($attachment->file_path, $newPath);
                    $newAttachment->file_path = $newPath;
                    $newAttachment->save();
                }
            }

            return $newLesson;
        });

        return redirect()->route('lessons.index')->with('success', '课时复制成功');
    }

    /**
     * 从 HTML 内容中提取图片 URL
     *
     * @return array<string, string> [原始 URL => 文件名]
     */
    private function extractImagesFromContent(?string $content): array
    {
        if (empty($content)) {
            return [];
        }

        $images = [];

        // 匹配 img src 属性
        preg_match_all('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', $content, $matches);

        foreach ($matches[1] as $url) {
            // 只处理本地存储的图片
            if (str_contains($url, '/storage/')) {
                // 提取文件路径
                $path = str_replace(url('/storage/'), '', $url);
                $path = preg_replace('/^https?:\/\/[^\/]+\/storage\//', '', $url);
                $path = str_replace(url('/').'storage/', '', $url);

                // 如果是完整的 URL，提取 path 部分
                if (str_starts_with($url, 'http')) {
                    $parsed = parse_url($url);
                    if (isset($parsed['path'])) {
                        $path = preg_replace('/^\/storage\//', '', $parsed['path']);
                    }
                }

                // 清理路径
                $path = ltrim($path, '/');

                if ($path && Storage::disk('public')->exists($path)) {
                    $filename = basename($path);
                    $images[$url] = [
                        'path' => $path,
                        'filename' => $filename,
                    ];
                }
            }
        }

        return $images;
    }

    /**
     * 导出课时为 ZIP
     */
    public function export(Lesson $lesson): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $lesson->load(['assignments', 'attachments']);

        return new \Symfony\Component\HttpFoundation\StreamedResponse(function () use ($lesson): void {
            $zip = new ZipArchive;
            $tempFile = tempnam(sys_get_temp_dir(), 'lesson_export_');

            if ($zip->open($tempFile, ZipArchive::CREATE) !== true) {
                throw new \Exception('无法创建 ZIP 文件');
            }

            // 提取 content 中的图片
            $contentImages = $this->extractImagesFromContent($lesson->content);

            // 修改 content 中的图片 URL 为相对路径
            $content = $lesson->content;
            $imageMappings = []; // [原始 URL => 新的相对路径]

            foreach ($contentImages as $originalUrl => $imageInfo) {
                $relativePath = 'images/'.$imageInfo['filename'];
                $imageMappings[$originalUrl] = $relativePath;
                $content = str_replace($originalUrl, $relativePath, $content);
            }

            // 准备课时数据
            $lessonData = [
                'name' => $lesson->name,
                'year' => $lesson->year,
                'is_active' => $lesson->is_active,
                'content' => $content,
                'assignments' => $lesson->assignments->map(fn ($a) => [
                    'name' => $a->name,
                    'upload_type_id' => $a->upload_type_id,
                    'is_required' => $a->is_required,
                    'is_published' => $a->is_published,
                ])->toArray(),
                'attachments' => $lesson->attachments->map(fn ($a) => [
                    'original_name' => $a->original_name,
                    'file_path' => $a->file_path,
                ])->toArray(),
                'image_mappings' => $imageMappings, // 记录图片映射关系
            ];

            // 添加 JSON 文件
            $zip->addFromString('lesson.json', json_encode($lessonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            // 添加 content 中的图片文件
            foreach ($contentImages as $imageInfo) {
                $fileContent = Storage::disk('public')->get($imageInfo['path']);
                $zip->addFromString('images/'.$imageInfo['filename'], $fileContent);
            }

            // 添加附件文件
            foreach ($lesson->attachments as $attachment) {
                if (Storage::disk('public')->exists($attachment->file_path)) {
                    $fileContent = Storage::disk('public')->get($attachment->file_path);
                    $zip->addFromString('attachments/'.basename($attachment->file_path), $fileContent);
                }
            }

            $zip->close();

            // 输出 ZIP 内容
            readfile($tempFile);
            unlink($tempFile);
        }, 200, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="lesson_'.$lesson->id.'_'.date('Ymd').'.zip"',
            'Cache-Control' => 'max-age=0',
            'Pragma' => 'public',
        ]);
    }

    /**
     * 导入课时
     */
    public function import(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:zip|max:51200',
        ], [
            'file.required' => '请选择要导入的文件',
            'file.mimes' => '文件格式必须是 ZIP',
            'file.max' => '文件大小不能超过 50MB',
        ]);

        $zipFile = $request->file('file');
        $zip = new ZipArchive;
        $tempDir = sys_get_temp_dir().'/lesson_import_'.uniqid();
        mkdir($tempDir, 0755, true);

        try {
            if ($zip->open($zipFile->getRealPath()) !== true) {
                throw new \Exception('无法打开 ZIP 文件');
            }

            $zip->extractTo($tempDir);
            $zip->close();

            // 读取 JSON 文件
            $jsonPath = $tempDir.'/lesson.json';
            if (! file_exists($jsonPath)) {
                throw new \Exception('ZIP 文件中缺少 lesson.json');
            }

            $lessonData = json_decode(file_get_contents($jsonPath), true);
            if (! $lessonData) {
                throw new \Exception('lesson.json 格式错误');
            }

            // 创建课时（先不保存 content，等图片处理完再更新）
            $lesson = Lesson::create([
                'name' => $lessonData['name'].' (导入)',
                'year' => $lessonData['year'] ?? date('Y'),
                'is_active' => false,
                'content' => $lessonData['content'] ?? null,
            ]);

            // 处理 content 中的图片
            $content = $lesson->content;
            $imagesDir = $tempDir.'/images';

            if (! empty($content) && is_dir($imagesDir)) {
                $imageFiles = array_diff(scandir($imagesDir), ['.', '..']);

                foreach ($imageFiles as $imageFile) {
                    $sourcePath = $imagesDir.'/'.$imageFile;
                    if (is_file($sourcePath)) {
                        // 生成新的存储路径
                        $year = $lesson->year;
                        $newFilename = uniqid().'_'.$imageFile;
                        $newPath = "uploads/lessons/{$year}/{$lesson->id}/{$newFilename}";

                        // 确保目录存在
                        Storage::disk('public')->makeDirectory("uploads/lessons/{$year}/{$lesson->id}");

                        // 复制图片到 storage
                        Storage::disk('public')->put($newPath, file_get_contents($sourcePath));

                        // 生成新的 URL
                        $newUrl = Storage::disk('public')->url($newPath);

                        // 替换 content 中的相对路径
                        $relativePath = 'images/'.$imageFile;
                        $content = str_replace($relativePath, $newUrl, $content);
                    }
                }

                // 更新课时的 content
                $lesson->update(['content' => $content]);
            }

            // 创建作业
            if (! empty($lessonData['assignments'])) {
                foreach ($lessonData['assignments'] as $assignmentData) {
                    Assignment::create([
                        'name' => $assignmentData['name'],
                        'upload_type_id' => $assignmentData['upload_type_id'],
                        'lesson_id' => $lesson->id,
                        'is_required' => $assignmentData['is_required'] ?? true,
                        'is_published' => $assignmentData['is_published'] ?? false,
                    ]);
                }
            }

            // 处理附件
            if (! empty($lessonData['attachments'])) {
                foreach ($lessonData['attachments'] as $attachmentData) {
                    $originalPath = $tempDir.'/attachments/'.basename($attachmentData['file_path']);
                    if (file_exists($originalPath)) {
                        $year = $lesson->year;
                        $newPath = "attachments/lessons/{$year}/{$lesson->id}_".uniqid().'_'.basename($attachmentData['file_path']);
                        Storage::disk('public')->put($newPath, file_get_contents($originalPath));

                        \App\Models\Attachment::create([
                            'lesson_id' => $lesson->id,
                            'original_name' => $attachmentData['original_name'],
                            'file_path' => $newPath,
                            'file_size' => filesize($originalPath),
                        ]);
                    }
                }
            }

            // 清理临时文件
            $this->removeDirectory($tempDir);

            return redirect()->route('lessons.index')->with('success', '课时导入成功');
        } catch (\Exception $e) {
            $this->removeDirectory($tempDir);

            return redirect()->route('lessons.index')->with('error', '导入失败: '.$e->getMessage());
        }
    }

    /**
     * 递归删除目录
     */
    private function removeDirectory(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir.'/'.$file;
            is_dir($path) ? $this->removeDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * 上传 CKEditor 图片
     */
    public function ckeditorImage(Request $request): JsonResponse
    {
        $request->validate([
            'upload' => 'required|image|max:10240', // 最大10MB
            'year' => 'required|string',
            'lesson_id' => 'required|string', // 可以是临时ID或真实ID
        ]);

        $file = $request->file('upload');
        $year = $request->input('year');
        $lessonId = $request->input('lesson_id');

        // 生成文件名：原文件名 + 时间戳
        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $newFileName = $fileName.'_'.time().'.'.$extension;

        // 存储路径：uploads/{year}/{lesson_id}/{filename}
        $path = $file->storeAs("uploads/{$year}/{$lessonId}", $newFileName, 'public');

        // 返回 CKEditor 需要的格式
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'url' => $url,
        ]);
    }

    /**
     * 移动临时文件夹的图片到正确的文件夹
     */
    public function moveLessonImages(Request $request): JsonResponse
    {
        $request->validate([
            'year' => 'required|string',
            'temp_lesson_id' => 'required|string',
            'real_lesson_id' => 'required|string',
        ]);

        $year = $request->input('year');
        $tempLessonId = $request->input('temp_lesson_id');
        $realLessonId = $request->input('real_lesson_id');

        $tempPath = "uploads/{$year}/{$tempLessonId}";
        $realPath = "uploads/{$year}/{$realLessonId}";

        // 如果临时文件夹存在且不为空
        if (Storage::disk('public')->exists($tempPath)) {
            $files = Storage::disk('public')->files($tempPath);

            foreach ($files as $file) {
                $fileName = basename($file);
                // 移动文件
                Storage::disk('public')->move($file, "{$realPath}/{$fileName}");
            }

            // 删除临时文件夹
            Storage::disk('public')->deleteDirectory($tempPath);
        }

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * 上传附件（非图片文件）
     */
    public function attachment(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:51200', // 最大50MB
            'year' => 'required|string',
            'lesson_id' => 'required|string',
        ]);

        $file = $request->file('file');
        $year = $request->input('year');
        $lessonId = $request->input('lesson_id');

        // 生成唯一文件名
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $newFileName = uniqid().'_'.time().'.'.$extension;

        // 存储路径：uploads/{year}/{lesson_id}/attachments/{filename}
        $path = $file->storeAs("uploads/{$year}/{$lessonId}/attachments", $newFileName, 'public');

        // 获取文件大小（可读格式）
        $size = $file->getSize();
        $readableSize = $this->formatFileSize($size);

        $url = Storage::disk('public')->url($path);

        return response()->json([
            'url' => $url,
            'original_name' => $originalName,
            'size' => $readableSize,
        ]);
    }

    /**
     * 格式化文件大小
     */
    private function formatFileSize(int $bytes): string
    {
        if ($bytes === 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes, 1024));

        return round($bytes / (1024 ** $i), 2).' '.$units[$i];
    }
}

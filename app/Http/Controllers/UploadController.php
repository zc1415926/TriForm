<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * 上传 CKEditor 图片
     */
    public function ckeditorImage(Request $request)
    {
        $request->validate([
            'upload' => 'required|image|max:10240', // 最大10MB
            'year' => 'required|string',
            'lesson_id' => 'required|integer',
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
}

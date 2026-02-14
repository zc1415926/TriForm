<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'original_name',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'file_extension',
    ];

    /**
     * 获取文件大小的可读格式
     */
    public function getReadableFileSize(): string
    {
        $size = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }

        return round($size, 2).' '.$units[$i];
    }

    /**
     * 获取文件图标类型
     */
    public function getFileIcon(): string
    {
        $iconMap = [
            'pdf' => 'pdf',
            'doc' => 'word',
            'docx' => 'word',
            'xls' => 'excel',
            'xlsx' => 'excel',
            'ppt' => 'powerpoint',
            'pptx' => 'powerpoint',
            'zip' => 'archive',
            'rar' => 'archive',
            '7z' => 'archive',
            'jpg' => 'image',
            'jpeg' => 'image',
            'png' => 'image',
            'gif' => 'image',
            'mp4' => 'video',
            'mp3' => 'audio',
            'txt' => 'text',
        ];

        return $iconMap[$this->file_extension] ?? 'file';
    }

    /**
     * 关联到课时
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}

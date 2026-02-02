<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\UploadType;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        Student::factory(20)->create();

        $imageUploadType = UploadType::create([
            'name' => '图片文件',
            'description' => '允许上传的图片格式',
            'extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'max_size' => 52428800,
        ]);

        $documentUploadType = UploadType::create([
            'name' => '文档文件',
            'description' => '允许上传的文档格式',
            'extensions' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
            'max_size' => 104857600,
        ]);

        UploadType::create([
            'name' => '视频文件',
            'description' => '允许上传的视频格式',
            'extensions' => ['mp4', 'avi', 'mov', 'wmv'],
            'max_size' => 524288000,
        ]);

        $lesson1 = Lesson::create([
            'name' => '3D建模基础',
            'year' => '2026',
            'is_active' => true,
        ]);

        $lesson2 = Lesson::create([
            'name' => '3D渲染技术',
            'year' => '2026',
            'is_active' => true,
        ]);

        Lesson::create([
            'name' => '3D动画制作',
            'year' => '2026',
            'is_active' => false,
        ]);

        Assignment::create([
            'name' => '3D建模基础作业',
            'upload_type_id' => $imageUploadType->id,
            'lesson_id' => $lesson1->id,
            'is_required' => true,
            'is_published' => true,
        ]);

        Assignment::create([
            'name' => '设计草图作业',
            'upload_type_id' => $imageUploadType->id,
            'lesson_id' => $lesson1->id,
            'is_required' => true,
            'is_published' => true,
        ]);

        Assignment::create([
            'name' => '课程总结报告',
            'upload_type_id' => $documentUploadType->id,
            'lesson_id' => $lesson2->id,
            'is_required' => false,
            'is_published' => true,
        ]);
    }
}

<?php

namespace Database\Seeders;

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

        UploadType::create([
            'name' => '图片文件',
            'description' => '允许上传的图片格式',
            'extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'max_size' => 52428800,
        ]);

        UploadType::create([
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
    }
}

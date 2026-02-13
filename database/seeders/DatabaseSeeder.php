<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\Submission;
use App\Models\UploadType;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 创建测试用户
        if (! User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // 创建管理员用户
        if (! User::where('email', 'admin@example.com')->exists()) {
            User::factory()->create([
                'name' => '管理员',
                'email' => 'admin@example.com',
            ]);
        }

        // 创建上传类型
        $imageUploadType = UploadType::firstOrCreate(
            ['name' => '图片文件'],
            [
                'description' => '允许上传的图片格式',
                'extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
                'max_size' => 52428800,
            ]
        );

        $documentUploadType = UploadType::firstOrCreate(
            ['name' => '文档文件'],
            [
                'description' => '允许上传的文档格式',
                'extensions' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
                'max_size' => 104857600,
            ]
        );

        $videoUploadType = UploadType::firstOrCreate(
            ['name' => '视频文件'],
            [
                'description' => '允许上传的视频格式',
                'extensions' => ['mp4', 'avi', 'mov', 'wmv'],
                'max_size' => 524288000,
            ]
        );

        $model3dUploadType = UploadType::firstOrCreate(
            ['name' => '3D模型文件'],
            [
                'description' => '允许上传的3D模型格式',
                'extensions' => ['stl', 'obj', 'fbx', 'gltf', 'glb'],
                'max_size' => 104857600,
            ]
        );

        // 创建2025年课程
        $lesson2025_1 = Lesson::firstOrCreate(
            ['name' => '3D建模入门', 'year' => '2025'],
            ['is_active' => true, 'content' => '<p>本课程介绍3D建模的基本概念和技巧。</p>']
        );

        $lesson2025_2 = Lesson::firstOrCreate(
            ['name' => '3D渲染基础', 'year' => '2025'],
            ['is_active' => true, 'content' => '<p>学习3D渲染的基本原理和方法。</p>']
        );

        $lesson2025_3 = Lesson::firstOrCreate(
            ['name' => '3D打印实践', 'year' => '2025'],
            ['is_active' => false, 'content' => '<p>3D打印技术实践课程。</p>']
        );

        // 创建2026年课程
        $lesson2026_1 = Lesson::firstOrCreate(
            ['name' => '3D建模基础', 'year' => '2026'],
            ['is_active' => true, 'content' => '<p>2026年度3D建模基础课程。</p>']
        );

        $lesson2026_2 = Lesson::firstOrCreate(
            ['name' => '3D渲染技术', 'year' => '2026'],
            ['is_active' => true, 'content' => '<p>深入学习3D渲染技术。</p>']
        );

        $lesson2026_3 = Lesson::firstOrCreate(
            ['name' => '3D动画制作', 'year' => '2026'],
            ['is_active' => false, 'content' => '<p>3D动画制作入门。</p>']
        );

        // 创建2025年作业
        $assignments2025 = [
            ['name' => '基础建模练习', 'lesson' => $lesson2025_1, 'type' => $model3dUploadType, 'required' => true],
            ['name' => '建模作业一', 'lesson' => $lesson2025_1, 'type' => $model3dUploadType, 'required' => true],
            ['name' => '渲染练习', 'lesson' => $lesson2025_2, 'type' => $imageUploadType, 'required' => true],
            ['name' => '渲染作品', 'lesson' => $lesson2025_2, 'type' => $imageUploadType, 'required' => false],
            ['name' => '打印模型设计', 'lesson' => $lesson2025_3, 'type' => $model3dUploadType, 'required' => true],
        ];

        foreach ($assignments2025 as $data) {
            Assignment::firstOrCreate(
                ['name' => $data['name'], 'lesson_id' => $data['lesson']->id],
                [
                    'upload_type_id' => $data['type']->id,
                    'is_required' => $data['required'],
                    'is_published' => true,
                ]
            );
        }

        // 创建2026年作业
        $assignments2026 = [
            ['name' => '3D建模基础作业', 'lesson' => $lesson2026_1, 'type' => $model3dUploadType, 'required' => true],
            ['name' => '设计草图作业', 'lesson' => $lesson2026_1, 'type' => $imageUploadType, 'required' => true],
            ['name' => '课程总结报告', 'lesson' => $lesson2026_2, 'type' => $documentUploadType, 'required' => false],
            ['name' => '渲染作品展示', 'lesson' => $lesson2026_2, 'type' => $imageUploadType, 'required' => true],
            ['name' => '动画设计草稿', 'lesson' => $lesson2026_3, 'type' => $imageUploadType, 'required' => false],
        ];

        foreach ($assignments2026 as $data) {
            Assignment::firstOrCreate(
                ['name' => $data['name'], 'lesson_id' => $data['lesson']->id],
                [
                    'upload_type_id' => $data['type']->id,
                    'is_required' => $data['required'],
                    'is_published' => true,
                ]
            );
        }

        // 创建学生 - 2025年
        $students2025 = collect();
        $studentNames2025 = [
            '张明', '李华', '王芳', '刘洋', '陈静',
            '杨帆', '赵强', '黄丽', '周杰', '吴敏',
            '徐伟', '孙雪', '马超', '朱婷', '胡磊',
        ];

        foreach ($studentNames2025 as $index => $name) {
            $grade = ($index % 6) + 1;
            $class = ($index % 5) + 1;
            $student = Student::firstOrCreate(
                ['name' => $name, 'year' => 2025],
                ['grade' => $grade, 'class' => $class]
            );
            $students2025->push($student);
        }

        // 创建学生 - 2026年
        $students2026 = collect();
        $studentNames2026 = [
            '张三', '李四', '王五', '赵六', '钱七',
            '孙八', '周九', '吴十', '郑一', '王二',
            '冯三', '陈四', '褚五', '卫六', '蒋七',
            '沈八', '韩九', '杨十', '朱一', '秦二',
            '尤三', '许四', '何五', '吕六', '施七',
        ];

        foreach ($studentNames2026 as $index => $name) {
            $grade = ($index % 6) + 1;
            $class = ($index % 5) + 1;
            $student = Student::firstOrCreate(
                ['name' => $name, 'year' => 2026],
                ['grade' => $grade, 'class' => $class]
            );
            $students2026->push($student);
        }

        // 创建提交记录
        $this->createSubmissions($students2025, Assignment::whereHas('lesson', fn ($q) => $q->where('year', '2025'))->get());
        $this->createSubmissions($students2026, Assignment::whereHas('lesson', fn ($q) => $q->where('year', '2026'))->get());

        $this->command->info('测试数据创建完成！');
        $this->command->info('- 学生: '.Student::count().' 人');
        $this->command->info('- 课程: '.Lesson::count().' 门');
        $this->command->info('- 作业: '.Assignment::count().' 个');
        $this->command->info('- 提交: '.Submission::count().' 份');
    }

    /**
     * 创建提交记录
     */
    private function createSubmissions($students, $assignments): void
    {
        $grades = ['G', 'A', 'B', 'C'];
        $gradeScores = ['G' => 12, 'A' => 10, 'B' => 8, 'C' => 6];

        foreach ($students as $student) {
            // 每个学生随机提交部分作业
            $randomAssignments = $assignments->random(min($assignments->count(), rand(2, $assignments->count())));

            foreach ($randomAssignments as $assignment) {
                // 80%概率提交作业
                if (rand(1, 100) <= 80) {
                    $hasScore = rand(1, 100) <= 70; // 70%概率已评分

                    Submission::firstOrCreate(
                        [
                            'student_id' => $student->id,
                            'assignment_id' => $assignment->id,
                        ],
                        [
                            'file_path' => 'submissions/'.$assignment->lesson->year.'/'.$assignment->lesson->id.'/'.$assignment->id.'/'.$student->id.'_work.stl',
                            'file_name' => $student->name.'_作品.stl',
                            'file_size' => rand(50000, 5000000),
                            'preview_image_path' => 'previews/'.$student->id.'_preview.png',
                            'status' => 'pending',
                            'score' => $hasScore ? $gradeScores[$grades[array_rand($grades)]] : null,
                            'feedback' => $hasScore ? $this->getRandomFeedback() : null,
                        ]
                    );
                }
            }
        }
    }

    /**
     * 获取随机评语
     */
    private function getRandomFeedback(): string
    {
        $feedbacks = [
            '作品完成度很高，细节处理得当。',
            '创意很好，继续努力！',
            '建模技巧熟练，作品质量优秀。',
            '结构清晰，渲染效果不错。',
            '整体效果良好，有进步空间。',
            '作品完整，表现出了良好的学习态度。',
            '技术掌握扎实，作品值得肯定。',
            '设计思路清晰，执行到位。',
        ];

        return $feedbacks[array_rand($feedbacks)];
    }
}

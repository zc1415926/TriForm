<?php

declare(strict_types=1);

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Http\UploadedFile;

uses()->group('lessons');

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);

    // 访问页面获取 CSRF token
    $response = $this->get(route('lessons.index'));
    $token = csrf_token();
    if ($token) {
        $this->withCookie('XSRF-TOKEN', $token);
    }
});

describe('课时筛选和搜索功能', function (): void {

    test('可以按年份筛选课时', function (): void {
        Lesson::factory()->create(['year' => '2023']);
        Lesson::factory()->create(['year' => '2024']);

        $response = $this->get(route('lessons.index', ['year' => '2023']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('lessons')
            ->where('selectedYear', '2023')
        );
    });

    test('可以搜索课时名称', function (): void {
        Lesson::factory()->create(['name' => '3D建模基础']);
        Lesson::factory()->create(['name' => 'Python编程']);

        $response = $this->get(route('lessons.index', ['search' => '3D']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('lessons')
            ->where('search', '3D')
        );
    });

    test('可以按字段排序课时', function (): void {
        Lesson::factory()->create(['name' => '课时A', 'year' => '2023']);
        Lesson::factory()->create(['name' => '课时B', 'year' => '2024']);

        $response = $this->get(route('lessons.index', ['sort' => 'name', 'direction' => 'asc']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('sortField', 'name')
            ->where('sortDirection', 'asc')
        );
    });
});

describe('课时复制功能', function (): void {

    test('可以复制课时', function (): void {
        $lesson = Lesson::factory()->create(['name' => '原始课时']);
        $token = csrf_token() ?: 'test-token';

        $response = $this->post(route('lessons.duplicate', $lesson), [
            '_token' => $token,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('lessons', ['name' => '原始课时 (副本)']);
    });
});

describe('课时导入导出功能', function (): void {

    test('可以导出课时为 ZIP', function (): void {
        $lesson = Lesson::factory()->create();

        $response = $this->get(route('lessons.export', $lesson));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/zip');
    });

    test('可以导入课时 ZIP 文件', function (): void {
        // 创建 ZIP 文件
        $zip = new ZipArchive;
        $tempFile = tempnam(sys_get_temp_dir(), 'lesson_test_');
        $zip->open($tempFile, ZipArchive::CREATE);

        $lessonData = [
            'name' => '测试课时',
            'year' => '2024',
            'is_active' => true,
            'content' => '<p>测试内容</p><p><img src="images/test_image.png"></p>',
            'assignments' => [],
            'attachments' => [],
            'image_mappings' => [],
        ];
        $zip->addFromString('lesson.json', json_encode($lessonData));
        $zip->addFromString('images/test_image.png', 'fake image content');
        $zip->close();

        $file = new UploadedFile($tempFile, 'lesson.zip', 'application/zip', null, true);

        $token = csrf_token() ?: 'test-token';
        $response = $this->post(route('lessons.import'), [
            '_token' => $token,
            'file' => $file,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('lessons', ['name' => '测试课时 (导入)']);

        unlink($tempFile);
    });
});

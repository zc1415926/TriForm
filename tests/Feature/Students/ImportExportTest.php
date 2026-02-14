<?php

declare(strict_types=1);

use App\Models\Student;
use App\Models\User;
use App\Services\StudentImportService;
use Illuminate\Http\UploadedFile;

uses()->group('students');

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('学生导入导出功能', function (): void {

    test('可以下载导入模板', function (): void {
        $response = $this->get(route('students.template.download'));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    test('可以导出学生数据', function (): void {
        // 创建测试数据
        Student::factory()->count(3)->create();

        $response = $this->get(route('students.export'));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    test('导出支持年份筛选', function (): void {
        Student::factory()->create(['year' => 2023]);
        Student::factory()->create(['year' => 2024]);

        $response = $this->get(route('students.export', ['year' => 2023]));

        $response->assertStatus(200);
    });

    test('可以导入学生数据', function (): void {
        $importService = new StudentImportService;

        // 创建测试 Excel 文件
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setCellValue('A1', '姓名');
        $sheet->setCellValue('B1', '年级(1-6)');
        $sheet->setCellValue('C1', '班级(1-20)');
        $sheet->setCellValue('D1', '年份(2020-2030)');
        $sheet->setCellValue('A2', '测试学生');
        $sheet->setCellValue('B2', 3);
        $sheet->setCellValue('C2', 1);
        $sheet->setCellValue('D2', 2024);

        $tempFile = tempnam(sys_get_temp_dir(), 'students_');
        $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($tempFile);

        $file = new UploadedFile($tempFile, 'students.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

        $result = $importService->import($file);

        expect($result['success'])->toBe(1);
        expect($result['failed'])->toBe(0);
        expect(Student::where('name', '测试学生')->exists())->toBeTrue();

        unlink($tempFile);
    });

    test('导入会验证数据', function (): void {
        $importService = new StudentImportService;

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setCellValue('A1', '姓名');
        $sheet->setCellValue('B1', '年级(1-6)');
        $sheet->setCellValue('C1', '班级(1-20)');
        $sheet->setCellValue('D1', '年份(2020-2030)');
        $sheet->setCellValue('A2', ''); // 空姓名
        $sheet->setCellValue('B2', 10); // 无效年级
        $sheet->setCellValue('C2', 1);
        $sheet->setCellValue('D2', 2024);

        $tempFile = tempnam(sys_get_temp_dir(), 'students_');
        $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($tempFile);

        $file = new UploadedFile($tempFile, 'students.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

        $result = $importService->import($file);

        expect($result['success'])->toBe(0);
        expect($result['failed'])->toBe(1);
        expect($result['errors'])->not->toBeEmpty();

        unlink($tempFile);
    });
});

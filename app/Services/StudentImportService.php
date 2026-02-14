<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Student;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StudentImportService
{
    /**
     * 从 Excel 文件导入学生
     *
     * @return array{success: int, failed: int, errors: array<int, string>}
     */
    public function import(UploadedFile $file): array
    {
        $reader = IOFactory::createReader('Xlsx');
        $spreadsheet = $reader->load($file->getRealPath());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        // 跳过表头
        array_shift($rows);

        $success = 0;
        $failed = 0;
        $errors = [];
        $rowNumber = 2; // 从第2行开始（第1行是表头）

        foreach ($rows as $row) {
            // 跳过空行
            if (empty($row[0]) && empty($row[1]) && empty($row[2]) && empty($row[3])) {
                $rowNumber++;

                continue;
            }

            $data = [
                'name' => $row[0] ?? null,
                'grade' => $row[1] ?? null,
                'class' => $row[2] ?? null,
                'year' => $row[3] ?? null,
            ];

            $validator = Validator::make($data, [
                'name' => 'required|string|max:255',
                'grade' => 'required|integer|min:1|max:6',
                'class' => 'required|integer|min:1|max:20',
                'year' => 'required|integer|min:2020|max:2030',
            ], [
                'name.required' => '姓名不能为空',
                'grade.required' => '年级不能为空',
                'grade.min' => '年级必须在1-6之间',
                'grade.max' => '年级必须在1-6之间',
                'class.required' => '班级不能为空',
                'class.min' => '班级必须在1-20之间',
                'class.max' => '班级必须在1-20之间',
                'year.required' => '年份不能为空',
                'year.min' => '年份必须在2020-2030之间',
                'year.max' => '年份必须在2020-2030之间',
            ]);

            if ($validator->fails()) {
                $failed++;
                $errors[$rowNumber] = "第{$rowNumber}行: ".$validator->errors()->first();
                $rowNumber++;

                continue;
            }

            try {
                Student::create($validator->validated());
                $success++;
            } catch (\Exception $e) {
                $failed++;
                $errors[$rowNumber] = "第{$rowNumber}行: 导入失败 - ".$e->getMessage();
            }

            $rowNumber++;
        }

        return [
            'success' => $success,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    /**
     * 创建导入模板 Spreadsheet
     */
    private function createTemplateSpreadsheet(): \PhpOffice\PhpSpreadsheet\Spreadsheet
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // 设置表头
        $sheet->setCellValue('A1', '姓名');
        $sheet->setCellValue('B1', '年级(1-6)');
        $sheet->setCellValue('C1', '班级(1-20)');
        $sheet->setCellValue('D1', '年份(2020-2030)');

        // 设置列宽
        $sheet->getColumnDimension('A')->setWidth(20);
        $sheet->getColumnDimension('B')->setWidth(15);
        $sheet->getColumnDimension('C')->setWidth(15);
        $sheet->getColumnDimension('D')->setWidth(18);

        // 添加示例数据
        $sheet->setCellValue('A2', '张三');
        $sheet->setCellValue('B2', 3);
        $sheet->setCellValue('C2', 1);
        $sheet->setCellValue('D2', date('Y'));

        $sheet->setCellValue('A3', '李四');
        $sheet->setCellValue('B3', 3);
        $sheet->setCellValue('C3', 2);
        $sheet->setCellValue('D3', date('Y'));

        // 添加说明
        $sheet->setCellValue('A5', '说明：');
        $sheet->setCellValue('A6', '1. 年级：1=一年级, 2=二年级, ..., 6=六年级');
        $sheet->setCellValue('A7', '2. 班级：1-20之间的数字');
        $sheet->setCellValue('A8', '3. 年份：入学年份，如2024');
        $sheet->setCellValue('A9', '4. 请勿修改表头，从第2行开始填写数据');

        // 设置说明文字样式
        $sheet->getStyle('A5')->getFont()->setBold(true);

        return $spreadsheet;
    }

    /**
     * 生成导入模板文件（流式下载）
     */
    public function generateTemplateStream(string $filename = '学生导入模板.xlsx'): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $spreadsheet = $this->createTemplateSpreadsheet();

        return new \Symfony\Component\HttpFoundation\StreamedResponse(function () use ($spreadsheet): void {
            $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'max-age=0',
            'Pragma' => 'public',
        ]);
    }

    /**
     * 生成导入模板文件
     */
    public function generateTemplate(): string
    {
        $spreadsheet = $this->createTemplateSpreadsheet();

        $filePath = storage_path('app/templates/students_import_template.xlsx');
        $dir = dirname($filePath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($filePath);

        return $filePath;
    }
}

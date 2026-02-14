<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Student;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentExportService
{
    /**
     * 年级映射
     */
    private array $gradeMap = [
        1 => '一年级',
        2 => '二年级',
        3 => '三年级',
        4 => '四年级',
        5 => '五年级',
        6 => '六年级',
    ];

    /**
     * 创建电子表格
     *
     * @param  Collection<int, Student>  $students
     */
    private function createSpreadsheet(Collection $students): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        // 设置表头
        $headers = ['姓名', '年级', '班级', '年份', '作业数', '总分', '创建时间'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col.'1', $header);
            $col++;
        }

        // 设置表头样式
        $headerStyle = $sheet->getStyle('A1:G1');
        $headerStyle->getFont()->setBold(true);
        $headerStyle->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
        $headerStyle->getFill()->getStartColor()->setRGB('E0E0E0');
        $headerStyle->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

        // 填充数据
        $row = 2;
        foreach ($students as $student) {
            $submissions = $student->submissions;
            $totalSubmissions = $submissions->count();
            $totalScore = $submissions->sum('score') ?? 0;

            $sheet->setCellValue('A'.$row, $student->name);
            $sheet->setCellValue('B'.$row, $this->gradeMap[$student->grade] ?? '未知');
            $sheet->setCellValue('C'.$row, $student->class.'班');
            $sheet->setCellValue('D'.$row, $student->year);
            $sheet->setCellValue('E'.$row, $totalSubmissions);
            $sheet->setCellValue('F'.$row, $totalScore);
            $sheet->setCellValue('G'.$row, $student->created_at->format('Y-m-d H:i:s'));

            // 居中对齐
            $sheet->getStyle('B'.$row.':E'.$row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('G'.$row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

            $row++;
        }

        // 设置列宽
        $sheet->getColumnDimension('A')->setWidth(15);
        $sheet->getColumnDimension('B')->setWidth(12);
        $sheet->getColumnDimension('C')->setWidth(10);
        $sheet->getColumnDimension('D')->setWidth(10);
        $sheet->getColumnDimension('E')->setWidth(10);
        $sheet->getColumnDimension('F')->setWidth(10);
        $sheet->getColumnDimension('G')->setWidth(20);

        // 添加边框
        $lastRow = $row - 1;
        $borderStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['RGB' => '000000'],
                ],
            ],
        ];
        $sheet->getStyle('A1:G'.$lastRow)->applyFromArray($borderStyle);

        return $spreadsheet;
    }

    /**
     * 导出学生数据到 Excel（流式下载）
     *
     * @param  Collection<int, Student>  $students
     */
    public function exportStream(Collection $students, string $filename): StreamedResponse
    {
        $spreadsheet = $this->createSpreadsheet($students);

        return new StreamedResponse(function () use ($spreadsheet) {
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
     * 导出学生数据到 Excel（保存到文件）
     *
     * @param  Collection<int, Student>  $students
     */
    public function export(Collection $students): string
    {
        $spreadsheet = $this->createSpreadsheet($students);

        $filePath = storage_path('app/exports/students_export_'.date('Ymd_His').'.xlsx');
        $dir = dirname($filePath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($filePath);

        return $filePath;
    }
}

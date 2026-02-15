import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index as studentsIndex } from '@/routes/students';
import type { BreadcrumbItem } from '@/types';
import { TrendingUp, Users, Award, ArrowLeft, Download, BarChart3, Trophy } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '学生管理',
        href: studentsIndex().url,
    },
    {
        title: '班级成绩汇总',
        href: '',
    },
];

interface StudentReport {
    id: number;
    name: string;
    total_submissions: number;
    scored_submissions: number;
    total_score: number;
    average_score: number;
    rank: number;
}

interface ClassInfo {
    year: number;
    grade: number;
    class: number;
    total_students: number;
}

interface Statistics {
    total_submissions: number;
    total_scored: number;
    class_total_score: number;
    class_average_score: number;
}

interface ClassReportData {
    success: boolean;
    class_info: ClassInfo;
    statistics: Statistics;
    students: StudentReport[];
}

export default function ClassReport() {
    const [selectedYear, setSelectedYear] = useState<string>('2026');
    const [selectedGrade, setSelectedGrade] = useState<string>('1');
    const [selectedClass, setSelectedClass] = useState<string>('1');
    const [reportData, setReportData] = useState<ClassReportData | null>(null);
    const [loading, setLoading] = useState(false);

    const grades = [
        { value: '1', label: '一年级' },
        { value: '2', label: '二年级' },
        { value: '3', label: '三年级' },
        { value: '4', label: '四年级' },
        { value: '5', label: '五年级' },
        { value: '6', label: '六年级' },
    ];

    const classes = Array.from({ length: 20 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `${i + 1}班`,
    }));

    const years = ['2025', '2026', '2027', '2028'];

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/submissions/class-report', {
                params: {
                    year: selectedYear,
                    grade: selectedGrade,
                    class: selectedClass,
                },
            });
            setReportData(response.data);
        } catch (error) {
            console.error('获取班级报告失败:', error);
            alert('获取班级报告失败');
        } finally {
            setLoading(false);
        }
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
        return 'bg-gray-100 text-gray-700';
    };

    const handleExportExcel = () => {
        if (!reportData) return;
        
        const headers = ['排名', '姓名', '提交数', '已评分', '总分', '平均分'];
        const rows = reportData.students.map(s => [
            s.rank.toString(),
            s.name,
            s.total_submissions.toString(),
            s.scored_submissions.toString(),
            s.total_score.toString(),
            s.average_score.toString()
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedYear}年${grades.find(g => g.value === selectedGrade)?.label}${selectedClass}班_成绩汇总.csv`;
        link.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="班级成绩汇总" />

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 页面标题 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">班级成绩汇总</h1>
                                <p className="text-indigo-100">查看班级整体成绩统计和学生排名</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            onClick={() => router.visit('/students')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回学生列表
                        </Button>
                    </div>
                </div>

                {/* 筛选区域 */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="w-40">
                                <label className="block text-sm font-medium text-gray-700 mb-2">入学年份</label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="选择年份" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(year => (
                                            <SelectItem key={year} value={year}>{year}年</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-40">
                                <label className="block text-sm font-medium text-gray-700 mb-2">年级</label>
                                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="选择年级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {grades.map(grade => (
                                            <SelectItem key={grade.value} value={grade.value}>{grade.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-2">班级</label>
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="选择班级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(cls => (
                                            <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={fetchReport} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                                查询
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 报告内容 */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="ml-3 text-gray-600">加载中...</span>
                    </div>
                ) : reportData?.success ? (
                    <div className="space-y-6">
                        {/* 班级信息卡片 */}
                        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {reportData.class_info.year}年 {grades.find(g => g.value === selectedGrade)?.label} {selectedClass}班
                                        </h2>
                                        <p className="text-gray-600">
                                            共 {reportData.class_info.total_students} 名学生
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 统计卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-0 shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">学生人数</p>
                                            <p className="text-2xl font-bold text-gray-900">{reportData.class_info.total_students}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">班级平均分</p>
                                            <p className="text-2xl font-bold text-gray-900">{reportData.statistics.class_average_score}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <Award className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">班级总分</p>
                                            <p className="text-2xl font-bold text-gray-900">{reportData.statistics.class_total_score}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <BarChart3 className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">提交总数</p>
                                            <p className="text-2xl font-bold text-gray-900">{reportData.statistics.total_submissions}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 学生排名表 */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>学生成绩排名</CardTitle>
                                    <CardDescription>按总分降序排列</CardDescription>
                                </div>
                                <Button variant="outline" onClick={handleExportExcel}>
                                    <Download className="w-4 h-4 mr-2" />
                                    导出 Excel
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-20">排名</TableHead>
                                            <TableHead>姓名</TableHead>
                                            <TableHead>提交数</TableHead>
                                            <TableHead>已评分</TableHead>
                                            <TableHead>总分</TableHead>
                                            <TableHead>平均分</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.students.map((student) => (
                                            <TableRow key={student.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <Badge className={`${getRankColor(student.rank)} px-3 py-1`}>
                                                        第 {student.rank} 名
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>{student.total_submissions}</TableCell>
                                                <TableCell>{student.scored_submissions}</TableCell>
                                                <TableCell className="font-semibold text-indigo-600">{student.total_score}</TableCell>
                                                <TableCell>{student.average_score}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">请选择班级并点击查询查看成绩汇总</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index as studentsIndex } from '@/routes/students';
import type { BreadcrumbItem } from '@/types';
import { TrendingUp, Award, BookOpen, Calendar, BarChart3, Download, ArrowLeft, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '学生管理',
        href: studentsIndex().url,
    },
    {
        title: '成绩报告',
        href: '',
    },
];

interface Student {
    id: number;
    name: string;
    grade: number;
    grade_text: string;
    class: number;
    year: number;
}

interface Submission {
    id: number;
    assignment_name: string;
    lesson_name: string;
    file_name: string;
    score: number | null;
    created_at: string;
}

interface Statistics {
    total_submissions: number;
    scored_submissions: number;
    total_score: number;
    average_score: number;
    completion_rate: number;
    total_assignments: number;
}

interface GradeDistribution {
    G: number;
    A: number;
    B: number;
    C: number;
    O: number;
}

interface ReportData {
    student: Student;
    statistics: Statistics;
    grade_distribution: GradeDistribution;
    submissions: Submission[];
}

export default function StudentReport() {
    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);

    // 获取年份列表
    useEffect(() => {
        axios.get('/api/submissions/students-by-year')
            .then(response => {
                const yearList = response.data.years || [];
                setYears(yearList);
                if (yearList.length > 0 && !selectedYear) {
                    setSelectedYear(yearList[0]);
                }
            })
            .catch(error => {
                console.error('获取年份失败:', error);
            });
    }, []);

    // 获取学生列表
    useEffect(() => {
        if (!selectedYear) return;
        
        axios.get('/api/submissions/students-by-year', {
            params: { year: selectedYear }
        })
            .then(response => {
                setStudents(response.data.students || []);
            })
            .catch(error => {
                console.error('获取学生列表失败:', error);
            });
    }, [selectedYear]);

    // 获取成绩报告
    const fetchReport = async (studentId: string) => {
        if (!studentId) return;
        
        setLoading(true);
        try {
            const response = await axios.get(`/api/submissions/student-report/${studentId}`);
            setReportData(response.data);
        } catch (error) {
            console.error('获取成绩报告失败:', error);
            alert('获取成绩报告失败');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentChange = (studentId: string) => {
        setSelectedStudentId(studentId);
        fetchReport(studentId);
    };

    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            G: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
            A: 'bg-gradient-to-r from-blue-500 to-blue-600',
            B: 'bg-gradient-to-r from-amber-500 to-amber-600',
            C: 'bg-gradient-to-r from-orange-500 to-orange-600',
            O: 'bg-gradient-to-r from-red-500 to-red-600',
        };
        return colors[grade] || 'bg-gray-500';
    };

    const handleExportExcel = () => {
        if (!reportData) return;
        
        // 生成 CSV 数据
        const headers = ['作业名称', '课时', '文件名', '分数', '提交时间'];
        const rows = reportData.submissions.map(s => [
            s.assignment_name,
            s.lesson_name,
            s.file_name,
            s.score !== null ? s.score.toString() : '未评分',
            s.created_at
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${reportData.student.name}_成绩报告.csv`;
        link.click();
    };

    const handleExportPdf = () => {
        if (!selectedStudentId) return;
        
        // 在新窗口打开 PDF
        window.open(`/students/${selectedStudentId}/report-pdf`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="学生成绩报告" />

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 页面标题 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <BarChart3 className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">学生成绩报告</h1>
                                <p className="text-indigo-100">查看学生个人成绩统计和作业完成情况</p>
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
                            <div className="w-48">
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
                            <div className="w-64">
                                <label className="block text-sm font-medium text-gray-700 mb-2">学生</label>
                                <Select value={selectedStudentId} onValueChange={handleStudentChange}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="选择学生" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map(student => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                {student.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 报告内容 */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="ml-3 text-gray-600">加载中...</span>
                    </div>
                ) : reportData ? (
                    <div className="space-y-6">
                        {/* 学生信息卡片 */}
                        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{reportData.student.name}</h2>
                                        <p className="text-gray-600">
                                            {reportData.student.grade_text} · {reportData.student.class}班 · {reportData.student.year}年入学
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
                                            <BookOpen className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">作业完成率</p>
                                            <p className="text-2xl font-bold text-gray-900">{reportData.statistics.completion_rate}%</p>
                                            <p className="text-xs text-gray-500">
                                                {reportData.statistics.total_submissions} / {reportData.statistics.total_assignments}
                                            </p>
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
                                            <p className="text-sm text-gray-600">平均分</p>
                                            <p className="text-2xl font-bold text-gray-900">{reportData.statistics.average_score}</p>
                                            <p className="text-xs text-gray-500">
                                                已评分 {reportData.statistics.scored_submissions} 份
                                            </p>
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
                                            <p className="text-sm text-gray-600">总分</p>
                                            <p className="text-2xl font-bold text-gray-900">{reportData.statistics.total_score}</p>
                                            <p className="text-xs text-gray-500">累计得分</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">提交总数</p>
                                            <p className="text-2xl font-bold text-gray-900">{reportData.statistics.total_submissions}</p>
                                            <p className="text-xs text-gray-500">份作业</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 成绩分布 */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>成绩分布</CardTitle>
                                <CardDescription>各等级作品数量统计</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(reportData.grade_distribution).map(([grade, count]) => (
                                        <div key={grade} className="flex items-center gap-2">
                                            <Badge className={`${getGradeColor(grade)} text-white px-3 py-1`}>
                                                {grade} 级
                                            </Badge>
                                            <span className="text-lg font-semibold">{count}</span>
                                            <span className="text-gray-500 text-sm">份</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 作业列表 */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>作业提交记录</CardTitle>
                                    <CardDescription>详细提交和评分记录</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleExportExcel}>
                                        <Download className="w-4 h-4 mr-2" />
                                        导出 Excel
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={handleExportPdf}
                                        className="border-red-200 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        导出 PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead>作业名称</TableHead>
                                            <TableHead>课时</TableHead>
                                            <TableHead>文件名</TableHead>
                                            <TableHead>分数</TableHead>
                                            <TableHead>提交时间</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.submissions.map((submission) => (
                                            <TableRow key={submission.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{submission.assignment_name}</TableCell>
                                                <TableCell>{submission.lesson_name}</TableCell>
                                                <TableCell className="text-gray-600">{submission.file_name}</TableCell>
                                                <TableCell>
                                                    {submission.score !== null ? (
                                                        <Badge className="bg-blue-500">{submission.score} 分</Badge>
                                                    ) : (
                                                        <span className="text-gray-400">未评分</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-gray-500 text-sm">{submission.created_at}</TableCell>
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
                            <p className="text-gray-500">请选择学生查看成绩报告</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
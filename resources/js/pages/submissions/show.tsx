import { Head, router, usePage } from '@inertiajs/react';
import { Eye, Calendar, BookOpen, FileText, Trash2, Download, Sparkles, Award } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { StlModelViewer } from '@/components/stl-model-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { VoxModelViewer, type VoxModelViewerRef } from '@/components/vox-model-viewer';
import AppLayout from '@/layouts/app-layout';
import axios from '@/lib/axios';
import { index as submissionsIndex } from '@/routes/submissions';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '作品提交',
        href: submissionsIndex().url,
    },
    {
        title: '查看作品',
        href: '',
    },
];

type PageProps = {
    years: string[];
};

interface Student {
    id: number;
    name: string;
    year: string;
}

interface Lesson {
    id: number;
    name: string;
    year: string;
}

interface Assignment {
    id: number;
    name: string;
}

interface Submission {
    id: number;
    student_id: number;
    assignment_id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    preview_image_path: string | null;
    status: string;
    score: number | null;
    created_at: string;
    student: Student;
    assignment: Assignment;
}

export default function SubmissionShow() {
    const { years } = usePage<PageProps>().props;

    // 筛选状态 - 默认选择最新年份
    const [selectedYear, setSelectedYear] = useState(years[0] || '');
    const [selectedLesson, setSelectedLesson] = useState<string>('');
    const [selectedAssignment, setSelectedAssignment] = useState<string>('all');

    // 数据状态
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);

    // 批量评分状态
    const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
    const [batchGradingMode, setBatchGradingMode] = useState(false);
    const [batchGradeDialogOpen, setBatchGradeDialogOpen] = useState(false);

    // 预览图模态框状态
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');

    // 3D模型预览模态框状态
    const [modelPreviewOpen, setModelPreviewOpen] = useState(false);
    const [modelPreviewData, setModelPreviewData] = useState<{
        fileUrl: string;
        fileName: string;
        submission: Submission | null;
    } | null>(null);

    // VOX模型预览模态框状态
    const [voxPreviewOpen, setVoxPreviewOpen] = useState(false);
    const [voxPreviewData, setVoxPreviewData] = useState<{
        fileUrl: string;
        fileName: string;
        submission: Submission | null;
    } | null>(null);
    const voxViewerRef = useRef<VoxModelViewerRef>(null);
    const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);

    // 图片预览模态框状态
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [imagePreviewData, setImagePreviewData] = useState<{
        fileUrl: string;
        fileName: string;
        submission: Submission | null;
    } | null>(null);

    // 删除确认模态框状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState<Submission | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // 格式化日期
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('zh-CN');
    };

    // 初始化加载最新年份的课时
    useEffect(() => {
        if (selectedYear) {
            loadLessonsByYear(selectedYear);
        }
    }, []);

    // 加载指定年份的课时和提交记录
    const loadLessonsByYear = async (year: string) => {
        setLoading(true);
        try {
            // 加载课时
            const lessonsRes = await axios.get('/api/submissions/lessons-by-year', { params: { year } });
            const lessonsData = lessonsRes.data;
            setLessons(lessonsData);

            // 如果有课时，自动选择第一个课时
            if (lessonsData.length > 0) {
                setSelectedLesson(lessonsData[0].id.toString());

                // 加载第一个课时的所有提交记录和作业列表
                const submissionsRes = await axios.get('/api/submissions/all');
                const filteredSubmissions = submissionsRes.data.data.filter((s: Submission) =>
                    s.assignment.lesson_id === lessonsData[0].id
                );
                setSubmissions(filteredSubmissions);

                const assignmentsRes = await axios.get('/api/submissions/assignments-by-lesson', {
                    params: { lesson_id: lessonsData[0].id },
                });
                setAssignments(assignmentsRes.data);
            }
        } catch (error) {
            console.error('加载课时失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 年份改变时加载课时并自动选择第一个课时
    const handleYearChange = async (year: string) => {
        setSelectedYear(year);
        setSelectedLesson('');
        setSelectedAssignment('all');
        setLessons([]);
        setAssignments([]);
        setSubmissions([]);

        setLoading(true);
        try {
            // 加载课时
            const lessonsRes = await axios.get('/api/submissions/lessons-by-year', { params: { year } });
            const lessonsData = lessonsRes.data;
            setLessons(lessonsData);

            // 如果有课时，自动选择第一个课时
            if (lessonsData.length > 0) {
                setSelectedLesson(lessonsData[0].id.toString());

                // 加载第一个课时的所有提交记录和作业列表
                const submissionsRes = await axios.get('/api/submissions/all');
                const filteredSubmissions = submissionsRes.data.data.filter((s: Submission) =>
                    s.assignment.lesson_id === lessonsData[0].id
                );
                setSubmissions(filteredSubmissions);

                const assignmentsRes = await axios.get('/api/submissions/assignments-by-lesson', {
                    params: { lesson_id: lessonsData[0].id },
                });
                setAssignments(assignmentsRes.data);
            }
        } catch (error) {
            console.error('加载课时失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 课时改变时加载作业和提交记录
    const handleLessonChange = async (lessonId: string) => {
        setSelectedLesson(lessonId);
        setSelectedAssignment('all');
        setAssignments([]);

        setLoading(true);
        try {
            const submissionsRes = await axios.get('/api/submissions/all');

            // 加载该课时的提交记录和作业列表
            const filteredSubmissions = submissionsRes.data.data.filter((s: Submission) =>
                s.assignment.lesson_id === parseInt(lessonId)
            );
            setSubmissions(filteredSubmissions);

            const assignmentsRes = await axios.get('/api/submissions/assignments-by-lesson', {
                params: { lesson_id: lessonId },
            });
            setAssignments(assignmentsRes.data);
        } catch (error) {
            console.error('加载数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 作业改变时加载提交记录
    const handleAssignmentChange = async (assignmentId: string) => {
        setSelectedAssignment(assignmentId);

        // 如果选择"所有作业"（assignmentId 为 'all'），加载该课时的所有提交记录
        if (assignmentId === 'all') {
            setLoading(true);
            try {
                const submissionsRes = await axios.get('/api/submissions/all');
                // 过滤出该课时的提交
                const filteredSubmissions = submissionsRes.data.data.filter((s: Submission) =>
                    s.assignment.lesson_id === parseInt(selectedLesson)
                );
                setSubmissions(filteredSubmissions);
            } catch (error) {
                console.error('加载提交记录失败:', error);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            const submissionsRes = await axios.get('/api/submissions/submissions-by-assignment', {
                params: { assignment_id: assignmentId },
            });
            setSubmissions(submissionsRes.data);
        } catch (error) {
            console.error('加载提交记录失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 查看预览图
    const handleViewPreview = (previewImagePath: string) => {
        setPreviewImageUrl(`/storage/${previewImagePath}`);
        setPreviewOpen(true);
    };

    // 下载文件
    const handleDownload = (filePath: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = `/storage/${filePath}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 查看3D模型
    const handleViewModel = (filePath: string, fileName: string, submission: Submission) => {
        setModelPreviewData({
            fileUrl: `/storage/${filePath}`,
            fileName,
            submission,
        });
        setModelPreviewOpen(true);
    };

    // 查看VOX模型
    const handleViewVox = (filePath: string, fileName: string, submission: Submission) => {
        setVoxPreviewData({
            fileUrl: `/storage/${filePath}`,
            fileName,
            submission,
        });
        setVoxPreviewOpen(true);
    };

    // 捕获VOX模型截图并上传
    const handleCaptureVoxScreenshot = async () => {
        if (!voxViewerRef.current || !voxPreviewData?.submission) return;

        try {
            setIsCapturingScreenshot(true);
            const screenshot = await voxViewerRef.current.captureScreenshot();

            if (!screenshot) {
                throw new Error('截图失败');
            }

            // 上传到服务器
            const response = await axios.post(`/api/submissions/${voxPreviewData.submission.id}/preview`, {
                preview_image: screenshot,
            });

            if (response.data.success) {
                // 更新本地状态
                setVoxPreviewData(prev => prev ? {
                    ...prev,
                    submission: prev.submission ? {
                        ...prev.submission,
                        preview_image_path: response.data.preview_image_path,
                    } : null,
                } : null);
                router.reload({ only: ['submissions'] });
                alert('预览图生成成功！');
            }
        } catch (error) {
            console.error('截图上传失败:', error);
            alert('截图上传失败，请重试');
        } finally {
            setIsCapturingScreenshot(false);
        }
    };

    // 查看图片
    const handleViewImage = (filePath: string, fileName: string, submission: Submission) => {
        setImagePreviewData({
            fileUrl: `/storage/${filePath}`,
            fileName,
            submission,
        });
        setImagePreviewOpen(true);
    };

    // 获取状态徽章样式
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">待审核</Badge>;
            case 'approved':
                return <Badge variant="default" className="bg-green-600">已通过</Badge>;
            case 'rejected':
                return <Badge variant="destructive">已拒绝</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // 打开删除确认对话框
    const handleDeleteClick = (submission: Submission) => {
        setSubmissionToDelete(submission);
        setDeleteDialogOpen(true);
    };

    // 确认删除
    const handleDeleteConfirm = async () => {
        if (!submissionToDelete) return;

        setIsDeleting(true);
        try {
            await axios.delete(`/api/submissions/${submissionToDelete.id}`);

            // 从列表中移除已删除的记录
            setSubmissions((prev) => prev.filter((s) => s.id !== submissionToDelete.id));

            // 关闭对话框
            setDeleteDialogOpen(false);
            setSubmissionToDelete(null);
        } catch (error) {
            console.error('删除失败:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // 取消删除
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setSubmissionToDelete(null);
    };

    // 打分处理
    const handleScore = async (grade: 'G' | 'A' | 'B' | 'C' | 'O', submissionId: number, studentName: string, score: number) => {
        try {
            setLoading(true);
            await axios.post('/api/submissions/score', {
                submission_id: submissionId,
                grade,
            });
            // 更新本地状态
            const updatedSubmissions = submissions.map((s) =>
                s.id === submissionId ? { ...s, score } : s
            );
            setSubmissions(updatedSubmissions);
            // 更新模态框中的数据
            if (voxPreviewData?.submission?.id === submissionId) {
                setVoxPreviewData({
                    ...voxPreviewData,
                    submission: {
                        ...voxPreviewData.submission,
                        score,
                    },
                });
            }
        } catch (error) {
            console.error('打分失败:', error);
            alert(`打分失败: ${studentName}`);
        } finally {
            setLoading(false);
        }
    };

    // 批量评分处理
    const handleBatchScore = async (grade: 'G' | 'A' | 'B' | 'C' | 'O') => {
        if (selectedSubmissions.length === 0) {
            alert('请先选择要评分的作品');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/submissions/batch-score', {
                submission_ids: selectedSubmissions,
                grade,
            });

            // 更新本地状态
            const gradeScores: Record<string, number> = { G: 12, A: 10, B: 8, C: 6, O: 0 };
            const score = gradeScores[grade];
            const updatedSubmissions = submissions.map((s) =>
                selectedSubmissions.includes(s.id) ? { ...s, score } : s
            );
            setSubmissions(updatedSubmissions);
            setSelectedSubmissions([]);
            setBatchGradingMode(false);
            setBatchGradeDialogOpen(false);

            alert(`批量评分成功：${response.data.message}`);
        } catch (error) {
            console.error('批量评分失败:', error);
            alert('批量评分失败');
        } finally {
            setLoading(false);
        }
    };

    // 切换作品选择
    const toggleSubmissionSelection = (id: number) => {
        setSelectedSubmissions(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    // 全选/取消全选
    const toggleSelectAll = () => {
        if (selectedSubmissions.length === submissions.length) {
            setSelectedSubmissions([]);
        } else {
            setSelectedSubmissions(submissions.map(s => s.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="查看作品" />

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 页面标题区域 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Eye className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">查看作品</h1>
                            <p className="text-indigo-100">浏览、评分和管理学生提交的作品</p>
                        </div>
                    </div>
                </div>

                {/* 筛选区域 */}
                <Card className="border-0 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100 py-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <CardTitle className="text-lg">筛选条件</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 年份筛选 */}
                            <div className="space-y-2">
                                <Label htmlFor="year" className="flex items-center gap-2 text-base font-medium">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    年份
                                </Label>
                                <Select onValueChange={handleYearChange} value={selectedYear} disabled={loading}>
                                    <SelectTrigger className="rounded-xl h-12">
                                        <SelectValue placeholder="请选择年份" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}年
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 课时筛选 */}
                            <div className="space-y-2">
                                <Label htmlFor="lesson" className="flex items-center gap-2 text-base font-medium">
                                    <BookOpen className="w-4 h-4 text-green-500" />
                                    课时
                                </Label>
                                {loading && lessons.length === 0 && selectedYear ? (
                                    <div className="flex items-center gap-2 text-gray-400 h-12">
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        加载中...
                                    </div>
                                ) : (
                                    <Select onValueChange={handleLessonChange} value={selectedLesson} disabled={loading || !selectedYear || lessons.length === 0}>
                                        <SelectTrigger className="rounded-xl h-12">
                                            <SelectValue placeholder={!selectedYear ? "请先选择年份" : "请选择课时"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {lessons.map((lesson) => (
                                                <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                                    {lesson.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* 作业筛选 */}
                            <div className="space-y-2">
                                <Label htmlFor="assignment" className="flex items-center gap-2 text-base font-medium">
                                    <FileText className="w-4 h-4 text-purple-500" />
                                    作业
                                </Label>
                                {loading && assignments.length === 0 && selectedLesson ? (
                                    <div className="flex items-center gap-2 text-gray-400 h-12">
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        加载中...
                                    </div>
                                ) : (
                                    <Select onValueChange={handleAssignmentChange} value={selectedAssignment} disabled={loading || !selectedLesson}>
                                        <SelectTrigger className="rounded-xl h-12">
                                            <SelectValue placeholder={!selectedLesson ? "请先选择课时" : "所有作业"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedLesson && <SelectItem value="all">所有作业</SelectItem>}
                                            {assignments.map((assignment) => (
                                                <SelectItem key={assignment.id} value={assignment.id.toString()}>
                                                    {assignment.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 提交记录列表 */}
                {selectedYear && selectedLesson && (
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>提交记录</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            共 {submissions.length} 条记录
                                            {selectedSubmissions.length > 0 && (
                                                <span className="ml-2 text-indigo-600 font-medium">
                                                    (已选择 {selectedSubmissions.length} 个)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!batchGradingMode ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setBatchGradingMode(true)}
                                            className="rounded-lg border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
                                        >
                                            批量评分
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleSelectAll}
                                                className="rounded-lg"
                                            >
                                                {selectedSubmissions.length === submissions.length ? '取消全选' : '全选'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setBatchGradeDialogOpen(true)}
                                                disabled={selectedSubmissions.length === 0}
                                                className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 border-0 disabled:opacity-50"
                                            >
                                                批量评分 ({selectedSubmissions.length})
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setBatchGradingMode(false);
                                                    setSelectedSubmissions([]);
                                                }}
                                                className="rounded-lg"
                                            >
                                                取消
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 text-gray-400 py-12">
                                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    加载中...
                                </div>
                            ) : submissions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 hover:from-blue-50/50 hover:to-indigo-50/50">
                                                {batchGradingMode && (
                                                    <TableHead className="w-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                                                            onChange={toggleSelectAll}
                                                            className="rounded border-gray-300"
                                                        />
                                                    </TableHead>
                                                )}
                                                <TableHead className="font-semibold text-gray-700">学生姓名</TableHead>
                                                <TableHead className="font-semibold text-gray-700">文件名</TableHead>
                                                <TableHead className="font-semibold text-gray-700">文件大小</TableHead>
                                                <TableHead className="font-semibold text-gray-700">提交时间</TableHead>
                                                <TableHead className="font-semibold text-gray-700">状态</TableHead>
                                                <TableHead className="font-semibold text-gray-700">分数</TableHead>
                                                <TableHead className="font-semibold text-gray-700 text-right">操作</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions.map((submission) => (
                                                <TableRow key={submission.id} className="hover:bg-blue-50/30 transition-colors">
                                                    {batchGradingMode && (
                                                        <TableCell>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedSubmissions.includes(submission.id)}
                                                                onChange={() => toggleSubmissionSelection(submission.id)}
                                                                className="rounded border-gray-300"
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="font-medium">{submission.student.name}</TableCell>
                                                    <TableCell className="text-gray-600">{submission.file_name}</TableCell>
                                                    <TableCell className="text-gray-500">{formatFileSize(submission.file_size)}</TableCell>
                                                    <TableCell className="text-gray-500 text-sm">{formatDate(submission.created_at)}</TableCell>
                                                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                                    <TableCell>
                                                        {submission.score !== null ? (
                                                            <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-blue-600">
                                                                {submission.score} 分
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">未评分</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {submission.preview_image_path && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                                                    onClick={() => handleViewPreview(submission.preview_image_path!)}
                                                                >
                                                                    预览图
                                                                </Button>
                                                            )}
                                                            {/* STL/OBJ 文件显示查看按钮 */}
                                                            {['stl', 'obj'].includes(submission.file_name.split('.').pop()?.toLowerCase() || '') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                                                                    onClick={() => handleViewModel(submission.file_path, submission.file_name, submission)}
                                                                >
                                                                    查看
                                                                </Button>
                                                            )}
                                                            {/* VOX 文件显示查看按钮 */}
                                                            {submission.file_name.toLowerCase().endsWith('.vox') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                                                                    onClick={() => handleViewVox(submission.file_path, submission.file_name, submission)}
                                                                >
                                                                    查看
                                                                </Button>
                                                            )}
                                                            {/* 图片文件显示查看按钮 */}
                                                            {['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(submission.file_name.split('.').pop()?.toLowerCase() || '') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                                                                    onClick={() => handleViewImage(submission.file_path, submission.file_name, submission)}
                                                                >
                                                                    查看
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                                                                onClick={() => handleDownload(submission.file_path, submission.file_name)}
                                                            >
                                                                <Download className="w-4 h-4 mr-1" />
                                                                下载
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                                                onClick={() => handleDeleteClick(submission)}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-1" />
                                                                删除
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">暂无提交记录</p>
                                    <p className="text-gray-400 text-sm mt-1">请调整筛选条件查看其他作品</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* 预览模态框 */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>预览图</DialogTitle>
                        <DialogDescription>
                            <img
                                src={previewImageUrl}
                                alt="预览图"
                                className="max-w-full rounded-lg border"
                            />
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* 3D模型预览模态框 */}
            <Dialog open={modelPreviewOpen} onOpenChange={setModelPreviewOpen}>
                <DialogContent className="w-fit !max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>3D模型预览 - {modelPreviewData?.fileName}</DialogTitle>
                        <DialogDescription className="sr-only">
                            使用鼠标左键旋转，右键平移，滚轮缩放
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
                        {modelPreviewData && (
                            <>
                                {/* 左侧：3D 预览窗口 (4:3 比例，缩小 1/3) */}
                                <div className="flex-[2/3] min-h-[400px] lg:min-h-[500px] aspect-[4/3]">
                                    <StlModelViewer
                                        fileUrl={modelPreviewData.fileUrl}
                                        fileName={modelPreviewData.fileName}
                                        onError={(error) => {
                                            console.error('3D模型加载失败:', error);
                                        }}
                                    />
                                </div>

                                {/* 右侧：打分组件 */}
                                <div className="w-full lg:w-80 flex-shrink-0 border-l lg:pl-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">学生信息</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {modelPreviewData.submission?.student.name}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">当前分数</Label>
                                        <div className="text-3xl font-bold">
                                            {modelPreviewData.submission?.score !== null && modelPreviewData.submission ? (
                                                <span className="text-blue-600">{modelPreviewData.submission.score} 分</span>
                                            ) : (
                                                <span className="text-muted-foreground">未评分</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">选择分数</Label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[
                                                { grade: 'G', score: 12, label: 'G (12分)' },
                                                { grade: 'A', score: 10, label: 'A (10分)' },
                                                { grade: 'B', score: 8, label: 'B (8分)' },
                                                { grade: 'C', score: 6, label: 'C (6分)' },
                                                { grade: 'O', score: 0, label: 'O (0分)' },
                                            ].map(({ grade, score, label }) => (
                                                <Button
                                                    key={grade}
                                                    variant={modelPreviewData.submission && modelPreviewData.submission.score === score ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={async () => {
                                                        if (!modelPreviewData.submission) return;
                                                        try {
                                                            await axios.post('/api/submissions/score', {
                                                                submission_id: modelPreviewData.submission.id,
                                                                grade,
                                                            });
                                                            // 更新本地状态
                                                            const updatedSubmissions = submissions.map((s) =>
                                                                s.id === modelPreviewData.submission!.id
                                                                    ? { ...s, score }
                                                                    : s
                                                            );
                                                            setSubmissions(updatedSubmissions);
                                                            // 更新模态框中的数据
                                                            setModelPreviewData({
                                                                ...modelPreviewData,
                                                                submission: {
                                                                    ...modelPreviewData.submission,
                                                                    score,
                                                                },
                                                            });
                                                        } catch (error) {
                                                            console.error('打分失败:', error);
                                                        }
                                                    }}
                                                    disabled={loading}
                                                    title={label}
                                                >
                                                    {grade}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            if (!modelPreviewData.submission) return;
                                            try {
                                                await axios.post('/api/submissions/cancel-score', {
                                                    submission_id: modelPreviewData.submission.id,
                                                });
                                                // 更新本地状态
                                                const updatedSubmissions = submissions.map((s) =>
                                                    s.id === modelPreviewData.submission!.id
                                                        ? { ...s, score: null }
                                                        : s
                                                );
                                                setSubmissions(updatedSubmissions);
                                                // 更新模态框中的数据
                                                setModelPreviewData({
                                                    ...modelPreviewData,
                                                    submission: {
                                                        ...modelPreviewData.submission,
                                                        score: null,
                                                    },
                                                });
                                            } catch (error) {
                                                console.error('取消打分失败:', error);
                                            }
                                        }}
                                        disabled={loading || modelPreviewData.submission?.score === null}
                                    >
                                        取消打分
                                    </Button>

                                    {/* 上一个/下一个按钮 */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (!modelPreviewData.submission) return;
                                                const currentIndex = submissions.findIndex(s => s.id === modelPreviewData.submission!.id);
                                                if (currentIndex > 0) {
                                                    const prevSubmission = submissions[currentIndex - 1];
                                                    setModelPreviewData({
                                                        fileUrl: `/storage/${prevSubmission.file_path}`,
                                                        fileName: prevSubmission.file_name,
                                                        submission: prevSubmission,
                                                    });
                                                }
                                            }}
                                            disabled={loading || !modelPreviewData.submission || submissions.findIndex(s => s.id === modelPreviewData.submission.id) === 0}
                                        >
                                            上一个
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (!modelPreviewData.submission) return;
                                                const currentIndex = submissions.findIndex(s => s.id === modelPreviewData.submission!.id);
                                                if (currentIndex < submissions.length - 1) {
                                                    const nextSubmission = submissions[currentIndex + 1];
                                                    setModelPreviewData({
                                                        fileUrl: `/storage/${nextSubmission.file_path}`,
                                                        fileName: nextSubmission.file_name,
                                                        submission: nextSubmission,
                                                    });
                                                }
                                            }}
                                            disabled={loading || !modelPreviewData.submission || submissions.findIndex(s => s.id === modelPreviewData.submission.id) === submissions.length - 1}
                                        >
                                            下一个
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 图片预览模态框 */}
            <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
                <DialogContent className="w-fit !max-w-[95vw] !max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>图片预览 - {imagePreviewData?.fileName}</DialogTitle>
                        <DialogDescription className="sr-only">
                            点击图片查看大图
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {imagePreviewData && (
                            <>
                                {/* 左侧：图片预览窗口 */}
                                <div className="flex-[2/3] min-h-[500px] flex items-center justify-center bg-black rounded-lg overflow-hidden">
                                    <img
                                        src={imagePreviewData.fileUrl}
                                        alt={imagePreviewData.fileName}
                                        className="w-full h-full max-h-[70vh] object-contain"
                                    />
                                </div>
                                {/* 右侧：打分面板 */}
                                <div className="w-full lg:w-80 flex-shrink-0 border-l lg:pl-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">学生信息</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {imagePreviewData.submission?.student.name}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">当前分数</Label>
                                        <div className="text-3xl font-bold">
                                            {imagePreviewData.submission?.score !== null && imagePreviewData.submission ? (
                                                <span className="text-blue-600">{imagePreviewData.submission.score} 分</span>
                                            ) : (
                                                <span className="text-muted-foreground">未评分</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">选择分数</Label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[
                                                { grade: 'G', score: 12, label: 'G (12分)' },
                                                { grade: 'A', score: 10, label: 'A (10分)' },
                                                { grade: 'B', score: 8, label: 'B (8分)' },
                                                { grade: 'C', score: 6, label: 'C (6分)' },
                                                { grade: 'O', score: 0, label: 'O (0分)' },
                                            ].map(({ grade, score, label }) => (
                                                <Button
                                                    key={grade}
                                                    variant={imagePreviewData.submission && imagePreviewData.submission.score === score ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={async () => {
                                                        if (!imagePreviewData.submission) return;
                                                        try {
                                                            await axios.post('/api/submissions/score', {
                                                                submission_id: imagePreviewData.submission.id,
                                                                grade,
                                                            });
                                                            // 更新本地状态
                                                            const updatedSubmissions = submissions.map((s) =>
                                                                s.id === imagePreviewData.submission!.id
                                                                    ? { ...s, score }
                                                                    : s
                                                            );
                                                            setSubmissions(updatedSubmissions);
                                                            // 更新模态框中的数据
                                                            setImagePreviewData({
                                                                ...imagePreviewData,
                                                                submission: {
                                                                    ...imagePreviewData.submission,
                                                                    score,
                                                                },
                                                            });
                                                        } catch (error) {
                                                            console.error('打分失败:', error);
                                                        }
                                                    }}
                                                    disabled={loading}
                                                    title={label}
                                                >
                                                    {grade}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            if (!imagePreviewData.submission) return;
                                            try {
                                                await axios.post('/api/submissions/cancel-score', {
                                                    submission_id: imagePreviewData.submission.id,
                                                });
                                                // 更新本地状态
                                                const updatedSubmissions = submissions.map((s) =>
                                                    s.id === imagePreviewData.submission!.id
                                                        ? { ...s, score: null }
                                                        : s
                                                );
                                                setSubmissions(updatedSubmissions);
                                                // 更新模态框中的数据
                                                setImagePreviewData({
                                                    ...imagePreviewData,
                                                    submission: {
                                                        ...imagePreviewData.submission,
                                                        score: null,
                                                    },
                                                });
                                            } catch (error) {
                                                console.error('取消打分失败:', error);
                                            }
                                        }}
                                        disabled={loading || imagePreviewData.submission?.score === null}
                                    >
                                        取消打分
                                    </Button>

                                    {/* 上一个/下一个按钮 */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (!imagePreviewData.submission) return;
                                                const currentIndex = submissions.findIndex(s => s.id === imagePreviewData.submission!.id);
                                                if (currentIndex > 0) {
                                                    const prevSubmission = submissions[currentIndex - 1];
                                                    setImagePreviewData({
                                                        fileUrl: `/storage/${prevSubmission.file_path}`,
                                                        fileName: prevSubmission.file_name,
                                                        submission: prevSubmission,
                                                    });
                                                }
                                            }}
                                            disabled={loading || !imagePreviewData.submission || submissions.findIndex(s => s.id === imagePreviewData.submission.id) === 0}
                                        >
                                            上一个
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (!imagePreviewData.submission) return;
                                                const currentIndex = submissions.findIndex(s => s.id === imagePreviewData.submission!.id);
                                                if (currentIndex < submissions.length - 1) {
                                                    const nextSubmission = submissions[currentIndex + 1];
                                                    setImagePreviewData({
                                                        fileUrl: `/storage/${nextSubmission.file_path}`,
                                                        fileName: nextSubmission.file_name,
                                                        submission: nextSubmission,
                                                    });
                                                }
                                            }}
                                            disabled={loading || !imagePreviewData.submission || submissions.findIndex(s => s.id === imagePreviewData.submission.id) === submissions.length - 1}
                                        >
                                            下一个
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* VOX模型预览模态框 */}
            <Dialog open={voxPreviewOpen} onOpenChange={setVoxPreviewOpen}>
                <DialogContent className="w-fit !max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>VOX模型预览 - {voxPreviewData?.fileName}</DialogTitle>
                        <DialogDescription className="sr-only">
                            使用鼠标左键旋转，右键平移，滚轮缩放
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
                        {voxPreviewData && (
                            <>
                                {/* 左侧：VOX 预览窗口 */}
                                <div className="flex-[2/3] min-h-[400px] lg:min-h-[500px] aspect-[4/3]">
                                    <VoxModelViewer
                                        ref={voxViewerRef}
                                        fileUrl={voxPreviewData.fileUrl}
                                        fileName={voxPreviewData.fileName}
                                        onError={(error) => {
                                            console.error('VOX模型加载失败:', error);
                                        }}
                                    />
                                </div>

                                {/* 右侧：打分组件 */}
                                <div className="w-full lg:w-80 flex-shrink-0 border-l lg:pl-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">学生信息</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {voxPreviewData.submission?.student.name}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">当前分数</Label>
                                        <div className="text-3xl font-bold">
                                            {voxPreviewData.submission?.score !== null && voxPreviewData.submission ? (
                                                <span className="text-blue-600">{voxPreviewData.submission.score} 分</span>
                                            ) : (
                                                <span className="text-muted-foreground">未评分</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">选择分数</Label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[
                                                { grade: 'G', score: 12, label: 'G (12分)' },
                                                { grade: 'A', score: 10, label: 'A (10分)' },
                                                { grade: 'B', score: 8, label: 'B (8分)' },
                                                { grade: 'C', score: 6, label: 'C (6分)' },
                                                { grade: 'O', score: 0, label: 'O (0分)' },
                                            ].map(({ grade, score, label }) => (
                                                <Button
                                                    key={grade}
                                                    variant={voxPreviewData.submission && voxPreviewData.submission.score === score ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => {
                                                        if (voxPreviewData.submission) {
                                                            handleScore(grade as 'G' | 'A' | 'B' | 'C' | 'O', voxPreviewData.submission.id, voxPreviewData.submission.student.name, score);
                                                        }
                                                    }}
                                                    disabled={loading}
                                                >
                                                    {grade}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            if (!voxPreviewData.submission) return;
                                            try {
                                                setLoading(true);
                                                await axios.post('/api/submissions/cancel-score', {
                                                    submission_id: voxPreviewData.submission.id,
                                                });
                                                // 更新本地状态
                                                const updatedSubmissions = submissions.map((s) =>
                                                    s.id === voxPreviewData.submission!.id
                                                        ? { ...s, score: null }
                                                        : s
                                                );
                                                setSubmissions(updatedSubmissions);
                                                // 更新模态框中的数据
                                                setVoxPreviewData({
                                                    ...voxPreviewData,
                                                    submission: {
                                                        ...voxPreviewData.submission,
                                                        score: null,
                                                    },
                                                });
                                            } catch (error) {
                                                console.error('取消打分失败:', error);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading || voxPreviewData.submission?.score === null}
                                    >
                                        取消打分
                                    </Button>

                                    {/* 上一个/下一个按钮 */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (!voxPreviewData.submission) return;
                                                const currentIndex = submissions.findIndex(s => s.id === voxPreviewData.submission!.id);
                                                if (currentIndex > 0) {
                                                    const prevSubmission = submissions[currentIndex - 1];
                                                    setVoxPreviewData({
                                                        fileUrl: `/storage/${prevSubmission.file_path}`,
                                                        fileName: prevSubmission.file_name,
                                                        submission: prevSubmission,
                                                    });
                                                }
                                            }}
                                            disabled={loading || !voxPreviewData.submission || submissions.findIndex(s => s.id === voxPreviewData.submission!.id) === 0}
                                        >
                                            上一个
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (!voxPreviewData.submission) return;
                                                const currentIndex = submissions.findIndex(s => s.id === voxPreviewData.submission!.id);
                                                if (currentIndex < submissions.length - 1) {
                                                    const nextSubmission = submissions[currentIndex + 1];
                                                    setVoxPreviewData({
                                                        fileUrl: `/storage/${nextSubmission.file_path}`,
                                                        fileName: nextSubmission.file_name,
                                                        submission: nextSubmission,
                                                    });
                                                }
                                            }}
                                            disabled={loading || !voxPreviewData.submission || submissions.findIndex(s => s.id === voxPreviewData.submission!.id) === submissions.length - 1}
                                        >
                                            下一个
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 删除确认模态框 */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl">确认删除</DialogTitle>
                        <DialogDescription className="text-center">
                            确定要删除以下提交记录吗？此操作不可恢复。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm font-medium text-gray-800">文件名：{submissionToDelete?.file_name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            学生：{submissionToDelete?.student.name}
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting} className="rounded-xl px-6">
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="rounded-xl px-6 bg-gradient-to-r from-red-500 to-red-600"
                        >
                            {isDeleting ? '删除中...' : '确认删除'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 批量评分对话框 */}
            <Dialog open={batchGradeDialogOpen} onOpenChange={setBatchGradeDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                            <Award className="w-6 h-6 text-indigo-600" />
                        </div>
                        <DialogTitle className="text-xl">批量评分</DialogTitle>
                        <DialogDescription className="text-center">
                            已为 {selectedSubmissions.length} 个作品选择评分等级
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-2">
                        {[
                            { grade: 'G', score: 12, label: 'G (12分)', color: 'from-emerald-500 to-emerald-600' },
                            { grade: 'A', score: 10, label: 'A (10分)', color: 'from-blue-500 to-blue-600' },
                            { grade: 'B', score: 8, label: 'B (8分)', color: 'from-amber-500 to-amber-600' },
                            { grade: 'C', score: 6, label: 'C (6分)', color: 'from-orange-500 to-orange-600' },
                            { grade: 'O', score: 0, label: 'O (0分)', color: 'from-red-500 to-red-600' },
                        ].map(({ grade, label, color }) => (
                            <Button
                                key={grade}
                                onClick={() => handleBatchScore(grade as 'G' | 'A' | 'B' | 'C' | 'O')}
                                disabled={loading}
                                className={`w-full rounded-xl bg-gradient-to-r ${color} text-white hover:opacity-90`}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                    <div className="flex justify-center mt-4">
                        <Button variant="outline" onClick={() => setBatchGradeDialogOpen(false)} disabled={loading} className="rounded-xl px-6">
                            取消
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
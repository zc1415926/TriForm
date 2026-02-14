import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
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
import AppLayout from '@/layouts/app-layout';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="查看作品" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">查看作品</h1>
                </div>

                <div className="rounded-md border p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 年份筛选 */}
                        <div className="space-y-2">
                            <Label htmlFor="year">年份</Label>
                            <Select onValueChange={handleYearChange} value={selectedYear} disabled={loading}>
                                <SelectTrigger>
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
                            <Label htmlFor="lesson">课时</Label>
                            {loading && lessons.length === 0 && selectedYear ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select onValueChange={handleLessonChange} value={selectedLesson} disabled={loading || !selectedYear || lessons.length === 0}>
                                    <SelectTrigger>
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
                            <Label htmlFor="assignment">作业</Label>
                            {loading && assignments.length === 0 && selectedLesson ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select onValueChange={handleAssignmentChange} value={selectedAssignment} disabled={loading || !selectedLesson}>
                                    <SelectTrigger>
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
                </div>

                {/* 提交记录列表 */}
                {selectedYear && selectedLesson && (
                    <Card>
                        <CardHeader>
                            <CardTitle>提交记录 ({submissions.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : submissions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>学生姓名</TableHead>
                                            <TableHead>文件名</TableHead>
                                            <TableHead>文件大小</TableHead>
                                            <TableHead>提交时间</TableHead>
                                            <TableHead>状态</TableHead>
                                            <TableHead>分数</TableHead>
                                            <TableHead>操作</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((submission) => (
                                            <TableRow key={submission.id}>
                                                <TableCell>{submission.student.name}</TableCell>
                                                <TableCell>{submission.file_name}</TableCell>
                                                <TableCell>{formatFileSize(submission.file_size)}</TableCell>
                                                <TableCell>{formatDate(submission.created_at)}</TableCell>
                                                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                                <TableCell>
                                                    {submission.score !== null ? (
                                                        <Badge variant="default" className="bg-blue-600">
                                                            {submission.score} 分
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">未评分</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {submission.preview_image_path && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
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
                                                                onClick={() => handleViewModel(submission.file_path, submission.file_name, submission)}
                                                            >
                                                                查看
                                                            </Button>
                                                        )}
                                                        {/* 图片文件显示查看按钮 */}
                                                        {['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(submission.file_name.split('.').pop()?.toLowerCase() || '') && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewImage(submission.file_path, submission.file_name, submission)}
                                                            >
                                                                查看
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownload(submission.file_path, submission.file_name)}
                                                        >
                                                            下载
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(submission)}
                                                        >
                                                            删除
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-sm text-muted-foreground">暂无提交记录</div>
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
                                <div className="flex-[2/3] min-h-[400px] flex items-center justify-center bg-black/5 rounded-lg">
                                    <img
                                        src={imagePreviewData.fileUrl}
                                        alt={imagePreviewData.fileName}
                                        className="max-w-[47.5vw] max-h-[40vh] object-contain rounded-lg shadow-lg"
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

            {/* 删除确认模态框 */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>确认删除</DialogTitle>
                        <DialogDescription>
                            确定要删除以下提交记录吗？此操作不可恢复。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">文件名：{submissionToDelete?.file_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            学生：{submissionToDelete?.student.name}
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting}>
                            取消
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                            {isDeleting ? '删除中...' : '确认删除'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
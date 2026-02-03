import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
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
import { StlModelViewer } from '@/components/stl-model-viewer';
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
    created_at: string;
    student: Student;
    assignment: Assignment;
}

export default function SubmissionShow() {
    const { years } = usePage<PageProps>().props;

    // 筛选状态
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState('');

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
    } | null>(null);

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

    // 年份改变时加载课时
    const handleYearChange = async (year: string) => {
        setSelectedYear(year);
        setSelectedLesson('');
        setSelectedAssignment('');
        setAssignments([]);
        setSubmissions([]);

        setLoading(true);
        try {
            const lessonsRes = await axios.get('/api/submissions/lessons-by-year', { params: { year } });
            setLessons(lessonsRes.data);
        } catch (error) {
            console.error('加载课时失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 课时改变时加载作业
    const handleLessonChange = async (lessonId: string) => {
        setSelectedLesson(lessonId);
        setSelectedAssignment('');
        setSubmissions([]);

        setLoading(true);
        try {
            const assignmentsRes = await axios.get('/api/submissions/assignments-by-lesson', {
                params: { lesson_id: lessonId },
            });
            setAssignments(assignmentsRes.data);
        } catch (error) {
            console.error('加载作业失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 作业改变时加载提交记录
    const handleAssignmentChange = async (assignmentId: string) => {
        setSelectedAssignment(assignmentId);

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
    const handleDownload = (filePath: string) => {
        window.open(`/storage/${filePath}`, '_blank');
    };

    // 查看3D模型
    const handleViewModel = (filePath: string, fileName: string) => {
        setModelPreviewData({
            fileUrl: `/storage/${filePath}`,
            fileName,
        });
        setModelPreviewOpen(true);
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
                            {loading && lessons.length === 0 ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select onValueChange={handleLessonChange} value={selectedLesson} disabled={loading || !selectedYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={lessons.length === 0 ? "请先选择年份" : "请选择课时"} />
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
                            {loading && assignments.length === 0 ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select onValueChange={handleAssignmentChange} value={selectedAssignment} disabled={loading || !selectedLesson}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={assignments.length === 0 ? "请先选择课时" : "请选择作业"} />
                                    </SelectTrigger>
                                    <SelectContent>
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
                {selectedAssignment && (
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
                                                                onClick={() => handleViewModel(submission.file_path, submission.file_name)}
                                                            >
                                                                查看
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownload(submission.file_path)}
                                                        >
                                                            下载
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
                <DialogContent className="max-w-5xl h-[600px]">
                    <DialogHeader>
                        <DialogTitle>3D模型预览 - {modelPreviewData?.fileName}</DialogTitle>
                        <DialogDescription className="sr-only">
                            使用鼠标左键旋转，右键平移，滚轮缩放
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 h-[500px]">
                        {modelPreviewData && (
                            <StlModelViewer
                                fileUrl={modelPreviewData.fileUrl}
                                fileName={modelPreviewData.fileName}
                                onError={(error) => {
                                    console.error('3D模型加载失败:', error);
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
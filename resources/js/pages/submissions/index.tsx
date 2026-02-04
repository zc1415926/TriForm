import { Head, usePage, useForm } from '@inertiajs/react';
import axios from 'axios';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StlPreviewGenerator } from '@/components/stl-preview-generator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { store } from '@/routes/submissions';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '作品提交',
        href: store().url,
    },
];

type PageProps = {
    years: string[];
    success?: string;
    error?: string;
};

interface Student {
    id: number;
    name: string;
}

interface Lesson {
    id: number;
    name: string;
    content?: string;
    assignments: {
        id: number;
        name: string;
    }[];
}

interface Assignment {
    id: number;
    name: string;
    upload_type: {
        name: string;
        extensions: string[];
        max_size: number;
    };
    is_required: boolean;
}

// 记忆化的 STL 预览组件，防止不必要的重新渲染
const MemoizedStlPreview = React.memo(function MemoizedStlPreview({
    file,
    previewFile,
    onPreviewGenerated,
}: {
    file: File;
    previewFile?: File;
    onPreviewGenerated: (previewFile: File) => void;
}) {
    if (previewFile) {
        const previewUrl = URL.createObjectURL(previewFile);
        return (
            <img
                src={previewUrl}
                alt="STL 预览"
                className="max-w-full rounded-lg border"
            />
        );
    }

    return (
        <StlPreviewGenerator
            file={file}
            onPreviewGenerated={onPreviewGenerated}
        />
    );
});

export default function SubmissionIndex() {
    const { years, success, error } = usePage<PageProps>().props;
    const renderCountRef = useRef(0);

    // 表单状态
    const { data, setData, processing } = useForm({
        student_id: '',
        assignments: [] as { assignment_id: string; file: File | null; preview_image?: File }[],
    });

    // 下拉数据
    const [students, setStudents] = useState<Student[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(false);

    // 模态框状态
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [isSuccessDialog, setIsSuccessDialog] = useState(false);

    // 调试日志
    useEffect(() => {
        renderCountRef.current++;
        console.log(`[SubmissionIndex] 渲染 #${renderCountRef.current}, assignments.length:`, data?.assignments?.length);
    });

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // 年份改变时加载学生和课时
    const handleYearChange = async (year: string) => {
        setLoading(true);
        try {
            // 加载学生
            const studentsRes = await axios.get('/api/submissions/students-by-year', { params: { year } });
            setStudents(studentsRes.data);

            // 加载课时
            const lessonsRes = await axios.get('/api/submissions/lessons-by-year', { params: { year } });
            setLessons(lessonsRes.data);

            // 重置后续选择
            setData('student_id', '');
            setAssignments([]);
            setData('assignments', []);
        } catch (error) {
            console.error('加载数据失败:', error);
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    // 课时改变时加载作业
    const handleLessonChange = async (lessonId: string) => {
        setLoading(true);
        try {
            // 加载作业
            const assignmentsRes = await axios.get('/api/submissions/assignments-by-lesson', {
                params: { lesson_id: lessonId },
            });
            setAssignments(assignmentsRes.data);

            // 设置选中的课时
            const lesson = lessons.find(l => l.id.toString() === lessonId);
            setSelectedLesson(lesson || null);

            // 初始化作业文件数组
            setData(
                'assignments',
                assignmentsRes.data.map((assignment: Assignment) => ({
                    assignment_id: assignment.id.toString(),
                    file: null,
                }))
            );
        } catch (error) {
            console.error('加载作业失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 处理文件选择
    const handleFileChange = async (index: number, file: File | null) => {
        console.log('[SubmissionIndex] handleFileChange called, index:', index, 'file:', file?.name);
        const updatedAssignments = [...data.assignments];
        const assignment = assignments.find(a => a.id.toString() === updatedAssignments[index].assignment_id);
        
        updatedAssignments[index] = {
            ...updatedAssignments[index],
            file,
            preview_image: undefined,
        };

        // 如果是图片类型且图片超过400x300，生成缩略图
        if (file && assignment) {
            const extension = file.name.split('.').pop()?.toLowerCase() || '';
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
            
            if (imageExtensions.includes(extension)) {
                try {
                    const imageBitmap = await createImageBitmap(file);
                    const width = imageBitmap.width;
                    const height = imageBitmap.height;

                    // 如果图片超过 400x300，按比例缩放
                    if (width > 400 || height > 300) {
                        const thumbnailWidth = 400;
                        const thumbnailHeight = 300;
                        const ratio = Math.min(thumbnailWidth / width, thumbnailHeight / height);
                        const newWidth = Math.round(width * ratio);
                        const newHeight = Math.round(height * ratio);

                        // 创建 Canvas 生成缩略图
                        const canvas = document.createElement('canvas');
                        canvas.width = newWidth;
                        canvas.height = newHeight;
                        const ctx = canvas.getContext('2d');
                        
                        if (ctx) {
                            ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);
                            
                            // 转换为 Blob
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    const baseName = file.name.replace(/\.[^/.]+$/, '');
                                    const thumbnailFile = new File([blob], `${baseName}_thumbnail.jpg`, {
                                        type: 'image/jpeg',
                                    });
                                    updatedAssignments[index] = {
                                        ...updatedAssignments[index],
                                        preview_image: thumbnailFile,
                                    };
                                    setData('assignments', updatedAssignments);
                                }
                            }, 'image/jpeg', 0.85);
                        }
                    }
                    
                    imageBitmap.close();
                } catch (error) {
                    console.error('生成图片缩略图失败:', error);
                }
            }
        }

        setData('assignments', updatedAssignments);
        console.log('[SubmissionIndex] setData assignments 完成');
    };

    // 处理预览图生成
    const handlePreviewGenerated = useCallback((index: number, previewFile: File) => {
        console.log('[SubmissionIndex] handlePreviewGenerated called, index:', index, 'previewFile:', previewFile.name);
        const updatedAssignments = [...data.assignments];
        updatedAssignments[index] = {
            ...updatedAssignments[index],
            preview_image: previewFile,
        };
        setData('assignments', updatedAssignments);
        console.log('[SubmissionIndex] setData assignments with preview 完成');
    }, [data.assignments, setData]);

    // 提交表单
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 检查是否至少上传了一个文件
        const hasFiles = data.assignments.some(assignment => assignment.file !== null);
        if (!hasFiles) {
            setDialogTitle('提示');
            setDialogMessage('请至少上传一个作业文件');
            setDialogOpen(true);
            return;
        }

        // 检查是否有必须提交的作业未上传
        const requiredAssignments = assignments.filter(a => a.is_required);
        const missingRequiredAssignments = requiredAssignments.filter(
            a => !data.assignments.find(da => da.assignment_id === a.id.toString())?.file
        );

        if (missingRequiredAssignments.length > 0) {
            const missingNames = missingRequiredAssignments.map(a => a.name).join('、');
            setDialogTitle('提示');
            setDialogMessage(`以下作业为必须提交，请上传：\n${missingNames}`);
            setDialogOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('student_id', data.student_id);
        data.assignments.forEach((assignment, index) => {
            if (assignment.file) {
                formData.append(`assignments[${index}][assignment_id]`, assignment.assignment_id);
                formData.append(`assignments[${index}][file]`, assignment.file);
                if (assignment.preview_image) {
                    // 直接使用 File 对象
                    formData.append(`assignments[${index}][preview_image]`, assignment.preview_image);
                }
            }
        });

        try {
            await axios.post(store().url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // 显示成功提示，然后刷新页面
            setDialogTitle('成功');
            setDialogMessage('作品提交成功！');
            setIsSuccessDialog(true);
            setDialogOpen(true);
            // 2秒后刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error: any) {
            console.error('提交失败:', error);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join('\n');
                setDialogTitle('提交失败');
                setDialogMessage(errorMessages);
                setDialogOpen(true);
            } else if (error.response?.data?.message) {
                setDialogTitle('提交失败');
                setDialogMessage(error.response.data.message);
                setDialogOpen(true);
            } else {
                setDialogTitle('提交失败');
                setDialogMessage('请稍后重试');
                setDialogOpen(true);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="作品提交" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">作品提交</h1>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 p-4 text-green-800">{success}</div>
                )}

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
                )}

                <div className="rounded-md border p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 年份选择 */}
                        <div className="space-y-2">
                            <Label htmlFor="year">年份</Label>
                            <Select onValueChange={handleYearChange} disabled={loading}>
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

                        {/* 学生选择 */}
                        <div className="space-y-2">
                            <Label htmlFor="student_id">学生姓名</Label>
                            {loading && students.length === 0 ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select
                                    value={data.student_id}
                                    onValueChange={(value) => setData('student_id', value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={students.length === 0 ? "请先选择年份" : "请选择学生"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                {student.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* 课时选择 */}
                        <div className="space-y-2">
                            <Label htmlFor="lesson">课时</Label>
                            {loading && lessons.length === 0 ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select onValueChange={handleLessonChange} disabled={loading}>
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

                        {/* 课时内容显示 */}
                        {selectedLesson && selectedLesson.content && (
                            <div className="space-y-2">
                                <Label>课时内容</Label>
                                <div className="rounded-md border p-4 tiptap-editor-content">
                                    <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                                </div>
                            </div>
                        )}

                        {/* 作业上传区域 */}
                        <div className="space-y-4">
                            <Label>作业列表</Label>
                            {loading && assignments.length === 0 ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : assignments.length > 0 ? (
                                <div className="space-y-4">
                                    {assignments.map((assignment, index) => (
                                        <div key={assignment.id} className="rounded-lg border p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{assignment.name}</h3>
                                                    {assignment.is_required && (
                                                        <Badge variant="destructive" className="text-xs">必须提交</Badge>
                                                    )}
                                                </div>
                                                <Badge variant="outline">{assignment.upload_type.name}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>
                                                    允许的文件类型:{' '}
                                                    {assignment.upload_type.extensions.join(', ')}
                                                </p>
                                                <p>
                                                    最大文件大小:{' '}
                                                    {formatFileSize(assignment.upload_type.max_size)}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>上传文件</Label>
                                                <Input
                                                    type="file"
                                                    accept={assignment.upload_type.extensions.map(ext => `.${ext}`).join(',')}
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            index,
                                                            e.target.files?.[0] || null
                                                        )
                                                    }
                                                />
                                                {data.assignments[index]?.file && (
                                                    <p className="text-sm text-green-600">
                                                        已选择:{' '}
                                                        {data.assignments[index].file.name}
                                                    </p>
                                                )}
                                                {/* STL 预览图生成器 */}
                                                {data.assignments[index]?.file &&
                                                    assignment.upload_type.extensions.includes('stl') && (
                                                        <div className="mt-2">
                                                            <Label>预览图</Label>
                                                            <MemoizedStlPreview
                                                                file={data.assignments[index].file!}
                                                                previewFile={data.assignments[index].preview_image}
                                                                onPreviewGenerated={(previewFile) =>
                                                                    handlePreviewGenerated(index, previewFile)
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    {lessons.length === 0 ? "请先选择年份和课时" : "该课时暂无作业"}
                                </div>
                            )}
                        </div>

                        {/* 提交按钮 */}
                        {assignments.length > 0 && (
                            <Button type="submit" disabled={processing} className="w-full">
                                {processing ? '提交中...' : '提交作品'}
                            </Button>
                        )}
                    </form>
                </div>
            </div>

            {/* 提示模态框 */}
            <Dialog open={dialogOpen} onOpenChange={isSuccessDialog ? undefined : setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <DialogDescription className="whitespace-pre-line">
                            {dialogMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        {isSuccessDialog ? (
                            <Button disabled>即将刷新...</Button>
                        ) : (
                            <Button onClick={() => setDialogOpen(false)}>确定</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
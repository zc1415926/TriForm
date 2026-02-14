import { Head, usePage, useForm } from '@inertiajs/react';
import axios from 'axios';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    StlPreviewGenerator 
} from '@/components/stl-preview-generator';
import { 
    Badge 
} from '@/components/ui/badge';
import { 
    Button 
} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
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
import { 
    Upload, 
    Calendar, 
    User, 
    BookOpen, 
    FileText, 
    CheckCircle2, 
    AlertCircle,
    Sparkles,
    Award,
    Clock,
    FileUp,
    Image as ImageIcon,
    Box,
    Layers
} from 'lucide-react';

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
            <div className="rounded-xl overflow-hidden border-2 border-blue-200 w-fit">
                <img
                    src={previewUrl}
                    alt="STL 预览"
                    className="max-w-full h-auto"
                />
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border-2 border-dashed border-blue-200">
            <StlPreviewGenerator
                file={file}
                onPreviewGenerated={onPreviewGenerated}
            />
        </div>
    );
});

// 获取文件类型的图标和颜色
const getFileTypeInfo = (extensions: string[]) => {
    if (extensions.includes('stl') || extensions.includes('obj')) {
        return { icon: Box, color: 'bg-blue-100 text-blue-600', label: '3D模型' };
    }
    if (extensions.includes('vox')) {
        return { icon: Layers, color: 'bg-purple-100 text-purple-600', label: 'VOX' };
    }
    if (extensions.some(ext => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))) {
        return { icon: ImageIcon, color: 'bg-pink-100 text-pink-600', label: '图片' };
    }
    return { icon: FileText, color: 'bg-amber-100 text-amber-600', label: '文件' };
};

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
            setDialogTitle('🎉 提交成功！');
            setDialogMessage('作品提交成功！太棒了！');
            setIsSuccessDialog(true);
            setDialogOpen(true);
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

    // 计算已选文件数量
    const selectedFilesCount = data.assignments.filter(a => a.file !== null).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="作品提交" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* 页面标题区域 */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-8">
                    {/* 装饰元素 */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-green-200 rounded-full opacity-30 animate-float" />
                    <div className="absolute bottom-4 right-20 w-10 h-10 bg-blue-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent">
                                作品提交
                            </h1>
                        </div>
                        <p className="text-gray-500 ml-1">选择课时并上传你的创意作品 🎨</p>
                    </div>
                </div>

                {/* 成功/错误提示 */}
                {success && (
                    <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-green-800 font-medium">{success}</div>
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-red-800 font-medium">{error}</div>
                    </div>
                )}

                {/* 表单区域 */}
                <Card variant="soft" className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-100/50 p-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold text-gray-800">填写提交信息</h2>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 步骤指示器 */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${students.length > 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-bold">1</div>
                                    <span className="text-sm font-medium">选择年份</span>
                                </div>
                                <div className="flex-1 h-px bg-gray-200" />
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${data.student_id ? 'bg-green-100 text-green-700' : students.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-bold">2</div>
                                    <span className="text-sm font-medium">选择学生</span>
                                </div>
                                <div className="flex-1 h-px bg-gray-200" />
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${assignments.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-bold">3</div>
                                    <span className="text-sm font-medium">上传作品</span>
                                </div>
                            </div>

                            {/* 年份选择 */}
                            <div className="space-y-3">
                                <Label htmlFor="year" className="flex items-center gap-2 text-base">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="font-semibold">📚 选择年份</span>
                                </Label>
                                <Select onValueChange={handleYearChange} disabled={loading}>
                                    <SelectTrigger className="rounded-xl h-12 border-gray-200">
                                        <SelectValue placeholder="请选择年份" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                🎓 {year}年
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 学生选择 */}
                            <div className="space-y-3">
                                <Label htmlFor="student_id" className="flex items-center gap-2 text-base">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <User className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="font-semibold">👤 选择学生</span>
                                </Label>
                                {loading && students.length === 0 ? (
                                    <div className="flex items-center gap-2 text-gray-400 py-3">
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        加载中...
                                    </div>
                                ) : (
                                    <Select
                                        value={data.student_id}
                                        onValueChange={(value) => setData('student_id', value)}
                                        disabled={loading || students.length === 0}
                                    >
                                        <SelectTrigger className="rounded-xl h-12 border-gray-200">
                                            <SelectValue placeholder={students.length === 0 ? "请先选择年份" : "请选择学生"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        {student.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* 课时选择 */}
                            <div className="space-y-3">
                                <Label htmlFor="lesson" className="flex items-center gap-2 text-base">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span className="font-semibold">📖 选择课时</span>
                                </Label>
                                {loading && lessons.length === 0 ? (
                                    <div className="flex items-center gap-2 text-gray-400 py-3">
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        加载中...
                                    </div>
                                ) : (
                                    <Select onValueChange={handleLessonChange} disabled={loading || lessons.length === 0}>
                                        <SelectTrigger className="rounded-xl h-12 border-gray-200">
                                            <SelectValue placeholder={lessons.length === 0 ? "请先选择年份" : "请选择课时"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {lessons.map((lesson) => (
                                                <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                                    📚 {lesson.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* 课时内容显示 */}
                            {selectedLesson && selectedLesson.content && (
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-base">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="font-semibold">📝 课时内容</span>
                                    </Label>
                                    <div className="rounded-xl border-2 border-purple-100 bg-purple-50/50 p-4 tiptap-editor-content">
                                        <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                                    </div>
                                </div>
                            )}

                            {/* 作业上传区域 */}
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2 text-base">
                                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                        <FileUp className="w-4 h-4 text-pink-600" />
                                    </div>
                                    <span className="font-semibold">🎨 作业列表</span>
                                    {selectedFilesCount > 0 && (
                                        <Badge variant="colored" className="ml-2 bg-green-100 text-green-700 border-green-200">
                                            已选 {selectedFilesCount} 个文件
                                        </Badge>
                                    )}
                                </Label>
                                
                                {loading && assignments.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
                                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        加载作业中...
                                    </div>
                                ) : assignments.length > 0 ? (
                                    <div className="space-y-4">
                                        {assignments.map((assignment, index) => {
                                            const fileTypeInfo = getFileTypeInfo(assignment.upload_type.extensions);
                                            const FileIcon = fileTypeInfo.icon;
                                            
                                            return (
                                                <Card 
                                                    key={assignment.id} 
                                                    variant="bordered"
                                                    className={`overflow-hidden transition-all ${data.assignments[index]?.file ? 'border-green-300 bg-green-50/30' : ''}`}
                                                >
                                                    <CardContent className="p-5 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-xl ${fileTypeInfo.color} flex items-center justify-center`}>
                                                                    <FileIcon className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-800">{assignment.name}</h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${fileTypeInfo.color}`}>
                                                                            {fileTypeInfo.label}
                                                                        </span>
                                                                        {assignment.is_required && (
                                                                            <Badge variant="destructive" className="text-xs bg-red-100 text-red-600 border-red-200 hover:bg-red-100">
                                                                                ⚠️ 必须提交
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
                                                            <div className="flex items-center gap-1">
                                                                <span>允许:</span>
                                                                <span className="font-medium text-gray-700">{assignment.upload_type.extensions.join(', ')}</span>
                                                            </div>
                                                            <div className="w-px h-4 bg-gray-300" />
                                                            <div className="flex items-center gap-1">
                                                                <span>最大:</span>
                                                                <span className="font-medium text-gray-700">{formatFileSize(assignment.upload_type.max_size)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label className="flex items-center gap-2">
                                                                <Upload className="w-4 h-4 text-blue-500" />
                                                                上传文件
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    type="file"
                                                                    accept={assignment.upload_type.extensions.map(ext => `.${ext}`).join(',')}
                                                                    onChange={(e) =>
                                                                        handleFileChange(
                                                                            index,
                                                                            e.target.files?.[0] || null
                                                                        )
                                                                    }
                                                                    className="rounded-xl h-12 border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                                />
                                                            </div>
                                                            {data.assignments[index]?.file && (
                                                                <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl p-3">
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                    <span className="font-medium">
                                                                        已选择: {data.assignments[index].file.name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {/* STL 预览图生成器 */}
                                                            {data.assignments[index]?.file &&
                                                                assignment.upload_type.extensions.includes('stl') && (
                                                                    <div className="mt-4 space-y-2">
                                                                        <Label className="flex items-center gap-2">
                                                                            <ImageIcon className="w-4 h-4 text-blue-500" />
                                                                            预览图生成
                                                                        </Label>
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
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <FileUp className="w-10 h-10" />
                                        </div>
                                        <div className="text-lg font-medium mb-1">
                                            {lessons.length === 0 ? "请先选择年份和课时" : "该课时暂无作业"}
                                        </div>
                                        <div className="text-sm">选择后即可上传作品 🎨</div>
                                    </div>
                                )}
                            </div>

                            {/* 提交按钮 */}
                            {assignments.length > 0 && (
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    variant="rainbow"
                                    className="w-full h-14 text-lg rounded-xl mt-6"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            提交中...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            提交作品
                                        </>
                                    )}
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* 提示模态框 */}
            <Dialog open={dialogOpen} onOpenChange={isSuccessDialog ? undefined : setDialogOpen}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <div className="flex flex-col items-center text-center py-4">
                            {isSuccessDialog ? (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <Award className="w-8 h-8 text-green-600" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-8 h-8 text-amber-600" />
                                </div>
                            )}
                            <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
                            <DialogDescription className="whitespace-pre-line text-base mt-2">
                                {dialogMessage}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="justify-center">
                        {isSuccessDialog ? (
                            <Button disabled variant="outline" className="rounded-full">
                                <Clock className="w-4 h-4 mr-2" />
                                即将刷新...
                            </Button>
                        ) : (
                            <Button onClick={() => setDialogOpen(false)} variant="rainbow" className="rounded-full px-8">
                                确定
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

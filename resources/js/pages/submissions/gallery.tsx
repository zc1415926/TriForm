import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
        title: '作品广场',
        href: '',
    },
];

interface Student {
    id: number;
    name: string;
    year: string;
}

interface Assignment {
    id: number;
    name: string;
    lesson: {
        id: number;
        name: string;
    } | null;
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

export default function SubmissionGallery() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    // 图片预览模态框状态
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    // 3D模型预览模态框状态
    const [modelPreviewOpen, setModelPreviewOpen] = useState(false);
    const [modelPreviewData, setModelPreviewData] = useState<{
        fileUrl: string;
        fileName: string;
    } | null>(null);

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/submissions/all');
            setSubmissions(response.data);
        } catch (error) {
            console.error('加载作品失败:', error);
        } finally {
            setLoading(false);
        }
    };

    

    // 判断文件类型
    const getFileType = (fileName: string): 'image' | 'model' | 'other' => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        const modelExtensions = ['stl', 'obj'];

        if (imageExtensions.includes(ext)) {
            return 'image';
        }
        if (modelExtensions.includes(ext)) {
            return 'model';
        }
        return 'other';
    };

    // 点击图片区域
    const handleImageClick = (e: React.MouseEvent, submission: Submission) => {
        e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击

        const fileType = getFileType(submission.file_name);

        if (fileType === 'image') {
            // 打开图片预览模态框
            setImagePreviewUrl(`/storage/${submission.file_path}`);
            setImagePreviewOpen(true);
        } else if (fileType === 'model') {
            // 打开3D模型预览模态框
            setModelPreviewData({
                fileUrl: `/storage/${submission.file_path}`,
                fileName: submission.file_name,
            });
            setModelPreviewOpen(true);
        } else {
            // 其他文件类型，直接下载或查看详情
            window.open(`/storage/${submission.file_path}`, '_blank');
        }
    };

    const getScoreBadge = (score: number | null) => {
        if (score === null) {
            return <span className="text-muted-foreground text-sm">未评分</span>;
        }
        return (
            <Badge variant="default" className="bg-blue-600">
                {score} 分
            </Badge>
        );
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="作品广场" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">作品广场</h1>
                    <Button onClick={loadSubmissions} disabled={loading}>
                        刷新
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">加载中...</div>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">暂无作品</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {submissions.map((submission) => (
                            <Card
                                key={submission.id}
                                className="group overflow-hidden transition-all hover:shadow-lg py-0 pt-0"
                            >
                                {/* 作品截图 */}
                                <div
                                    className="relative aspect-[4/3] bg-muted"
                                    onClick={(e) => handleImageClick(e, submission)}
                                >
                                    {submission.preview_image_path ? (
                                        <img
                                            src={`/storage/${submission.preview_image_path}`}
                                            alt={submission.file_name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📁</div>
                                                <div className="text-sm">{submission.file_name}</div>
                                            </div>
                                        </div>
                                    )}
                                    {/* 点击提示 */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {getFileType(submission.file_name) === 'image' ? '查看大图' : 
                                             getFileType(submission.file_name) === 'model' ? '3D预览' : '打开文件'}
                                        </span>
                                    </div>
                                </div>

                                <CardHeader className="p-2 pb-1 pt-0">
                                    <div className="text-sm font-semibold text-foreground">
                                        {submission.assignment.lesson?.name || '未知课时'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {submission.assignment.name}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-2 pt-0 pb-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                                {submission.student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{submission.student.name}</div>
                                                <div className="text-xs text-muted-foreground">{submission.student.year}年</div>
                                            </div>
                                        </div>
                                        {getScoreBadge(submission.score)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* 图片预览模态框 */}
            <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>图片预览</DialogTitle>
                        <DialogDescription className="sr-only">
                            点击图片查看大图
                        </DialogDescription>
                    </DialogHeader>
                    <img
                        src={imagePreviewUrl}
                        alt="预览图"
                        className="max-w-full rounded-lg border"
                    />
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
                    <div className="flex justify-center min-h-[500px]">
                        {modelPreviewData && (
                            <div className="aspect-[4/3] min-h-[400px] lg:min-h-[500px]">
                                <StlModelViewer
                                    fileUrl={modelPreviewData.fileUrl}
                                    fileName={modelPreviewData.fileName}
                                    onError={(error) => {
                                        console.error('3D模型加载失败:', error);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
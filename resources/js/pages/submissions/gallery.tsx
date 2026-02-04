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

    const handleViewDetail = (submission: Submission) => {
        // 可以跳转到查看作品页面，并传递筛选参数
        window.location.href = `/submissions/show?assignment_id=${submission.assignment_id}`;
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
                                className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                                onClick={() => handleViewDetail(submission)}
                            >
                                {/* 作品截图 */}
                                <div className="relative aspect-square bg-muted">
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
                                    {/* 状态标签 */}
                                    <div className="absolute top-2 right-2">
                                        {submission.status === 'pending' && (
                                            <Badge variant="secondary">待审核</Badge>
                                        )}
                                        {submission.status === 'approved' && (
                                            <Badge variant="default" className="bg-green-600">已通过</Badge>
                                        )}
                                        {submission.status === 'rejected' && (
                                            <Badge variant="destructive">已拒绝</Badge>
                                        )}
                                    </div>
                                </div>

                                <CardHeader className="p-4">
                                    <CardDescription className="line-clamp-1">
                                        {submission.assignment.lesson?.name || '未知课时'} - {submission.assignment.name}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-4 pt-0 space-y-2">
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
                                    <div className="text-xs text-muted-foreground">
                                        {formatFileSize(submission.file_size)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
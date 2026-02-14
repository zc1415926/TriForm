import { Head, Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Award, BookOpen, Clock, FileText, Star, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StudentFormDialog } from '@/components/student-form-dialog';
import AppLayout from '@/layouts/app-layout';
import { index, update } from '@/routes/students';
import type { BreadcrumbItem } from '@/types';

interface Student {
    id: number;
    name: string;
    grade: number;
    grade_text: string;
    class: number;
    year: number;
    avatar: string | null;
    created_at: string;
}

interface Submission {
    id: number;
    assignment_name: string;
    file_name: string;
    file_size: string;
    preview_image_path: string | null;
    status: string;
    score: number | null;
    feedback: string | null;
    created_at: string;
}

interface Stats {
    total_submissions: number;
    scored_submissions: number;
    total_score: number;
    avg_score: number;
}

type PageProps = {
    student: Student;
    submissions: Submission[];
    stats: Stats;
};

const breadcrumbs = (studentName: string): BreadcrumbItem[] => [
    {
        title: '学生管理',
        href: index().url,
    },
    {
        title: studentName,
        href: '#',
    },
];

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

const getScoreBadge = (score: number | null) => {
    if (score === null) {
        return <Badge variant="outline">未评分</Badge>;
    }
    return (
        <Badge variant="default" className="bg-blue-600">
            <Star className="mr-1 size-3" />
            {score} 分
        </Badge>
    );
};

export default function StudentShow() {
    const { student, submissions, stats } = usePage<PageProps>().props;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEditSubmit = (data: {
        name: string;
        grade: string;
        class: string;
        year: string;
        avatar: File | null;
        remove_avatar: boolean;
    }) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('grade', data.grade);
        formData.append('class', data.class);
        formData.append('year', data.year);
        formData.append('_method', 'PUT');

        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        if (data.remove_avatar) {
            formData.append('remove_avatar', '1');
        }

        router.post(update(student.id).url, formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(student.name)}>
            <Head title={student.name} />

            <div className="space-y-6 p-6">
                {/* 返回按钮 */}
                <div>
                    <Link href={index().url}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 size-4" />
                            返回学生列表
                        </Button>
                    </Link>
                </div>

                {/* 学生信息卡片 */}
                <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                    {student.avatar && (
                                        <AvatarImage
                                            src={`/storage/${student.avatar}`}
                                            alt={student.name}
                                        />
                                    )}
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                                        {student.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl font-bold">{student.name}</CardTitle>
                                    <CardDescription className="mt-1 text-base">
                                        {student.grade_text}年级 {student.class}班 · {student.year}年入学
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                                编辑信息
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">作业提交</p>
                                    <p className="text-xl font-bold">{stats.total_submissions}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <Award className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">已评分</p>
                                    <p className="text-xl font-bold">{stats.scored_submissions}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                    <Trophy className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">总分</p>
                                    <p className="text-xl font-bold">{stats.total_score}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Star className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">平均分</p>
                                    <p className="text-xl font-bold">
                                        {stats.avg_score > 0 ? stats.avg_score.toFixed(1) : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 作业提交记录 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="size-5" />
                            作业提交记录
                        </CardTitle>
                        <CardDescription>
                            共 {submissions.length} 条提交记录，最新提交在前
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submissions.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center">
                                <FileText className="mx-auto size-12 text-muted-foreground/50" />
                                <p className="mt-4 text-muted-foreground">暂无作业提交记录</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map((submission, index) => (
                                    <div key={submission.id}>
                                        <div className="flex flex-col gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-start">
                                            {/* 序号 */}
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                                                {index + 1}
                                            </div>

                                            {/* 预览图 */}
                                            {submission.preview_image_path ? (
                                                <div className="shrink-0 overflow-hidden rounded-lg border">
                                                    <img
                                                        src={`/storage/${submission.preview_image_path}`}
                                                        alt={submission.file_name}
                                                        className="h-24 w-32 object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg border bg-muted">
                                                    <FileText className="size-8 text-muted-foreground/50" />
                                                </div>
                                            )}

                                            {/* 信息 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <h4 className="font-semibold truncate">{submission.assignment_name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(submission.status)}
                                                        {getScoreBadge(submission.score)}
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="size-3.5" />
                                                        {submission.file_name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-xs">({submission.file_size})</span>
                                                    </span>
                                                </div>

                                                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="size-3.5" />
                                                    提交于 {submission.created_at}
                                                </div>

                                                {submission.feedback && (
                                                    <div className="mt-3 rounded-md bg-muted p-3 text-sm">
                                                        <span className="font-medium">评语：</span>
                                                        {submission.feedback}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {index < submissions.length - 1 && <Separator />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <StudentFormDialog
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                student={student}
                onSubmit={handleEditSubmit}
                mode="edit"
            />
        </AppLayout>
    );
}

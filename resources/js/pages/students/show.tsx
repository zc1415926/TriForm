import { Head, Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Award, BookOpen, CheckCircle2, Clock, FileText, GraduationCap, Sparkles, Star, Trash2, Trophy, X } from 'lucide-react';
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
            return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">待审核</Badge>;
        case 'approved':
            return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">已通过</Badge>;
        case 'rejected':
            return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">已拒绝</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getScoreBadge = (score: number | null) => {
    if (score === null) {
        return <Badge variant="outline" className="text-gray-400 border-gray-200">未评分</Badge>;
    }
    return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
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

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 返回按钮 */}
                <div>
                    <Link href={index().url}>
                        <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-100">
                            <ArrowLeft className="mr-2 size-4" />
                            返回学生列表
                        </Button>
                    </Link>
                </div>

                {/* 学生信息卡片 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-5">
                            <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl">
                                {student.avatar && (
                                    <AvatarImage
                                        src={`/storage/${student.avatar}`}
                                        alt={student.name}
                                    />
                                )}
                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-3xl font-bold">
                                    {student.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-bold">{student.name}</h1>
                                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                                        {student.year}级
                                    </Badge>
                                </div>
                                <p className="text-blue-100 text-lg">
                                    {student.grade_text}年级 {student.class}班 · {student.year}年入学
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl"
                        >
                            <Sparkles className="mr-2 size-4" />
                            编辑信息
                        </Button>
                    </div>
                </div>
                {/* 统计卡片 */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-200">
                                    <FileText className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">作业提交</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total_submissions}</p>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-200">
                                    <CheckCircle2 className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">已评分</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.scored_submissions}</p>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-200">
                                    <Trophy className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">总分</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total_score}</p>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-600" />
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-200">
                                    <Star className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">平均分</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats.avg_score > 0 ? stats.avg_score.toFixed(1) : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
                        </CardContent>
                    </Card>
                </div>

                {/* 作业提交记录 */}
                <Card className="overflow-hidden shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center">
                                    <BookOpen className="size-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle>作业提交记录</CardTitle>
                                    <CardDescription>
                                        共 {submissions.length} 条提交记录，最新提交在前
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {submissions.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center bg-gray-50/50">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium mb-2">暂无作业提交记录</p>
                                <p className="text-gray-400 text-sm">该学生还没有提交任何作业</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map((submission, index) => (
                                    <div key={submission.id} className="group">
                                        <div className="flex flex-col gap-4 rounded-xl p-4 transition-all hover:bg-gray-50 border border-transparent hover:border-gray-100 sm:flex-row sm:items-start">
                                            {/* 序号 */}
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-sm font-medium text-gray-600 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-colors">
                                                {index + 1}
                                            </div>

                                            {/* 预览图 */}
                                            {submission.preview_image_path ? (
                                                <div className="shrink-0 overflow-hidden rounded-xl border shadow-sm group-hover:shadow-md transition-shadow">
                                                    <img
                                                        src={`/storage/${submission.preview_image_path}`}
                                                        alt={submission.file_name}
                                                        className="h-24 w-32 object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br from-gray-50 to-gray-100">
                                                    <FileText className="size-8 text-gray-400" />
                                                </div>
                                            )}

                                            {/* 信息 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <h4 className="font-semibold text-gray-800 truncate">{submission.assignment_name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(submission.status)}
                                                        {getScoreBadge(submission.score)}
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <FileText className="size-3.5 text-gray-400" />
                                                        {submission.file_name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">({submission.file_size})</span>
                                                </div>

                                                <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Clock className="size-3.5 text-gray-400" />
                                                    提交于 {submission.created_at}
                                                </div>

                                                {submission.feedback && (
                                                    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm">
                                                        <span className="font-medium text-blue-800">评语：</span>
                                                        <span className="text-blue-700">{submission.feedback}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {index < submissions.length - 1 && <div className="h-px bg-gray-100 mx-4" />}
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

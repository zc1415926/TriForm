import { Head, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import axios from '@/lib/axios';
import { addLoginRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { LoginMonitorWrapper } from '@/components/login-monitor-wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Award,
    Upload,
    FileCheck,
    TrendingUp,
    Star,
    Clock,
    AlertCircle,
    Sparkles,
    ChevronRight,
    Medal
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '我的空间',
        href: '/student/dashboard',
    },
];

interface Submission {
    id: number;
    assignment_name: string;
    lesson_name: string;
    file_name: string;
    score: number | null;
    created_at: string;
    preview_image_path: string | null;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked_at: string | null;
}

interface DashboardData {
    student: {
        id: number;
        name: string;
        grade: number;
        class: number;
        year: number;
        avatar: string | null;
    };
    statistics: {
        total_submissions: number;
        scored_submissions: number;
        total_score: number;
        average_score: number;
        completion_rate: number;
    };
    submissions: Submission[];
    pending_assignments: number;
    achievements: Achievement[];
}

export default function StudentDashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const hasRecordedLogin = useRef(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/student/dashboard');
            setDashboardData(response.data);

            // 记录登录到本地 IndexedDB（只记录一次）
            if (response.data?.student && !hasRecordedLogin.current) {
                hasRecordedLogin.current = true;
                const student = response.data.student;
                await addLoginRecord({
                    studentId: student.id,
                    studentName: student.name,
                    loginTime: new Date().toISOString(),
                    loginType: 'student',
                });
                console.log('[登录] 已记录到本地:', student.name);
            }
        } catch (err) {
            setError('加载数据失败，请稍后重试');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'bg-gray-100 text-gray-500';
        if (score >= 12) return 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white';
        if (score >= 10) return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white';
        if (score >= 8) return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white';
        if (score >= 6) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
        return 'bg-gradient-to-r from-red-400 to-red-500 text-white';
    };

    const getGradeText = (score: number | null) => {
        if (score === null) return '待评分';
        if (score >= 12) return 'G - 优秀';
        if (score >= 10) return 'A - 良好';
        if (score >= 8) return 'B - 中等';
        if (score >= 6) return 'C - 及格';
        return 'O - 待改进';
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500">加载中...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="w-96">
                        <CardContent className="pt-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600">{error}</p>
                            <Button onClick={fetchDashboardData} className="mt-4">
                                重新加载
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    if (!dashboardData) return null;

    const { student, statistics, submissions, pending_assignments, achievements } = dashboardData;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="我的空间" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* 头部欢迎区域 */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 mb-8 text-white shadow-2xl">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                        <div className="relative z-10 flex items-center gap-6">
                            <Avatar className="w-20 h-20 border-4 border-white/30">
                                <AvatarImage src={student.avatar ? `/storage/${student.avatar}` : undefined} />
                                <AvatarFallback className="text-2xl bg-white/20 text-white">
                                    {student.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">你好，{student.name}！👋</h1>
                                <p className="text-indigo-100">
                                    {student.year}年入学 · {student.grade}年级{student.class}班
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 统计卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-indigo-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">作品总数</p>
                                        <p className="text-3xl font-bold text-indigo-600">{statistics.total_submissions}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Upload className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-emerald-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">平均分</p>
                                        <p className="text-3xl font-bold text-emerald-600">{statistics.average_score}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-amber-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">完成率</p>
                                        <p className="text-3xl font-bold text-amber-600">{statistics.completion_rate}%</p>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                        <FileCheck className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-pink-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">待提交</p>
                                        <p className="text-3xl font-bold text-pink-600">{pending_assignments}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-pink-600" />
                                    </div>
                                </div>
                                {pending_assignments > 0 && (
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto text-pink-600 mt-2"
                                        onClick={() => router.visit('/submissions')}
                                    >
                                        去提交 <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 我的作品 */}
                        <div className="lg:col-span-2">
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-yellow-500" />
                                            我的作品
                                        </CardTitle>
                                        <CardDescription>共 {submissions.length} 个作品</CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => router.visit('/submissions')}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        提交新作品
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {submissions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 mb-4">还没有提交作品哦</p>
                                            <Button onClick={() => router.visit('/submissions')}>
                                                去提交第一个作品
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {submissions.slice(0, 5).map((submission) => (
                                                <div
                                                    key={submission.id}
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors cursor-pointer"
                                                    onClick={() => router.visit(`/submissions/show?assignment=${submission.id}`)}
                                                >
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                                        {submission.preview_image_path ? (
                                                            <img
                                                                src={`/storage/${submission.preview_image_path}`}
                                                                alt="预览"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                无预览
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 truncate">{submission.assignment_name}</h4>
                                                        <p className="text-sm text-gray-500">{submission.lesson_name}</p>
                                                        <p className="text-xs text-gray-400">{submission.created_at}</p>
                                                    </div>
                                                    <Badge className={getScoreColor(submission.score)}>
                                                        {getGradeText(submission.score)}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {submissions.length > 5 && (
                                                <Button
                                                    variant="ghost"
                                                    className="w-full"
                                                    onClick={() => router.visit('/submissions/show')}
                                                >
                                                    查看全部 {submissions.length} 个作品
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* 成就展示 */}
                        <div>
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Medal className="w-5 h-5 text-yellow-500" />
                                        我的成就
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {achievements.map((achievement) => (
                                            <div
                                                key={achievement.id}
                                                className={`p-4 rounded-xl text-center transition-all ${
                                                    achievement.unlocked_at
                                                        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200'
                                                        : 'bg-gray-50 border-2 border-gray-100 opacity-50'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                                                    achievement.unlocked_at ? 'bg-yellow-100' : 'bg-gray-200'
                                                }`}>
                                                    <Award className={`w-6 h-6 ${achievement.unlocked_at ? 'text-yellow-600' : 'text-gray-400'}`} />
                                                </div>
                                                <p className={`font-medium text-sm ${achievement.unlocked_at ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {achievement.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                                                {achievement.unlocked_at && (
                                                    <p className="text-xs text-yellow-600 mt-1">
                                                        ✓ 已解锁
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 快速操作 */}
                            <Card className="border-0 shadow-lg mt-6">
                                <CardHeader>
                                    <CardTitle>快速操作</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.visit('/submissions/gallery')}
                                    >
                                        <Star className="w-4 h-4 mr-2" />
                                        浏览作品广场
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.visit('/submissions')}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        提交新作品
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* 登录监控弹窗 */}
            <LoginMonitorWrapper />
        </AppLayout>
    );
}

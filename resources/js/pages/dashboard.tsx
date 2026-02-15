import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    GraduationCap,
    PieChart,
    Star,
    TrendingUp,
    Users,
} from 'lucide-react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '仪表盘',
        href: dashboard().url,
    },
];

type PageProps = {
    stats: {
        total_students: number;
        total_lessons: number;
        today_submissions: number;
        pending_reviews: number;
    };
    lessonSubmissions: {
        id: number;
        name: string;
        submission_count: number;
    }[];
    scoreDistribution: {
        G: number;
        A: number;
        B: number;
        C: number;
        O: number;
        unrated: number;
    };
    recentSubmissions: {
        id: number;
        student_name: string;
        assignment_name: string;
        lesson_name: string;
        file_name: string;
        score: number | null;
        created_at: string;
    }[];
    pendingSubmissions: {
        id: number;
        student_name: string;
        assignment_name: string;
        lesson_name: string;
        file_name: string;
        created_at: string;
    }[];
    submissionTrend: {
        date: string;
        count: number;
    }[];
};

export default function Dashboard() {
    const {
        stats,
        lessonSubmissions,
        scoreDistribution,
        recentSubmissions,
        pendingSubmissions,
        submissionTrend,
    } = usePage<PageProps>().props;

    // 成绩分布颜色
    const scoreColors: Record<string, string> = {
        G: 'bg-emerald-500',
        A: 'bg-blue-500',
        B: 'bg-cyan-500',
        C: 'bg-amber-500',
        O: 'bg-red-500',
        unrated: 'bg-gray-400',
    };

    const scoreLabels: Record<string, string> = {
        G: 'G (12分)',
        A: 'A (10分)',
        B: 'B (8分)',
        C: 'C (6分)',
        O: 'O (0分)',
        unrated: '未评分',
    };

    // 计算总数用于饼图
    const totalScored =
        scoreDistribution.G +
        scoreDistribution.A +
        scoreDistribution.B +
        scoreDistribution.C +
        scoreDistribution.O;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="仪表盘" />

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 页面标题 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">仪表盘</h1>
                            <p className="text-blue-100">教学数据概览与快捷操作中心</p>
                        </div>
                    </div>
                </div>

                {/* 统计卡片区 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* 学生总数 */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-200">
                                    <Users className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">学生总数</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total_students}</p>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                        </CardContent>
                    </Card>

                    {/* 课时总数 */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-200">
                                    <BookOpen className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">课时总数</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total_lessons}</p>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
                        </CardContent>
                    </Card>

                    {/* 今日提交 */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-200">
                                    <FileText className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">今日提交</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.today_submissions}</p>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-600" />
                        </CardContent>
                    </Card>

                    {/* 待评分 */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-4 p-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-200">
                                    <Star className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">待评分</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.pending_reviews}</p>
                                </div>
                            </div>
                            <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
                        </CardContent>
                    </Card>
                </div>

                {/* 图表区 */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* 提交趋势图 */}
                    <Card className="overflow-hidden shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle>近7天提交趋势</CardTitle>
                                    <CardDescription>最近一周的每日作品提交数量</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[250px] flex items-end gap-2">
                                {submissionTrend.map((item, index) => {
                                    const maxCount = Math.max(...submissionTrend.map(t => t.count), 1);
                                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="text-xs font-medium text-gray-600">{item.count}</div>
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                            />
                                            <div className="text-xs text-gray-500">{item.date}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 成绩分布饼图 */}
                    <Card className="overflow-hidden shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-600 rounded-xl flex items-center justify-center">
                                    <PieChart className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle>成绩分布</CardTitle>
                                    <CardDescription>已评分作品的等级分布情况</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {Object.entries(scoreDistribution).map(([key, count]) => {
                                    const total = totalScored + scoreDistribution.unrated;
                                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                                    return (
                                        <div key={key} className="flex items-center gap-4">
                                            <div className={`w-4 h-4 rounded-full ${scoreColors[key]}`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {scoreLabels[key]}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${scoreColors[key]} transition-all duration-500`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 各课时提交统计 */}
                <Card className="overflow-hidden shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle>各课时提交统计</CardTitle>
                                <CardDescription>各课时的作品提交数量排行</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {lessonSubmissions.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {lessonSubmissions.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                {lesson.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{lesson.name}</p>
                                                <p className="text-sm text-gray-500">{lesson.submission_count} 份提交</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-lg px-3 py-1">
                                            {lesson.submission_count}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">暂无课时数据</p>
                                <p className="text-gray-400 text-sm mt-1">请先创建课时并发布作业</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 最近提交 & 待评分 */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* 最近提交 */}
                    <Card className="overflow-hidden shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>最近提交</CardTitle>
                                        <CardDescription>最近提交的作品记录</CardDescription>
                                    </div>
                                </div>
                                <Link href="/submissions/show">
                                    <Button variant="outline" size="sm" className="rounded-lg">
                                        查看全部
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentSubmissions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                                            <TableHead className="font-semibold">学生</TableHead>
                                            <TableHead className="font-semibold">课时/作业</TableHead>
                                            <TableHead className="font-semibold">状态</TableHead>
                                            <TableHead className="font-semibold">时间</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentSubmissions.map((submission) => (
                                            <TableRow key={submission.id} className="hover:bg-blue-50/30">
                                                <TableCell className="font-medium">{submission.student_name}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="text-gray-900">{submission.lesson_name}</div>
                                                        <div className="text-gray-500">{submission.assignment_name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {submission.score !== null ? (
                                                        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600">
                                                            {submission.score} 分
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">未评分</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">{submission.created_at}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">暂无提交记录</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 待评分 */}
                    <Card className="overflow-hidden shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle>待评分作品</CardTitle>
                                        <CardDescription>需要评分的作品列表</CardDescription>
                                    </div>
                                </div>
                                <Link href="/submissions/show">
                                    <Button variant="outline" size="sm" className="rounded-lg">
                                        去评分
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pendingSubmissions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                                            <TableHead className="font-semibold">学生</TableHead>
                                            <TableHead className="font-semibold">作业</TableHead>
                                            <TableHead className="font-semibold">提交时间</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingSubmissions.map((submission) => (
                                            <TableRow key={submission.id} className="hover:bg-amber-50/30">
                                                <TableCell className="font-medium">{submission.student_name}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">{submission.assignment_name}</div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">{submission.created_at}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    </div>
                                    <p className="text-gray-500 font-medium">太棒了！</p>
                                    <p className="text-gray-400 text-sm mt-1">所有作品都已评分完成</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 快捷操作 */}
                <Card className="overflow-hidden shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                        <CardTitle>快捷操作</CardTitle>
                        <CardDescription>常用功能的快速入口</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Link href="/submissions/show">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 rounded-xl hover:bg-blue-50 hover:border-blue-200">
                                    <Eye className="w-6 h-6 text-blue-500" />
                                    <span>查看作品</span>
                                </Button>
                            </Link>
                            <Link href="/students">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 rounded-xl hover:bg-green-50 hover:border-green-200">
                                    <Users className="w-6 h-6 text-green-500" />
                                    <span>学生管理</span>
                                </Button>
                            </Link>
                            <Link href="/lessons">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 rounded-xl hover:bg-amber-50 hover:border-amber-200">
                                    <BookOpen className="w-6 h-6 text-amber-500" />
                                    <span>课时管理</span>
                                </Button>
                            </Link>
                            <Link href="/submissions">
                                <Button variant="outline" className="w-full h-20 flex flex-col gap-2 rounded-xl hover:bg-purple-50 hover:border-purple-200">
                                    <FileText className="w-6 h-6 text-purple-500" />
                                    <span>作品提交</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



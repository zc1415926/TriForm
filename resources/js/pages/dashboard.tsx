import { Head } from '@inertiajs/react';
import { DollarSign, Users, CreditCard, Activity, TrendingUp, Star, Sparkles, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    // 模拟数据
    const totalRevenue = 45231.89;
    const subscriptions = 2356;
    const sales = 12056;
    const activeNow = 573;

    // 模拟图表数据
    const chartData = [
        { month: '一月', revenue: 186, subscription: 80 },
        { month: '二月', revenue: 305, subscription: 200 },
        { month: '三月', revenue: 237, subscription: 120 },
        { month: '四月', revenue: 73, subscription: 190 },
        { month: '五月', revenue: 209, subscription: 130 },
        { month: '六月', revenue: 214, subscription: 140 },
    ];

    // 模拟最近销售数据
    const recentSales = [
        {
            id: 1,
            name: '张三',
            email: 'zhangsan@example.com',
            amount: 299.00,
            status: 'completed' as const,
            avatar: 'ZS',
        },
        {
            id: 2,
            name: '李四',
            email: 'lisi@example.com',
            amount: 199.00,
            status: 'processing' as const,
            avatar: 'LS',
        },
        {
            id: 3,
            name: '王五',
            email: 'wangwu@example.com',
            amount: 399.00,
            status: 'completed' as const,
            avatar: 'WW',
        },
        {
            id: 4,
            name: '赵六',
            email: 'zhaoliu@example.com',
            amount: 99.00,
            status: 'failed' as const,
            avatar: 'ZL',
        },
        {
            id: 5,
            name: '钱七',
            email: 'qianqi@example.com',
            amount: 499.00,
            status: 'completed' as const,
            avatar: 'QQ',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-green-100 text-green-700 border border-green-300 font-semibold">
                        ✓ 已完成
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge className="bg-amber-100 text-amber-700 border border-amber-300 font-semibold">
                        ⏳ 处理中
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge className="bg-red-100 text-red-700 border border-red-300 font-semibold">
                        ✗ 失败
                    </Badge>
                );
            default:
                return <Badge>未知</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-waves min-h-screen">
                {/* 页面标题 */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight gradient-text-blue flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-amber-500" />
                            仪表盘
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg">欢迎回来！今天也要加油哦 🌟</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="lg">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            导出数据
                        </Button>
                        <Button variant="rainbow" size="lg">
                            <Trophy className="w-5 h-5 mr-2" />
                            生成报表
                        </Button>
                    </div>
                </div>

                {/* 统计卡片 - 彩虹色系 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card variant="colored" className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-blue-700 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                总收入
                            </CardTitle>
                            <div className="p-2.5 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">¥{totalRevenue.toLocaleString()}</div>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-lg">📈</span>
                                <p className="text-sm font-semibold text-green-600">+20.1% 较上月</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="soft" className="relative overflow-hidden group border-2 border-green-200">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-green-700 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                订阅数
                            </CardTitle>
                            <div className="p-2.5 rounded-xl bg-green-500 shadow-lg shadow-green-500/30">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">+{subscriptions.toLocaleString()}</div>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-lg">🚀</span>
                                <p className="text-sm font-semibold text-green-600">+180.1% 较上月</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="soft" className="relative overflow-hidden group border-2 border-amber-200">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                销售数
                            </CardTitle>
                            <div className="p-2.5 rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">+{sales.toLocaleString()}</div>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-lg">💰</span>
                                <p className="text-sm font-semibold text-green-600">+19% 较上月</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="soft" className="relative overflow-hidden group border-2 border-pink-200">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-pink-700 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                当前活跃
                            </CardTitle>
                            <div className="p-2.5 rounded-xl bg-pink-500 shadow-lg shadow-pink-500/30">
                                <Activity className="h-5 w-5 text-white animate-pulse" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">+{activeNow}</div>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-lg">⚡</span>
                                <p className="text-sm font-semibold text-amber-600">+201 实时在线</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 图表区域 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card variant="rainbow" className="col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">📊</span>
                                收入概览
                            </CardTitle>
                            <CardDescription>近6个月收入与订阅趋势</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <div className="h-full w-full">
                                    <svg
                                        viewBox="0 0 600 300"
                                        className="h-full w-full"
                                        preserveAspectRatio="none"
                                    >
                                        {/* 背景网格 */}
                                        <defs>
                                            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid)" rx="12" />
                                        
                                        {/* 简化的折线图 - 收入 */}
                                        <path
                                            d={`M ${chartData.map((d, i) => `${i * 100},${300 - d.revenue}`).join(' L ')}`}
                                            fill="none"
                                            stroke="#3B82F6"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {/* 简化的折线图 - 订阅 */}
                                        <path
                                            d={`M ${chartData.map((d, i) => `${i * 100},${300 - d.subscription}`).join(' L ')}`}
                                            fill="none"
                                            stroke="#10B981"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {/* 数据点 - 收入 */}
                                        {chartData.map((d, i) => (
                                            <circle
                                                key={`revenue-${i}`}
                                                cx={i * 100}
                                                cy={300 - d.revenue}
                                                r="8"
                                                fill="#3B82F6"
                                                stroke="white"
                                                strokeWidth="3"
                                            />
                                        ))}
                                        {/* 数据点 - 订阅 */}
                                        {chartData.map((d, i) => (
                                            <circle
                                                key={`subscription-${i}`}
                                                cx={i * 100}
                                                cy={300 - d.subscription}
                                                r="8"
                                                fill="#10B981"
                                                stroke="white"
                                                strokeWidth="3"
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </div>
                            {/* 图例 */}
                            <div className="flex items-center justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                                    <span className="text-sm font-semibold text-gray-700">收入</span>
                                </div>
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                                    <div className="w-4 h-4 rounded-full bg-green-500" />
                                    <span className="text-sm font-semibold text-gray-700">订阅</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 最近销售 */}
                    <Card variant="bordered" className="col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🛒</span>
                                最近销售
                            </CardTitle>
                            <CardDescription>最近 5 笔销售记录</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentSales.map((sale) => (
                                    <div 
                                        key={sale.id} 
                                        className="flex items-center p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                                    >
                                        <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                                            <AvatarImage src="" alt={sale.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white font-bold">
                                                {sale.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-0.5 flex-1">
                                            <p className="text-sm font-bold text-gray-800">{sale.name}</p>
                                            <p className="text-xs text-gray-500">{sale.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-800">¥{sale.amount.toFixed(2)}</div>
                                            <div className="mt-1">{getStatusBadge(sale.status)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 数据表格标签页 */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-white border-2 border-blue-100 p-2 rounded-2xl">
                        <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold">
                            <span className="mr-2">📋</span>概览
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold">
                            <span className="mr-2">📈</span>分析
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold">
                            <span className="mr-2">📄</span>报表
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold">
                            <span className="mr-2">🔔</span>通知
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card variant="colored">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span>👋</span>新用户
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-800">1,234</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span>📈</span>
                                        <p className="text-sm font-semibold text-green-600">+12% 较上月</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card variant="soft" className="border-2 border-purple-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span>🎯</span>活跃用户
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-800">8,456</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span>🚀</span>
                                        <p className="text-sm font-semibold text-green-600">+8% 较上月</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card variant="soft" className="border-2 border-amber-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span>🎨</span>转化率
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-800">12.5%</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span>⭐</span>
                                        <p className="text-sm font-semibold text-green-600">+2.3% 较上月</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card variant="soft" className="border-2 border-pink-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span>💎</span>平均订单价值
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-800">¥456</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span>💰</span>
                                        <p className="text-sm font-semibold text-red-500">-3% 较上月</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="analytics" className="space-y-4">
                        <Card variant="rainbow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">📊</span>
                                    数据分析
                                </CardTitle>
                                <CardDescription>详细的数据分析报告</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    这里将显示详细的数据分析图表和指标。
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="reports" className="space-y-4">
                        <Card variant="rainbow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">📄</span>
                                    报表中心
                                </CardTitle>
                                <CardDescription>查看和下载各种报表</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    这里将显示可用的报表列表。
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="notifications" className="space-y-4">
                        <Card variant="rainbow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">🔔</span>
                                    通知中心
                                </CardTitle>
                                <CardDescription>查看最新通知</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    这里将显示最新的通知和提醒。
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
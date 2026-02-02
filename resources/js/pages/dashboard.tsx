import { Head } from '@inertiajs/react';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
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
                return <Badge className="bg-green-500/15 text-green-700 dark:text-green-400">已完成</Badge>;
            case 'processing':
                return <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400">处理中</Badge>;
            case 'failed':
                return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400">失败</Badge>;
            default:
                return <Badge>未知</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
                    <div className="flex items-center space-x-2">
                        <Button>下载报表</Button>
                    </div>
                </div>

                {/* 统计卡片 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">总收入</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">¥{totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+20.1% 较上月</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">订阅数</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{subscriptions}</div>
                            <p className="text-xs text-muted-foreground">+180.1% 较上月</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">销售数</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{sales}</div>
                            <p className="text-xs text-muted-foreground">+19% 较上月</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">当前活跃</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{activeNow}</div>
                            <p className="text-xs text-muted-foreground">+201 较上月</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 图表区域 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>概览</CardTitle>
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
                                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/20"/>
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                        
                                        {/* 简化的折线图 - 收入 */}
                                        <path
                                            d={`M ${chartData.map((d, i) => `${i * 100},${300 - d.revenue}`).join(' L ')}`}
                                            fill="none"
                                            stroke="hsl(var(--chart-1))"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {/* 简化的折线图 - 订阅 */}
                                        <path
                                            d={`M ${chartData.map((d, i) => `${i * 100},${300 - d.subscription}`).join(' L ')}`}
                                            fill="none"
                                            stroke="hsl(var(--chart-2))"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {/* 数据点 - 收入 */}
                                        {chartData.map((d, i) => (
                                            <circle
                                                key={`revenue-${i}`}
                                                cx={i * 100}
                                                cy={300 - d.revenue}
                                                r="5"
                                                fill="hsl(var(--chart-1))"
                                                stroke="hsl(var(--background))"
                                                strokeWidth="2"
                                            />
                                        ))}
                                        {/* 数据点 - 订阅 */}
                                        {chartData.map((d, i) => (
                                            <circle
                                                key={`subscription-${i}`}
                                                cx={i * 100}
                                                cy={300 - d.subscription}
                                                r="5"
                                                fill="hsl(var(--chart-2))"
                                                stroke="hsl(var(--background))"
                                                strokeWidth="2"
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 最近销售 */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>最近销售</CardTitle>
                            <CardDescription>最近 5 笔销售记录</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="" alt={sale.name} />
                                            <AvatarFallback>{sale.avatar}</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{sale.name}</p>
                                            <p className="text-sm text-muted-foreground">{sale.email}</p>
                                        </div>
                                        <div className="ml-auto font-medium">¥{sale.amount.toFixed(2)}</div>
                                        {getStatusBadge(sale.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 数据表格标签页 */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">概览</TabsTrigger>
                        <TabsTrigger value="analytics">分析</TabsTrigger>
                        <TabsTrigger value="reports">报表</TabsTrigger>
                        <TabsTrigger value="notifications">通知</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">新用户</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1,234</div>
                                    <p className="text-xs text-muted-foreground">+12% 较上月</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">活跃用户</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">8,456</div>
                                    <p className="text-xs text-muted-foreground">+8% 较上月</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">转化率</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12.5%</div>
                                    <p className="text-xs text-muted-foreground">+2.3% 较上月</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">平均订单价值</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">¥456</div>
                                    <p className="text-xs text-muted-foreground">+15% 较上月</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="analytics" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>数据分析</CardTitle>
                                <CardDescription>详细的数据分析报告</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    这里将显示详细的数据分析图表和指标。
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="reports" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>报表中心</CardTitle>
                                <CardDescription>查看和下载各种报表</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    这里将显示可用的报表列表。
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="notifications" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>通知中心</CardTitle>
                                <CardDescription>查看最新通知</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
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
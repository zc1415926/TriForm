import { Head, Link, usePage } from '@inertiajs/react';
import { Sparkles, BookOpen, Users, Trophy, Star, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const features = [
        { icon: BookOpen, title: '作业管理', desc: '轻松管理课程作业', color: 'bg-blue-100 text-blue-600' },
        { icon: Users, title: '学生管理', desc: '方便的学生信息管理', color: 'bg-green-100 text-green-600' },
        { icon: Trophy, title: '成绩统计', desc: '直观的成绩分析', color: 'bg-amber-100 text-amber-600' },
        { icon: Star, title: '作品展示', desc: '展示学生优秀作品', color: 'bg-pink-100 text-pink-600' },
    ];

    return (
        <>
            <Head title="TriForm - 让教学更轻松">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            
            {/* 背景装饰 */}
            <div className="min-h-screen bg-[#FFFBF5] relative overflow-hidden">
                {/* 浮动装饰元素 */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-float" />
                <div className="absolute top-40 right-20 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-amber-200 rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '0.5s' }} />
                
                {/* 导航栏 */}
                <header className="relative z-10 w-full px-6 py-4">
                    <nav className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                                TriForm
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Button variant="rainbow" size="sm" asChild>
                                    <Link href={dashboard()}>
                                        <Rocket className="w-4 h-4 mr-1" />
                                        进入系统
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" size="sm" className="rounded-full" asChild>
                                        <Link href={login()}>登录</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button variant="rainbow" size="sm" className="rounded-full" asChild>
                                            <Link href={register()}>注册</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* 主内容区 */}
                <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20">
                    {/* Hero 区域 */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6 border border-blue-100">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-600 font-medium">让教学管理更简单</span>
                        </div>
                        
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                            <span className="text-gray-800">让</span>
                            <span className="bg-gradient-to-r from-blue-500 via-green-500 to-amber-500 bg-clip-text text-transparent">教学</span>
                            <span className="text-gray-800">更轻松</span>
                        </h1>
                        
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                            TriForm 是一个专为小学教学设计的高效管理平台，
                            帮助老师轻松管理作业、学生和成绩
                        </p>
                        
                        <div className="flex items-center justify-center gap-4">
                            {auth.user ? (
                                <Button variant="rainbow" size="lg" className="rounded-full text-lg px-8" asChild>
                                    <Link href={dashboard()}>
                                        <Rocket className="w-5 h-5 mr-2" />
                                        开始使用
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="rainbow" size="lg" className="rounded-full text-lg px-8" asChild>
                                        <Link href={register()}>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            免费注册
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" className="rounded-full text-lg px-8" asChild>
                                        <Link href={login()}>已有账号登录</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 功能卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {features.map((feature, index) => (
                            <Card key={index} variant="soft" className="group">
                                <CardContent className="p-6 text-center">
                                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-500">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* 统计区域 */}
                    <div className="bg-gradient-to-r from-blue-50 via-green-50 to-amber-50 rounded-3xl p-8 lg:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-4xl lg:text-5xl font-bold text-blue-500 mb-2">1000+</div>
                                <div className="text-gray-600">活跃教师</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-bold text-green-500 mb-2">50000+</div>
                                <div className="text-gray-600">管理学生</div>
                            </div>
                            <div>
                                <div className="text-4xl lg:text-5xl font-bold text-amber-500 mb-2">99%</div>
                                <div className="text-gray-600">满意度</div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 页脚 */}
                <footer className="relative z-10 py-8 text-center text-gray-500 text-sm">
                    <p>© 2025 TriForm. 让教学更轻松。</p>
                </footer>
            </div>
        </>
    );
}
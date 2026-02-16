import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import {
    Shield,
    Users,
    Radio,
    AlertCircle,
    CheckCircle,
    Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '教师管理',
        href: '#',
    },
    {
        title: '登录监控',
        href: '/teacher/login-monitor',
    },
];

interface Student {
    id: number;
    name: string;
    grade: number;
    class: number;
    year: number;
}

export default function LoginMonitor() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [broadcasting, setBroadcasting] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; message: string } | null>(null);

    // 加载学生列表
    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const studentsRes = await axios.get('/api/submissions/students-by-year');
            setStudents(studentsRes.data.students || []);
        } catch (error) {
            console.error('加载学生数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 发送广播请求
    const handleBroadcast = async () => {
        try {
            setBroadcasting(true);
            setBroadcastResult(null);

            const targetStudentId = selectedStudent === 'all' ? null : parseInt(selectedStudent);

            const response = await axios.post('/api/teacher/broadcast-login-check', {
                target_student_id: targetStudentId,
            });

            setBroadcastResult({
                success: true,
                message: targetStudentId
                    ? `已向 ${students.find(s => s.id === targetStudentId)?.name} 发送查看请求`
                    : '已向所有在线学生发送查看请求，学生将显示本地登录记录',
            });
        } catch (error: any) {
            setBroadcastResult({
                success: false,
                message: error.response?.data?.message || '发送失败，请重试',
            });
        } finally {
            setBroadcasting(false);
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="登录监控" />
                <div className="flex items-center justify-center h-96">
                    <Spinner className="w-8 h-8" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="登录监控" />

            <div className="space-y-6 p-6 max-w-4xl mx-auto">
                {/* 页面标题 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 p-8 text-white shadow-xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Shield className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">登录监控</h1>
                                <p className="text-white/80">向学生发送指令，查看其设备上的本地登录记录</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 说明卡片 */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">工作原理</h3>
                                <p className="text-blue-700 text-sm leading-relaxed">
                                    学生的登录记录只保存在其浏览器本地（IndexedDB），不会上传到服务器。
                                    当您发送查看指令后，在线的学生会立即弹出登录记录窗口，显示该设备上登录过的所有学生账号。
                                    这有助于发现账号共用或教师代登的情况。
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 广播控制面板 */}
                <Card className="border-2 border-red-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-red-500" />
                            发送查看指令
                        </CardTitle>
                        <CardDescription>
                            选择目标学生，向其发送查看本地登录记录的指令
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="w-full sm:w-64">
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择目标学生" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">所有在线学生</SelectItem>
                                        {students.map(student => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                {student.name} ({student.grade}年级{student.class}班)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleBroadcast}
                                disabled={broadcasting}
                                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                            >
                                {broadcasting ? (
                                    <>
                                        <Spinner className="w-4 h-4 mr-2" />
                                        发送中...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        发送查看指令
                                    </>
                                )}
                            </Button>
                        </div>

                        {broadcastResult && (
                            <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                                broadcastResult.success
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {broadcastResult.success ? (
                                    <CheckCircle className="w-5 h-5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5" />
                                )}
                                {broadcastResult.message}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 统计信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">总学生数</p>
                                    <p className="text-2xl font-bold">{students.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">数据存储</p>
                                    <p className="text-lg font-bold text-green-600">仅本地</p>
                                    <p className="text-xs text-gray-400">登录记录不上传到服务器</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { GraduationCap, User, Lock, Sparkles } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    grade: number;
    class: number;
    year: number;
}

export default function StudentLogin() {
    const [years, setYears] = useState<string[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // 获取年份列表
    useEffect(() => {
        axios.get('/api/submissions/students-by-year')
            .then(response => {
                const yearList = response.data.years || [];
                setYears(yearList);
                // 尝试从 localStorage 恢复选择
                const savedYear = localStorage.getItem('student_last_year');
                if (savedYear && yearList.includes(savedYear)) {
                    setSelectedYear(savedYear);
                } else if (yearList.length > 0) {
                    setSelectedYear(yearList[0]);
                }
            })
            .catch(console.error);
    }, []);

    // 获取学生列表
    useEffect(() => {
        if (!selectedYear) return;
        
        axios.get('/api/submissions/students-by-year', {
            params: { year: selectedYear }
        })
            .then(response => {
                setStudents(response.data.students || []);
                // 尝试恢复学生选择
                const savedStudentId = localStorage.getItem('student_last_id');
                if (savedStudentId) {
                    setSelectedStudentId(savedStudentId);
                }
            })
            .catch(console.error);
    }, [selectedYear]);

    const handleLogin = async () => {
        if (!selectedStudentId) {
            setError('请选择你的姓名');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/student/login', {
                student_id: selectedStudentId,
                password: password,
            });

            if (response.data.success) {
                // 记住选择
                if (rememberMe) {
                    localStorage.setItem('student_last_year', selectedYear);
                    localStorage.setItem('student_last_id', selectedStudentId);
                }
                
                // 跳转到学生个人中心
                router.visit('/student/dashboard');
            } else {
                setError(response.data.message || '登录失败');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || '登录失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <Head title="学生登录" />
            
            <Card className="w-full max-w-md border-0 shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        学生登录
                    </CardTitle>
                    <CardDescription>
                        欢迎来到 3D 创意世界！🎨
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            入学年份
                        </Label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="选择入学年份" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={year}>{year}年</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" />
                            你的姓名
                        </Label>
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="选择你的姓名" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(student => (
                                    <SelectItem key={student.id} value={student.id.toString()}>
                                        {student.name} ({student.grade}年级{student.class}班)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-indigo-500" />
                            密码（可选）
                        </Label>
                        <Input
                            type="password"
                            placeholder="如果没有设置密码，请直接登录"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12"
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                        <p className="text-xs text-gray-500">
                            首次登录不需要密码，系统会自动为你创建账号
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                            记住我的选择，下次自动登录
                        </Label>
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={loading || !selectedStudentId}
                        className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg font-medium"
                    >
                        {loading ? '登录中...' : '进入我的空间'}
                    </Button>

                    <div className="text-center">
                        <Button
                            variant="link"
                            className="text-gray-500"
                            onClick={() => router.visit('/submissions/gallery')}
                        >
                            先逛逛作品广场
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

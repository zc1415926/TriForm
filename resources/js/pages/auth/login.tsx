import { Form, Head, router } from '@inertiajs/react';
import { GraduationCap, Lock, Mail, Sparkles, User, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { addLoginRecord } from '@/lib/db';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { cn } from '@/lib/utils';

interface Student {
    id: number;
    name: string;
    grade: number;
    class: number;
    year: number;
}

type Props = {
    status?: string;
};

export default function Login({ status }: Props) {
    const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');

    // 学生登录状态
    const [years, setYears] = useState<string[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [studentLoading, setStudentLoading] = useState(false);
    const [studentError, setStudentError] = useState('');
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
                // 只有在未手动选择学生时，才尝试恢复
                if (!selectedStudentId) {
                    const savedStudentId = localStorage.getItem('student_last_id');
                    if (savedStudentId) {
                        const studentExists = response.data.students?.some(
                            (s: Student) => s.id.toString() === savedStudentId
                        );
                        if (studentExists) {
                            console.log('[登录] 从 localStorage 恢复学生选择:', savedStudentId);
                            setSelectedStudentId(savedStudentId);
                        }
                    }
                }
            })
            .catch(console.error);
    }, [selectedYear, selectedStudentId]);

    // 学生登录
    const handleStudentLogin = async () => {
        if (!selectedStudentId) {
            setStudentError('请选择你的姓名');
            return;
        }

        setStudentLoading(true);
        setStudentError('');

        try {
            const response = await axios.post('/api/student/login', {
                student_id: selectedStudentId,
            });

            if (response.data.success) {
                // 记住选择
                if (rememberMe) {
                    localStorage.setItem('student_last_year', selectedYear);
                    localStorage.setItem('student_last_id', selectedStudentId);
                }

                // 记录到本地IndexedDB
                const selectedStudent = students.find(s => s.id.toString() === selectedStudentId);
                if (selectedStudent) {
                    await addLoginRecord({
                        studentId: selectedStudent.id,
                        studentName: selectedStudent.name,
                        loginTime: new Date().toISOString(),
                        loginType: 'student',
                    });
                }

                // 跳转到学生个人中心
                router.visit('/student/dashboard');
            } else {
                setStudentError(response.data.message || '登录失败');
            }
        } catch (err: any) {
            setStudentError(err.response?.data?.message || '登录失败，请重试');
        } finally {
            setStudentLoading(false);
        }
    };

    return (
        <AuthLayout
            title="欢迎回来"
            description="请选择您的身份登录系统"
        >
            <Head title="登录" />

            {/* Tab 切换 */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('teacher')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200",
                        activeTab === 'teacher'
                            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    )}
                >
                    <GraduationCap className="w-5 h-5" />
                    教师登录
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('student')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200",
                        activeTab === 'student'
                            ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    )}
                >
                    <Users className="w-5 h-5" />
                    学生登录
                </button>
            </div>

            {/* 教师登录 */}
            {activeTab === 'teacher' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <Form
                        {...store()}
                        method="post"
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            邮箱地址
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="请输入邮箱地址"
                                            className="rounded-xl h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                            密码
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="请输入密码"
                                            className="rounded-xl h-12 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="remember" className="text-gray-600 dark:text-gray-400">记住我</Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full rounded-xl h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner />}
                                        <GraduationCap className="w-5 h-5 mr-2" />
                                        教师登录
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            )}

            {/* 学生登录 */}
            {activeTab === 'student' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <Form
                        action={route('login')}
                        method="post"
                        resetOnSuccess={[]}
                        className="flex flex-col gap-5"
                        onSubmit={() => {
                            const email = selectedStudentId ? `student${selectedStudentId}@student.local` : '';
                            console.log('[登录] 表单提交:', {
                                email,
                                studentId: selectedStudentId,
                            });
                            // 保存选择到 localStorage
                            if (rememberMe && selectedYear && selectedStudentId) {
                                localStorage.setItem('student_last_year', selectedYear);
                                localStorage.setItem('student_last_id', selectedStudentId);
                            }
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* 隐藏的 email 字段 - 格式: student{id}@student.local */}
                                <input
                                    type="hidden"
                                    name="email"
                                    value={selectedStudentId ? `student${selectedStudentId}@student.local` : ''}
                                />

                                {/* 隐藏的密码字段 - 统一密码 */}
                                <input
                                    type="hidden"
                                    name="password"
                                    value="123456"
                                />

                                <div className="grid gap-2">
                                    <Label className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                        入学年份
                                    </Label>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700">
                                            <SelectValue placeholder="选择入学年份" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(year => (
                                                <SelectItem key={year} value={year}>{year}年</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                        <User className="w-4 h-4 text-purple-500" />
                                        你的姓名
                                    </Label>
                                    <Select value={selectedStudentId} onValueChange={(value) => {
                                        console.log('[登录] 用户选择学生:', value);
                                        setSelectedStudentId(value);
                                        // 清除 localStorage 避免冲突
                                        localStorage.removeItem('student_last_id');
                                    }}>
                                        <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-700">
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
                                    {selectedStudentId && (
                                        <div className="text-xs text-gray-500">
                                            学生ID: {selectedStudentId} | 登录账号: student{selectedStudentId}@student.local
                                        </div>
                                    )}
                                    <InputError message={errors.email || errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="student-remember"
                                        name="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="student-remember" className="text-gray-600 dark:text-gray-400 cursor-pointer">
                                        记住我
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing || !selectedStudentId}
                                    className="w-full rounded-xl h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                                >
                                    {processing && <Spinner />}
                                    <User className="w-5 h-5 mr-2" />
                                    学生登录
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            )}

            {status && (
                <div className="mt-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-green-800 dark:text-green-200 font-medium text-sm">{status}</span>
                </div>
            )}
        </AuthLayout>
    );
}

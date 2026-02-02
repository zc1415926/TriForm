import { Head, usePage, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { store } from '@/routes/submissions';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '作品提交',
        href: store().url,
    },
];

type PageProps = {
    years: string[];
    success?: string;
    error?: string;
};

interface Student {
    id: number;
    name: string;
}

interface Lesson {
    id: number;
    name: string;
    assignments: {
        id: number;
        name: string;
    }[];
}

interface Assignment {
    id: number;
    name: string;
    upload_type: {
        name: string;
        extensions: string[];
        max_size: number;
    };
}

export default function SubmissionIndex() {
    const { years, success, error } = usePage<PageProps>().props;

    // 表单状态
    const { data, setData, processing } = useForm({
        student_id: '',
        assignments: [] as { assignment_id: string; file: File | null }[],
    });

    // 下拉数据
    const [students, setStudents] = useState<Student[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // 年份改变时加载学生和课时
    const handleYearChange = async (year: string) => {
        setLoading(true);
        try {
            // 加载学生
            const studentsRes = await axios.get('/api/submissions/students-by-year', { params: { year } });
            setStudents(studentsRes.data);

            // 加载课时
            const lessonsRes = await axios.get('/api/submissions/lessons-by-year', { params: { year } });
            setLessons(lessonsRes.data);

            // 重置后续选择
            setData('student_id', '');
            setAssignments([]);
            setData('assignments', []);
        } catch (error) {
            console.error('加载数据失败:', error);
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    // 课时改变时加载作业
    const handleLessonChange = async (lessonId: string) => {
        setLoading(true);
        try {
            // 加载作业
            const assignmentsRes = await axios.get('/api/submissions/assignments-by-lesson', {
                params: { lesson_id: lessonId },
            });
            setAssignments(assignmentsRes.data);

            // 初始化作业文件数组
            setData(
                'assignments',
                assignmentsRes.data.map((assignment: Assignment) => ({
                    assignment_id: assignment.id.toString(),
                    file: null,
                }))
            );
        } catch (error) {
            console.error('加载作业失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 处理文件选择
    const handleFileChange = (index: number, file: File | null) => {
        const updatedAssignments = [...data.assignments];
        updatedAssignments[index] = {
            ...updatedAssignments[index],
            file,
        };
        setData('assignments', updatedAssignments);
    };

    // 提交表单
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('student_id', data.student_id);
        data.assignments.forEach((assignment, index) => {
            if (assignment.file) {
                formData.append(`assignments[${index}][assignment_id]`, assignment.assignment_id);
                formData.append(`assignments[${index}][file]`, assignment.file);
            }
        });

        try {
            await axios.post(store().url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            window.location.reload();
        } catch (error) {
            console.error('提交失败:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="作品提交" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">作品提交</h1>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 p-4 text-green-800">{success}</div>
                )}

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
                )}

                <div className="rounded-md border p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 年份选择 */}
                        <div className="space-y-2">
                            <Label htmlFor="year">年份</Label>
                            <Select onValueChange={handleYearChange} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="请选择年份" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}年
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 学生选择 */}
                        <div className="space-y-2">
                            <Label htmlFor="student_id">学生姓名</Label>
                            {loading && students.length === 0 ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select
                                    value={data.student_id}
                                    onValueChange={(value) => setData('student_id', value)}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={students.length === 0 ? "请先选择年份" : "请选择学生"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                {student.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* 课时选择 */}
                        <div className="space-y-2">
                            <Label htmlFor="lesson">课时</Label>
                            {loading && lessons.length === 0 ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select onValueChange={handleLessonChange} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={lessons.length === 0 ? "请先选择年份" : "请选择课时"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lessons.map((lesson) => (
                                            <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                                {lesson.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* 作业上传区域 */}
                        <div className="space-y-4">
                            <Label>作业列表</Label>
                            {loading && assignments.length === 0 ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : assignments.length > 0 ? (
                                <div className="space-y-4">
                                    {assignments.map((assignment, index) => (
                                        <div key={assignment.id} className="rounded-lg border p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium">{assignment.name}</h3>
                                                <Badge variant="outline">{assignment.upload_type.name}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>
                                                    允许的文件类型:{' '}
                                                    {assignment.upload_type.extensions.join(', ')}
                                                </p>
                                                <p>
                                                    最大文件大小:{' '}
                                                    {formatFileSize(assignment.upload_type.max_size)}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>上传文件</Label>
                                                <Input
                                                    type="file"
                                                    accept={assignment.upload_type.extensions.map(ext => `.${ext}`).join(',')}
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            index,
                                                            e.target.files?.[0] || null
                                                        )
                                                    }
                                                />
                                                {data.assignments[index]?.file && (
                                                    <p className="text-sm text-green-600">
                                                        已选择:{' '}
                                                        {data.assignments[index].file.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    {lessons.length === 0 ? "请先选择年份和课时" : "该课时暂无作业"}
                                </div>
                            )}
                        </div>

                        {/* 提交按钮 */}
                        {assignments.length > 0 && (
                            <Button type="submit" disabled={processing} className="w-full">
                                {processing ? '提交中...' : '提交作品'}
                            </Button>
                        )}
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
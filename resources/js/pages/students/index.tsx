import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index, store, update, destroy } from '@/routes/students';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '学生管理',
        href: index().url,
    },
];

interface Student {
    id: number;
    name: string;
    grade: number;
    class: number;
    year: number;
    created_at: string;
}

type PageProps = {
    students: Student[];
    success?: string;
};

type StudentFormData = {
    name: string;
    grade: string;
    class: string;
    year: string;
};

export default function StudentIndex() {
    const { students, success } = usePage<PageProps>().props;

    // 模态框状态
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);

    // 表单状态
    const { data, setData, processing, errors, reset, clearErrors } =
        useForm<StudentFormData>({
            name: '',
            grade: '',
            class: '',
            year: '',
        });

    const grades = [
        { value: 1, label: '一年级' },
        { value: 2, label: '二年级' },
        { value: 3, label: '三年级' },
        { value: 4, label: '四年级' },
        { value: 5, label: '五年级' },
        { value: 6, label: '六年级' },
    ];

    const gradeMap: Record<number, string> = {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
    };

    // 打开创建模态框
    const openCreateModal = () => {
        clearErrors();
        reset();
        setData('year', new Date().getFullYear().toString());
        setIsCreateModalOpen(true);
    };

    // 打开编辑模态框
    const openEditModal = (student: Student) => {
        clearErrors();
        setSelectedStudent(student);
        setData({
            name: student.name,
            grade: student.grade.toString(),
            class: student.class.toString(),
            year: student.year.toString(),
        });
        setIsEditModalOpen(true);
    };

    // 打开删除确认模态框
    const openDeleteModal = (id: number) => {
        setDeletingStudentId(id);
        setIsDeleteModalOpen(true);
    };

    // 提交创建表单
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(store().url, data);
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    // 提交编辑表单
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudent) {
            router.put(update(selectedStudent.id).url, data);
            setIsEditModalOpen(false);
            setSelectedStudent(null);
            reset();
            clearErrors();
        }
    };

    // 确认删除
    const handleDelete = () => {
        if (deletingStudentId) {
            router.delete(destroy(deletingStudentId).url);
            setIsDeleteModalOpen(false);
            setDeletingStudentId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="学生管理" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">学生管理</h1>
                        <p className="text-muted-foreground">管理所有学生信息</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 size-4" />
                        添加学生
                    </Button>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
                        {success}
                    </div>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>姓名</TableHead>
                                <TableHead>年级</TableHead>
                                <TableHead>班级</TableHead>
                                <TableHead>年份</TableHead>
                                <TableHead>创建时间</TableHead>
                                <TableHead className="text-right">
                                    操作
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student: Student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">
                                        #{student.id}
                                    </TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {gradeMap[student.grade] || '未知'}年级
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{student.class}班</TableCell>
                                    <TableCell>{student.year}年</TableCell>
                                    <TableCell>
                                        {new Date(student.created_at).toLocaleDateString(
                                            'zh-CN',
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(student)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteModal(student.id)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {students.length === 0 && (
                    <div className="rounded-lg border border-dashed p-12 text-center">
                        <p className="text-muted-foreground">
                            暂无学生数据，点击上方按钮添加第一个学生
                        </p>
                    </div>
                )}
            </div>

            {/* 创建学生模态框 */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>添加学生</DialogTitle>
                        <DialogDescription>
                            填写学生信息以创建新的学生记录
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">姓名</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="请输入学生姓名"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grade">年级</Label>
                            <Select
                                value={data.grade}
                                onValueChange={(value) => setData('grade', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择年级" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grades.map((grade) => (
                                        <SelectItem
                                            key={grade.value}
                                            value={grade.value.toString()}
                                        >
                                            {grade.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.grade && (
                                <p className="text-sm text-red-600">
                                    {errors.grade}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class">班级</Label>
                            <Input
                                id="class"
                                type="number"
                                min="1"
                                max="20"
                                value={data.class}
                                onChange={(e) =>
                                    setData('class', e.target.value)
                                }
                                placeholder="请输入班级号"
                            />
                            {errors.class && (
                                <p className="text-sm text-red-600">
                                    {errors.class}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">年份</Label>
                            <Input
                                id="year"
                                type="number"
                                min="2020"
                                max="2030"
                                value={data.year}
                                onChange={(e) =>
                                    setData('year', e.target.value)
                                }
                                placeholder="请输入年份"
                            />
                            {errors.year && (
                                <p className="text-sm text-red-600">
                                    {errors.year}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                取消
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? '创建中...' : '创建'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 编辑学生模态框 */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>编辑学生</DialogTitle>
                        <DialogDescription>
                            修改学生信息
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">姓名</Label>
                            <Input
                                id="edit-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="请输入学生姓名"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-grade">年级</Label>
                            <Select
                                value={data.grade}
                                onValueChange={(value) => setData('grade', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择年级" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grades.map((grade) => (
                                        <SelectItem
                                            key={grade.value}
                                            value={grade.value.toString()}
                                        >
                                            {grade.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.grade && (
                                <p className="text-sm text-red-600">
                                    {errors.grade}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-class">班级</Label>
                            <Input
                                id="edit-class"
                                type="number"
                                min="1"
                                max="20"
                                value={data.class}
                                onChange={(e) =>
                                    setData('class', e.target.value)
                                }
                                placeholder="请输入班级号"
                            />
                            {errors.class && (
                                <p className="text-sm text-red-600">
                                    {errors.class}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-year">年份</Label>
                            <Input
                                id="edit-year"
                                type="number"
                                min="2020"
                                max="2030"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder="请输入年份"
                            />
                            {errors.year && (
                                <p className="text-sm text-red-600">
                                    {errors.year}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                取消
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? '保存中...' : '保存'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 删除确认模态框 */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>确认删除</DialogTitle>
                        <DialogDescription>
                            确定要删除这个学生吗？此操作无法撤销。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            取消
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
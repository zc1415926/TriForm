import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Eye, FileUp, Filter, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
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
import { index, store, update, destroy, show } from '@/routes/students';
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
    total_score: number;
    total_submissions: number;
}

type PageProps = {
    students: Student[];
    years: number[];
    selectedYear: number | null;
    success?: string;
};

type StudentFormData = {
    name: string;
    grade: string;
    class: string;
    year: string;
};

type SortField = 'name' | 'grade' | 'class' | 'year' | 'total_score' | 'total_submissions';
type SortDirection = 'asc' | 'desc';

export default function StudentIndex() {
    const { students, years, selectedYear, success } = usePage<PageProps>().props;

    // 年份筛选状态
    const [filterYear, setFilterYear] = useState<number | 'all' | null>(
        selectedYear || 'all'
    );

    // 排序状态
    const [sortField, setSortField] = useState<SortField>('class');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // 排序后的学生列表
    const sortedStudents = useMemo(() => {
        return [...students].sort((a, b) => {
            let aValue: string | number = a[sortField];
            let bValue: string | number = b[sortField];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = (bValue as string).toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    }, [students, sortField, sortDirection]);

    // 处理排序
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // 排序图标
    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-1 size-3 opacity-50" />;
        }
        return sortDirection === 'asc' 
            ? <ArrowUp className="ml-1 size-3" />
            : <ArrowDown className="ml-1 size-3" />;
    };

    // 处理年份筛选
    const handleYearFilter = (value: string) => {
        if (value === 'all') {
            setFilterYear('all');
            router.get(index().url, {}, { preserveState: true });
        } else {
            const year = parseInt(value);
            setFilterYear(year);
            router.get(index().url, { year }, { preserveState: true });
        }
    };

    // 清除筛选
    const clearFilter = () => {
        setFilterYear('all');
        router.get(index().url, {}, { preserveState: true });
    };

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

    // 导入相关
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 下载模板
    const handleDownloadTemplate = () => {
        window.location.href = route('students.template.download');
    };

    // 导出
    const handleExport = () => {
        const yearParam = filterYear && filterYear !== 'all' ? `?year=${filterYear}` : '';
        window.location.href = route('students.export') + yearParam;
    };

    // 打开导入模态框
    const openImportModal = () => {
        setImportFile(null);
        setIsImportModalOpen(true);
    };

    // 选择文件
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
        }
    };

    // 提交导入
    const handleImportSubmit = () => {
        if (!importFile) return;

        const formData = new FormData();
        formData.append('file', importFile);

        router.post(route('students.import'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsImportModalOpen(false);
                setImportFile(null);
            },
        });
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
                    <div className="flex items-center gap-3">
                        {/* 年份筛选 */}
                        <div className="flex items-center gap-2">
                            <Select
                                value={filterYear?.toString() || 'all'}
                                onValueChange={handleYearFilter}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="mr-2 size-4" />
                                    <SelectValue placeholder="筛选年份" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部年份</SelectItem>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}年
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {filterYear !== 'all' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilter}
                                    title="清除筛选"
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </div>

                        {/* 导入导出按钮组 */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                                title="下载导入模板"
                            >
                                <Download className="mr-2 size-4" />
                                下载模板
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openImportModal}
                                title="导入学生"
                            >
                                <Upload className="mr-2 size-4" />
                                导入
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                title="导出学生"
                            >
                                <FileUp className="mr-2 size-4" />
                                导出
                            </Button>
                        </div>

                        <Button onClick={openCreateModal}>
                            <Plus className="mr-2 size-4" />
                            添加学生
                        </Button>
                    </div>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
                        {success}
                    </div>
                )}

                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-semibold text-left">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('name')}
                                    >
                                        姓名
                                        <SortIcon field="name" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold text-center">
                                    <button
                                        className="inline-flex items-center"
                                        onClick={() => handleSort('grade')}
                                    >
                                        年级
                                        <SortIcon field="grade" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold text-center">
                                    <button
                                        className="inline-flex items-center"
                                        onClick={() => handleSort('class')}
                                    >
                                        班级
                                        <SortIcon field="class" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold text-center">
                                    <button
                                        className="inline-flex items-center"
                                        onClick={() => handleSort('year')}
                                    >
                                        年份
                                        <SortIcon field="year" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold text-center">
                                    <button
                                        className="inline-flex items-center"
                                        onClick={() => handleSort('total_score')}
                                    >
                                        总分
                                        <SortIcon field="total_score" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold text-center">
                                    <button
                                        className="inline-flex items-center"
                                        onClick={() => handleSort('total_submissions')}
                                    >
                                        作业数
                                        <SortIcon field="total_submissions" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold text-right">
                                    操作
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedStudents.map((student: Student) => (
                                <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        <Link
                                            href={show(student.id).url}
                                            className="text-primary hover:underline hover:text-primary/80 transition-colors"
                                        >
                                            {student.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">{gradeMap[student.grade] || '未知'}</TableCell>
                                    <TableCell className="text-center">{student.class}</TableCell>
                                    <TableCell className="text-center">{student.year}</TableCell>
                                    <TableCell className="text-center font-semibold text-lg">{student.total_score}</TableCell>
                                    <TableCell className="text-center text-muted-foreground">{student.total_submissions}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={show(student.id).url}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    title="查看详情"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEditModal(student)}
                                                title="编辑"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => openDeleteModal(student.id)}
                                                title="删除"
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

                {sortedStudents.length === 0 && (
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

            {/* 导入模态框 */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>导入学生</DialogTitle>
                        <DialogDescription>
                            请先下载模板文件，按模板格式填写数据后上传。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <h4 className="mb-2 font-medium">导入说明：</h4>
                            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                <li>请使用下载的模板文件填写数据</li>
                                <li>年级：1-6 分别对应一至六年级</li>
                                <li>班级：1-20 之间的数字</li>
                                <li>年份：入学年份，如 2024</li>
                                <li>请勿修改表头，从第 2 行开始填写</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">选择文件</label>
                            <div className="flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full"
                                >
                                    {importFile ? importFile.name : '点击选择 Excel 文件'}
                                </Button>
                            </div>
                            {importFile && (
                                <p className="text-xs text-muted-foreground">
                                    文件大小：{(importFile.size / 1024).toFixed(1)} KB
                                </p>
                            )}
                        </div>

                        {errors.file && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                {errors.file}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsImportModalOpen(false)}
                        >
                            取消
                        </Button>
                        <Button
                            type="button"
                            onClick={handleImportSubmit}
                            disabled={!importFile || processing}
                        >
                            {processing ? '导入中...' : '开始导入'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
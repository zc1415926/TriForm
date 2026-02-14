import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Download, Eye, FileUp, Filter, Pencil, Plus, Trash2, Upload, X, Sparkles, GraduationCap, Users } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
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

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 页面标题区域 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">学生管理</h1>
                                <p className="text-blue-100">管理所有学生信息，查看学习进度和作业提交情况</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* 年份筛选 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-medium">年份筛选</span>
                            <Select
                                value={filterYear?.toString() || 'all'}
                                onValueChange={handleYearFilter}
                            >
                                <SelectTrigger className="w-[140px] rounded-lg border-gray-200">
                                    <SelectValue placeholder="全部年份" />
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
                                    size="icon"
                                    onClick={clearFilter}
                                    title="清除筛选"
                                    className="h-9 w-9 rounded-lg text-gray-400 hover:text-gray-600"
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </div>

                        <div className="w-px h-6 bg-gray-200" />

                        {/* 导入导出按钮组 */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                                title="下载导入模板"
                                className="rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            >
                                <Download className="mr-2 size-4 text-blue-500" />
                                下载模板
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openImportModal}
                                title="导入学生"
                                className="rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            >
                                <Upload className="mr-2 size-4 text-green-500" />
                                导入
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                title="导出学生"
                                className="rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            >
                                <FileUp className="mr-2 size-4 text-purple-500" />
                                导出
                            </Button>
                        </div>

                        <Button 
                            onClick={openCreateModal}
                            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                        >
                            <Plus className="mr-2 size-4" />
                            添加学生
                        </Button>
                    </div>
                </div>

                {success && (
                    <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-green-800 font-medium">{success}</span>
                    </div>
                )}

                <Card className="overflow-hidden shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                <span className="font-semibold text-gray-800">学生列表</span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    {sortedStudents.length} 人
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 hover:from-blue-50/50 hover:to-indigo-50/50">
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
                                                    className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                                    title="查看详情"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600"
                                                onClick={() => openEditModal(student)}
                                                title="编辑"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
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
                    </CardContent>
                </Card>

                {sortedStudents.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center bg-gray-50/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium mb-2">暂无学生数据</p>
                        <p className="text-gray-400 text-sm">点击上方"添加学生"按钮添加第一个学生</p>
                    </div>
                )}
            </div>

            {/* 创建学生模态框 */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl">
                    <DialogHeader className="pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Plus className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">添加学生</DialogTitle>
                                <DialogDescription className="text-gray-500">
                                    填写学生信息以创建新的学生记录
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-medium">姓名</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="请输入学生姓名"
                                className="rounded-xl h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grade" className="text-gray-700 font-medium">年级</Label>
                            <Select
                                value={data.grade}
                                onValueChange={(value) => setData('grade', value)}
                            >
                                <SelectTrigger className="rounded-xl h-11 border-gray-200">
                                    <SelectValue placeholder="选择年级" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
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
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.grade}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class" className="text-gray-700 font-medium">班级</Label>
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
                                className="rounded-xl h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.class && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.class}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year" className="text-gray-700 font-medium">年份</Label>
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
                                className="rounded-xl h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.year && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.year}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="pt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-xl h-11 px-6"
                            >
                                取消
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="rounded-xl h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                {processing ? '创建中...' : '创建'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 编辑学生模态框 */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl">
                    <DialogHeader className="pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                <Pencil className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">编辑学生</DialogTitle>
                                <DialogDescription className="text-gray-500">
                                    修改学生信息
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-gray-700 font-medium">姓名</Label>
                            <Input
                                id="edit-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="请输入学生姓名"
                                className="rounded-xl h-11 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-grade" className="text-gray-700 font-medium">年级</Label>
                            <Select
                                value={data.grade}
                                onValueChange={(value) => setData('grade', value)}
                            >
                                <SelectTrigger className="rounded-xl h-11 border-gray-200">
                                    <SelectValue placeholder="选择年级" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
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
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.grade}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-class" className="text-gray-700 font-medium">班级</Label>
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
                                className="rounded-xl h-11 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                            />
                            {errors.class && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.class}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-year" className="text-gray-700 font-medium">年份</Label>
                            <Input
                                id="edit-year"
                                type="number"
                                min="2020"
                                max="2030"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder="请输入年份"
                                className="rounded-xl h-11 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                            />
                            {errors.year && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.year}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="pt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-xl h-11 px-6"
                            >
                                取消
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="rounded-xl h-11 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                            >
                                {processing ? '保存中...' : '保存'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 删除确认模态框 */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader className="pb-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl">确认删除</DialogTitle>
                            <DialogDescription className="text-gray-500 mt-2">
                                确定要删除这个学生吗？此操作无法撤销。
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 rounded-xl h-11"
                        >
                            取消
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            className="flex-1 rounded-xl h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        >
                            删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 导入模态框 */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="sm:max-w-[520px] rounded-2xl">
                    <DialogHeader className="pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">导入学生</DialogTitle>
                                <DialogDescription className="text-gray-500">
                                    请先下载模板文件，按模板格式填写数据后上传
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-5 py-5">
                        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                            <h4 className="mb-3 font-semibold text-amber-800 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                导入说明
                            </h4>
                            <ul className="space-y-2 text-sm text-amber-700">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                    请使用下载的模板文件填写数据
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                    年级：1-6 分别对应一至六年级
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                    班级：1-20 之间的数字
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                    年份：入学年份，如 2024
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                    请勿修改表头，从第 2 行开始填写
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-gray-700 font-medium">选择文件</Label>
                            <div className="flex items-center gap-3">
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
                                    className="w-full rounded-xl h-11 border-dashed border-2 hover:border-green-400 hover:bg-green-50/50 transition-colors"
                                >
                                    <FileUp className="mr-2 size-4 text-green-500" />
                                    {importFile ? importFile.name : '点击选择 Excel 文件'}
                                </Button>
                            </div>
                            {importFile && (
                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                                    <CheckCircle2 className="w-4 h-4" />
                                    文件大小：{(importFile.size / 1024).toFixed(1)} KB
                                </div>
                            )}
                        </div>

                        {errors.file && (
                            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {errors.file}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsImportModalOpen(false)}
                            className="rounded-xl h-11 px-6"
                        >
                            取消
                        </Button>
                        <Button
                            type="button"
                            onClick={handleImportSubmit}
                            disabled={!importFile || processing}
                            className="rounded-xl h-11 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                        >
                            {processing ? '导入中...' : '开始导入'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, BookOpen, CheckCircle2, Copy, Download, Eye, FileUp, Filter, Pencil, Plus, Search, Sparkles, Trash2, Upload, X } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { LessonDetailDialog } from '@/components/lesson-detail-dialog';
import AppLayout from '@/layouts/app-layout';
import { index, create, edit, destroy } from '@/routes/lessons';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '课时管理',
        href: index().url,
    },
];

interface UploadType {
    id: number;
    name: string;
    description: string | null;
}

interface Lesson {
    id: number;
    name: string;
    year: string;
    is_active: boolean;
    content: string | null;
    created_at: string;
    assignments_count: number;
    assignments: {
        id: number;
        name: string;
        upload_type_id: number;
        is_required: boolean;
        is_published: boolean;
    }[];
}

type PageProps = {
    lessons: Lesson[];
    uploadTypes: UploadType[];
    years: string[];
    selectedYear: string | null;
    search: string | null;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    success?: string;
};

type SortField = 'id' | 'name' | 'year' | 'is_active' | 'assignments_count' | 'created_at';

export default function LessonIndex() {
    const { lessons, uploadTypes, years, selectedYear, search, sortField, sortDirection, success } = usePage<PageProps>().props;

    // 详情模态框状态
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    // 删除模态框状态
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);

    // 复制模态框状态
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [duplicatingLessonId, setDuplicatingLessonId] = useState<number | null>(null);

    // 导入模态框状态
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    // 本地状态
    const [filterYear, setFilterYear] = useState<string | 'all'>(selectedYear || 'all');
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [currentSortField, setCurrentSortField] = useState<SortField>((sortField as SortField) || 'name');
    const [currentSortDirection, setCurrentSortDirection] = useState<'asc' | 'desc'>(sortDirection || 'desc');

    // 打开详情模态框
    const openDetailModal = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setIsDetailModalOpen(true);
    };

    // 打开删除确认模态框
    const openDeleteModal = (id: number) => {
        setDeletingLessonId(id);
        setIsDeleteModalOpen(true);
    };

    // 确认删除
    const handleDeleteConfirm = () => {
        if (!deletingLessonId) return;
        router.delete(destroy(deletingLessonId).url);
        setIsDeleteModalOpen(false);
    };

    // 打开复制确认模态框
    const openDuplicateModal = (id: number) => {
        setDuplicatingLessonId(id);
        setIsDuplicateModalOpen(true);
    };

    // 确认复制
    const handleDuplicateConfirm = () => {
        if (!duplicatingLessonId) return;
        router.post(`/lessons/${duplicatingLessonId}/duplicate`);
        setIsDuplicateModalOpen(false);
    };

    // 处理年份筛选
    const handleYearFilter = (value: string) => {
        setFilterYear(value);
        const params: Record<string, string> = {};
        if (value !== 'all') params.year = value;
        if (searchQuery) params.search = searchQuery;
        router.get(index().url, params, { preserveState: true });
    };

    // 清除筛选
    const clearFilter = () => {
        setFilterYear('all');
        const params: Record<string, string> = {};
        if (searchQuery) params.search = searchQuery;
        router.get(index().url, params, { preserveState: true });
    };

    // 处理搜索
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (filterYear !== 'all') params.year = filterYear;
        if (searchQuery) params.search = searchQuery;
        router.get(index().url, params, { preserveState: true });
    };

    // 处理排序
    const handleSort = (field: SortField) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (currentSortField === field && currentSortDirection === 'asc') {
            direction = 'desc';
        }
        setCurrentSortField(field);
        setCurrentSortDirection(direction);

        const params: Record<string, string> = {
            sort: field,
            direction: direction,
        };
        if (filterYear !== 'all') params.year = filterYear;
        if (searchQuery) params.search = searchQuery;
        router.get(index().url, params, { preserveState: true });
    };

    // 排序图标
    const SortIcon = ({ field }: { field: SortField }) => {
        if (currentSortField !== field) {
            return <ArrowUpDown className="ml-1 size-3 opacity-50" />;
        }
        return currentSortDirection === 'asc'
            ? <ArrowUp className="ml-1 size-3" />
            : <ArrowDown className="ml-1 size-3" />;
    };

    // 导出课时
    const handleExport = (lessonId: number) => {
        window.location.href = `/lessons/${lessonId}/export`;
    };

    // 打开导入模态框
    const openImportModal = () => {
        setImportFile(null);
        setIsImportModalOpen(true);
    };

    // 选择导入文件
    const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        router.post('/lessons/import', formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsImportModalOpen(false);
                setImportFile(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="课时管理" />

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 页面标题区域 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">课时管理</h1>
                            <p className="text-emerald-100">管理所有课时内容、作业和附件</p>
                        </div>
                    </div>
                </div>

                {/* 操作栏 */}
                <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        {/* 年份筛选 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-medium">年份筛选</span>
                            <Select
                                value={filterYear}
                                onValueChange={handleYearFilter}
                            >
                                <SelectTrigger className="w-[140px] rounded-lg border-gray-200">
                                    <SelectValue placeholder="全部年份" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全部年份</SelectItem>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
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

                        {/* 搜索框 */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="搜索课时名称..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-[220px] pl-10 rounded-lg border-gray-200"
                                />
                            </div>
                            <Button type="submit" variant="outline" size="sm" className="rounded-lg">
                                搜索
                            </Button>
                        </form>

                        <div className="w-px h-6 bg-gray-200" />

                        {/* 导入按钮 */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={openImportModal}
                            title="导入课时"
                            className="rounded-lg border-gray-200 hover:bg-gray-50"
                        >
                            <Upload className="mr-2 size-4 text-green-500" />
                            导入
                        </Button>
                    </div>

                    <Link href={create().url}>
                        <Button className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all">
                            <Plus className="mr-2 h-4 w-4" />
                            添加课时
                        </Button>
                    </Link>
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
                                <BookOpen className="w-5 h-5 text-emerald-500" />
                                <span className="font-semibold text-gray-800">课时列表</span>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                    {lessons.length} 个
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 hover:from-emerald-50/50 hover:to-teal-50/50">
                                <TableHead className="font-semibold">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('id')}
                                    >
                                        ID
                                        <SortIcon field="id" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('name')}
                                    >
                                        课时名称
                                        <SortIcon field="name" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('year')}
                                    >
                                        年份
                                        <SortIcon field="year" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold text-center">
                                    <button
                                        className="inline-flex items-center"
                                        onClick={() => handleSort('assignments_count')}
                                    >
                                        作业数量
                                        <SortIcon field="assignments_count" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('is_active')}
                                    >
                                        状态
                                        <SortIcon field="is_active" />
                                    </button>
                                </TableHead>
                                <TableHead className="font-semibold">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        创建时间
                                        <SortIcon field="created_at" />
                                    </button>
                                </TableHead>
                                <TableHead className="text-right font-semibold">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lessons.map((lesson) => (
                                <TableRow key={lesson.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="text-gray-600">{lesson.id}</TableCell>
                                    <TableCell className="font-medium">
                                        <button
                                            onClick={() => openDetailModal(lesson)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                        >
                                            {lesson.name}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{lesson.year}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="border-gray-200 text-gray-700">
                                            {lesson.assignments_count}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {lesson.is_active ? (
                                            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                                <CheckCircle2 className="mr-1 size-3" />
                                                已启用
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                已禁用
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(lesson.created_at).toLocaleDateString('zh-CN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                                onClick={() => openDetailModal(lesson)}
                                                title="查看详情"
                                            >
                                                <Eye className="size-4" />
                                            </Button>
                                            <Link href={edit(lesson.id).url}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600"
                                                    title="编辑"
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-purple-50 hover:text-purple-600"
                                                onClick={() => openDuplicateModal(lesson.id)}
                                                title="复制课时"
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-cyan-50 hover:text-cyan-600"
                                                onClick={() => handleExport(lesson.id)}
                                                title="导出课时"
                                            >
                                                <Download className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                                                onClick={() => openDeleteModal(lesson.id)}
                                                title="删除"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {lessons.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <BookOpen className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">暂无课时数据</p>
                                            <p className="text-gray-400 text-sm mt-1">点击"添加课时"创建第一个课时</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>

                {/* 课时详情模态框 */}
                <LessonDetailDialog
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    lesson={selectedLesson}
                    uploadTypes={uploadTypes}
                />

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
                                    确定要删除这个课时吗？此操作不可撤销。
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
                                onClick={handleDeleteConfirm}
                                className="flex-1 rounded-xl h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                            >
                                删除
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 复制确认模态框 */}
                <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
                    <DialogContent className="sm:max-w-[420px] rounded-2xl">
                        <DialogHeader className="pb-4">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <Copy className="w-8 h-8 text-purple-600" />
                                </div>
                                <DialogTitle className="text-xl">复制课时</DialogTitle>
                                <DialogDescription className="text-gray-500 mt-2">
                                    确定要复制这个课时吗？将创建一个包含相同学时内容和作业的副本（默认禁用）。
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsDuplicateModalOpen(false)}
                                className="flex-1 rounded-xl h-11"
                            >
                                取消
                            </Button>
                            <Button 
                                onClick={handleDuplicateConfirm}
                                className="flex-1 rounded-xl h-11 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                            >
                                确认复制
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
                                    <DialogTitle className="text-xl">导入课时</DialogTitle>
                                    <DialogDescription className="text-gray-500">
                                        请上传从其他课时导出的 ZIP 文件
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
                                        仅支持从本系统导出的 ZIP 文件
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                        ZIP 文件包含课时内容、作业和附件
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                        导入后课时会自动添加"(导入)"后缀
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                        导入的课时默认处于禁用状态
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                        最大文件大小：50MB
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">选择 ZIP 文件</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept=".zip"
                                        id="import-file"
                                        className="hidden"
                                        onChange={handleImportFileSelect}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('import-file')?.click()}
                                        className="w-full rounded-xl h-11 border-dashed border-2 hover:border-green-400 hover:bg-green-50/50 transition-colors"
                                    >
                                        <FileUp className="mr-2 size-4 text-green-500" />
                                        {importFile ? importFile.name : '点击选择 ZIP 文件'}
                                    </Button>
                                </div>
                                {importFile && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4" />
                                        文件大小：{(importFile.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                )}
                            </div>
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
                                disabled={!importFile}
                                className="rounded-xl h-11 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                            >
                                开始导入
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Download, Eye, FileUp, Filter, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
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

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">课时管理</h1>
                    <div className="flex items-center gap-3">
                        {/* 年份筛选 */}
                        <div className="flex items-center gap-2">
                            <Select
                                value={filterYear}
                                onValueChange={handleYearFilter}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="mr-2 size-4" />
                                    <SelectValue placeholder="筛选年份" />
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
                                    size="sm"
                                    onClick={clearFilter}
                                    title="清除筛选"
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </div>

                        {/* 搜索框 */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="搜索课时名称..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-[200px] pl-9"
                                />
                            </div>
                            <Button type="submit" variant="outline" size="sm">
                                搜索
                            </Button>
                        </form>

                        {/* 导入按钮 */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={openImportModal}
                            title="导入课时"
                        >
                            <Upload className="mr-2 size-4" />
                            导入
                        </Button>

                        <Link href={create().url}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                添加课时
                            </Button>
                        </Link>
                    </div>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 p-4 text-green-800">
                        {success}
                    </div>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
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
                                <TableRow key={lesson.id}>
                                    <TableCell>{lesson.id}</TableCell>
                                    <TableCell className="font-medium">
                                        <button
                                            onClick={() => openDetailModal(lesson)}
                                            className="text-primary hover:underline"
                                        >
                                            {lesson.name}
                                        </button>
                                    </TableCell>
                                    <TableCell>{lesson.year}</TableCell>
                                    <TableCell>{lesson.assignments_count}</TableCell>
                                    <TableCell>
                                        {lesson.is_active ? (
                                            <Badge variant="default">已启用</Badge>
                                        ) : (
                                            <Badge variant="secondary">已禁用</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(lesson.created_at).toLocaleDateString('zh-CN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openDetailModal(lesson)}
                                                title="查看详情"
                                            >
                                                <Eye className="size-4" />
                                            </Button>
                                            <Link href={edit(lesson.id).url}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    title="编辑"
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openDuplicateModal(lesson.id)}
                                                title="复制课时"
                                            >
                                                <Copy className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleExport(lesson.id)}
                                                title="导出课时"
                                            >
                                                <Download className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* 课时详情模态框 */}
                <LessonDetailDialog
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    lesson={selectedLesson}
                    uploadTypes={uploadTypes}
                />

                {/* 删除确认模态框 */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>确认删除</DialogTitle>
                            <DialogDescription>
                                确定要删除这个课时吗？此操作不可撤销。
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                取消
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                删除
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 复制确认模态框 */}
                <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>复制课时</DialogTitle>
                            <DialogDescription>
                                确定要复制这个课时吗？将创建一个包含相同学时内容和作业的副本（默认禁用）。
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDuplicateModalOpen(false)}
                            >
                                取消
                            </Button>
                            <Button onClick={handleDuplicateConfirm}>
                                确认复制
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 导入模态框 */}
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>导入课时</DialogTitle>
                            <DialogDescription>
                                请上传从其他课时导出的 ZIP 文件。
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <h4 className="mb-2 font-medium">导入说明：</h4>
                                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                    <li>仅支持从本系统导出的 ZIP 文件</li>
                                    <li>ZIP 文件包含课时内容、作业和附件</li>
                                    <li>导入后课时会自动添加"(导入)"后缀</li>
                                    <li>导入的课时默认处于禁用状态</li>
                                    <li>最大文件大小：50MB</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">选择 ZIP 文件</label>
                                <div className="flex items-center gap-2">
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
                                        className="w-full"
                                    >
                                        {importFile ? importFile.name : '点击选择 ZIP 文件'}
                                    </Button>
                                </div>
                                {importFile && (
                                    <p className="text-xs text-muted-foreground">
                                        文件大小：{(importFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                )}
                            </div>
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
                                disabled={!importFile}
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

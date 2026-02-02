import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index, store, update, destroy } from '@/routes/lessons';
import RichTextEditor from '@/components/ui/tiptap-editor';
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

interface AssignmentData {
    name: string;
    upload_type_id: string;
    is_required: boolean;
    is_published: boolean;
    [key: string]: string | boolean; // 添加索引签名
}

type PageProps = {
    lessons: Lesson[];
    uploadTypes: UploadType[];
    success?: string;
};

type LessonFormData = {
    name: string;
    year: string;
    is_active: boolean;
    content: string;
    assignments: AssignmentData[];
};

export default function LessonIndex() {
    const { lessons, uploadTypes, success } = usePage<PageProps>().props;

    // 模态框状态
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);
    const [tempLessonId, setTempLessonId] = useState<string>('');

    // 表单状态
    const { data, setData, processing, errors, reset, clearErrors } =
        useForm<LessonFormData>({
            name: '',
            year: new Date().getFullYear().toString(),
            is_active: true,
            content: '',
            assignments: [],
        });

    // 添加作业
    const addAssignment = () => {
        setData('assignments', [
            ...data.assignments,
            {
                name: '',
                upload_type_id: '',
                is_required: true,
                is_published: true,
            },
        ]);
    };

    // 删除作业
    const removeAssignment = (index: number) => {
        setData(
            'assignments',
            data.assignments.filter((_, i) => i !== index)
        );
    };

    // 更新作业字段
    const updateAssignment = (
        index: number,
        field: keyof AssignmentData,
        value: string | boolean
    ) => {
        const updatedAssignments = [...data.assignments];
        updatedAssignments[index] = {
            ...updatedAssignments[index],
            [field]: value,
        };
        setData('assignments', updatedAssignments);
    };

    // 打开创建模态框
    const openCreateModal = () => {
        clearErrors();
        reset();
        setData('year', new Date().getFullYear().toString());
        setData('content', '');
        setData('assignments', []);
        // 生成临时 lessonId
        setTempLessonId(`temp_${Date.now()}`);
        setIsCreateModalOpen(true);
    };

    // 打开编辑模态框
    const openEditModal = (lesson: Lesson) => {
        clearErrors();
        setSelectedLesson(lesson);
        setData({
            name: lesson.name,
            year: lesson.year,
            is_active: lesson.is_active,
            content: lesson.content || '',
            assignments: lesson.assignments.map((assignment) => ({
                name: assignment.name,
                upload_type_id: assignment.upload_type_id.toString(),
                is_required: assignment.is_required,
                is_published: assignment.is_published,
            })),
        });
        setIsEditModalOpen(true);
    };

    // 打开删除确认模态框
    const openDeleteModal = (id: number) => {
        setDeletingLessonId(id);
        setIsDeleteModalOpen(true);
    };

    // 提交创建表单
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(store().url, data, {
            onSuccess: (page) => {
                // 如果有临时 lessonId，移动图片到正确位置
                if (tempLessonId) {
                    const newLessonId = (page.props as any).lessons?.[0]?.id;
                    if (newLessonId) {
                        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                        fetch('/api/upload/move-lesson-images', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken || '',
                            },
                            body: JSON.stringify({
                                year: data.year,
                                temp_lesson_id: tempLessonId,
                                real_lesson_id: newLessonId.toString(),
                            }),
                        });
                    }
                }
                setIsCreateModalOpen(false);
                setTempLessonId('');
            },
        });
    };

    // 提交编辑表单
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLesson) return;
        router.put(update(selectedLesson.id).url, data);
        setIsEditModalOpen(false);
    };

    // 确认删除
    const handleDeleteConfirm = () => {
        if (!deletingLessonId) return;
        router.delete(destroy(deletingLessonId).url);
        setIsDeleteModalOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="课时管理" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">课时管理</h1>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        添加课时
                    </Button>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 p-4 text-green-800">
                        {success}
                    </div>
                )}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>课时名称</TableHead>
                                <TableHead>年份</TableHead>
                                <TableHead>作业数量</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>创建时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lessons.map((lesson) => (
                                <TableRow key={lesson.id}>
                                    <TableCell>{lesson.id}</TableCell>
                                    <TableCell className="font-medium">{lesson.name}</TableCell>
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
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(lesson)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteModal(lesson.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
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

                {/* 创建课时模态框 */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>添加课时</DialogTitle>
                            <DialogDescription>创建新的课时</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">课时名称</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入课时名称"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
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
                                    onChange={(e) => setData('year', e.target.value)}
                                    placeholder="请输入年份"
                                />
                                {errors.year && (
                                    <p className="text-sm text-red-600">{errors.year}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">课时内容</Label>
                                <RichTextEditor
                                    content={data.content}
                                    onChange={(content) => setData('content', content)}
                                    year={data.year}
                                    lessonId={tempLessonId}
                                />
                                {errors.content && (
                                    <p className="text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="is_active" className="flex-1">
                                    是否启用
                                </Label>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            {/* 作业管理区域 */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>作业列表</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addAssignment}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        添加作业
                                    </Button>
                                </div>

                                {data.assignments.length > 0 && (
                                    <div className="space-y-3">
                                        {data.assignments.map((assignment, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border p-4 space-y-3"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="space-y-2">
                                                            <Label>作业名称</Label>
                                                            <Input
                                                                value={assignment.name}
                                                                onChange={(e) =>
                                                                    updateAssignment(index, 'name', e.target.value)
                                                                }
                                                                placeholder="请输入作业名称"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>作业类型</Label>
                                                            <Select
                                                                value={assignment.upload_type_id}
                                                                onValueChange={(value) =>
                                                                    updateAssignment(index, 'upload_type_id', value)
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="选择作业类型" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {uploadTypes.map((uploadType) => (
                                                                        <SelectItem
                                                                            key={uploadType.id}
                                                                            value={uploadType.id.toString()}
                                                                        >
                                                                            {uploadType.name}
                                                                            {uploadType.description && ` - ${uploadType.description}`}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={assignment.is_required}
                                                                    onCheckedChange={(checked) =>
                                                                        updateAssignment(index, 'is_required', checked)
                                                                    }
                                                                />
                                                                <Label className="cursor-pointer">是否必做</Label>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={assignment.is_published}
                                                                    onCheckedChange={(checked) =>
                                                                        updateAssignment(index, 'is_published', checked)
                                                                    }
                                                                />
                                                                <Label className="cursor-pointer">是否发布</Label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeAssignment(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {data.assignments.length === 0 && (
                                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                        暂无作业，点击上方按钮添加
                                    </div>
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

                {/* 编辑课时模态框 */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>编辑课时</DialogTitle>
                            <DialogDescription>修改课时信息</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">课时名称</Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入课时名称"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
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
                                    <p className="text-sm text-red-600">{errors.year}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-content">课时内容</Label>
                                <RichTextEditor
                                    content={data.content}
                                    onChange={(content) => setData('content', content)}
                                    year={data.year}
                                    lessonId={selectedLesson?.id}
                                />
                                {errors.content && (
                                    <p className="text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="edit-is_active" className="flex-1">
                                    是否启用
                                </Label>
                                <Switch
                                    id="edit-is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            {/* 作业管理区域 */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>作业列表</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addAssignment}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        添加作业
                                    </Button>
                                </div>

                                {data.assignments.length > 0 && (
                                    <div className="space-y-3">
                                        {data.assignments.map((assignment, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg border p-4 space-y-3"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="space-y-2">
                                                            <Label>作业名称</Label>
                                                            <Input
                                                                value={assignment.name}
                                                                onChange={(e) =>
                                                                    updateAssignment(index, 'name', e.target.value)
                                                                }
                                                                placeholder="请输入作业名称"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>作业类型</Label>
                                                            <Select
                                                                value={assignment.upload_type_id}
                                                                onValueChange={(value) =>
                                                                    updateAssignment(index, 'upload_type_id', value)
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="选择作业类型" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {uploadTypes.map((uploadType) => (
                                                                        <SelectItem
                                                                            key={uploadType.id}
                                                                            value={uploadType.id.toString()}
                                                                        >
                                                                            {uploadType.name}
                                                                            {uploadType.description && ` - ${uploadType.description}`}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="flex gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={assignment.is_required}
                                                                    onCheckedChange={(checked) =>
                                                                        updateAssignment(index, 'is_required', checked)
                                                                    }
                                                                />
                                                                <Label className="cursor-pointer">是否必做</Label>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={assignment.is_published}
                                                                    onCheckedChange={(checked) =>
                                                                        updateAssignment(index, 'is_published', checked)
                                                                    }
                                                                />
                                                                <Label className="cursor-pointer">是否发布</Label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeAssignment(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {data.assignments.length === 0 && (
                                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                        暂无作业，点击上方按钮添加
                                    </div>
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
                                确定要删除这个课时吗？此操作将同时删除该课时下的所有作业，且无法撤销。
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
            </div>
        </AppLayout>
    );
}
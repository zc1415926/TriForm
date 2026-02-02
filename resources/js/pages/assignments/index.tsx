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
import { index, store, update, destroy } from '@/routes/assignments';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '作业管理',
        href: index().url,
    },
];

interface UploadType {
    id: number;
    name: string;
    description: string | null;
}

interface Assignment {
    id: number;
    name: string;
    upload_type_id: number;
    is_required: boolean;
    is_published: boolean;
    created_at: string;
    upload_type: UploadType;
}

type PageProps = {
    assignments: Assignment[];
    uploadTypes: UploadType[];
    success?: string;
};

type AssignmentFormData = {
    name: string;
    upload_type_id: string;
    is_required: boolean;
    is_published: boolean;
};

export default function AssignmentIndex() {
    const { assignments, uploadTypes, success } = usePage<PageProps>().props;

    // 模态框状态
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [deletingAssignmentId, setDeletingAssignmentId] = useState<number | null>(null);

    // 表单状态
    const { data, setData, processing, errors, reset, clearErrors } =
        useForm<AssignmentFormData>({
            name: '',
            upload_type_id: '',
            is_required: false,
            is_published: false,
        });

    // 打开创建模态框
    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    // 打开编辑模态框
    const openEditModal = (assignment: Assignment) => {
        clearErrors();
        setSelectedAssignment(assignment);
        setData({
            name: assignment.name,
            upload_type_id: assignment.upload_type_id.toString(),
            is_required: assignment.is_required,
            is_published: assignment.is_published,
        });
        setIsEditModalOpen(true);
    };

    // 打开删除确认模态框
    const openDeleteModal = (id: number) => {
        setDeletingAssignmentId(id);
        setIsDeleteModalOpen(true);
    };

    // 提交创建表单
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(store().url, data);
        setIsCreateModalOpen(false);
    };

    // 提交编辑表单
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment) return;
        router.put(update(selectedAssignment.id).url, data);
        setIsEditModalOpen(false);
    };

    // 确认删除
    const handleDeleteConfirm = () => {
        if (!deletingAssignmentId) return;
        router.delete(destroy(deletingAssignmentId).url);
        setIsDeleteModalOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="作业管理" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">作业管理</h1>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        添加作业
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
                                <TableHead>作业名称</TableHead>
                                <TableHead>作业类型</TableHead>
                                <TableHead>是否必做</TableHead>
                                <TableHead>是否发布</TableHead>
                                <TableHead>创建时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell>{assignment.id}</TableCell>
                                    <TableCell className="font-medium">{assignment.name}</TableCell>
                                    <TableCell>{assignment.upload_type.name}</TableCell>
                                    <TableCell>
                                        {assignment.is_required ? (
                                            <Badge>必做</Badge>
                                        ) : (
                                            <Badge variant="outline">选做</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {assignment.is_published ? (
                                            <Badge variant="default">已发布</Badge>
                                        ) : (
                                            <Badge variant="secondary">未发布</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(assignment.created_at).toLocaleDateString('zh-CN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(assignment)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteModal(assignment.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {assignments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* 创建作业模态框 */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>添加作业</DialogTitle>
                            <DialogDescription>创建新的作业</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">作业名称</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入作业名称"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="upload_type_id">作业类型</Label>
                                <Select
                                    value={data.upload_type_id}
                                    onValueChange={(value) => setData('upload_type_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择作业类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uploadTypes.map((uploadType) => (
                                            <SelectItem key={uploadType.id} value={uploadType.id.toString()}>
                                                {uploadType.name}
                                                {uploadType.description && ` - ${uploadType.description}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.upload_type_id && (
                                    <p className="text-sm text-red-600">{errors.upload_type_id}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="is_required" className="flex-1">
                                    是否必做
                                </Label>
                                <Switch
                                    id="is_required"
                                    checked={data.is_required}
                                    onCheckedChange={(checked) => setData('is_required', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="is_published" className="flex-1">
                                    是否发布
                                </Label>
                                <Switch
                                    id="is_published"
                                    checked={data.is_published}
                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                />
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

                {/* 编辑作业模态框 */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>编辑作业</DialogTitle>
                            <DialogDescription>修改作业信息</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">作业名称</Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入作业名称"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-upload_type_id">作业类型</Label>
                                <Select
                                    value={data.upload_type_id}
                                    onValueChange={(value) => setData('upload_type_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择作业类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uploadTypes.map((uploadType) => (
                                            <SelectItem key={uploadType.id} value={uploadType.id.toString()}>
                                                {uploadType.name}
                                                {uploadType.description && ` - ${uploadType.description}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.upload_type_id && (
                                    <p className="text-sm text-red-600">{errors.upload_type_id}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="edit-is_required" className="flex-1">
                                    是否必做
                                </Label>
                                <Switch
                                    id="edit-is_required"
                                    checked={data.is_required}
                                    onCheckedChange={(checked) => setData('is_required', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="edit-is_published" className="flex-1">
                                    是否发布
                                </Label>
                                <Switch
                                    id="edit-is_published"
                                    checked={data.is_published}
                                    onCheckedChange={(checked) => setData('is_published', checked)}
                                />
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
                                确定要删除这个作业吗？此操作无法撤销。
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
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index, store, update, destroy } from '@/routes/upload-types';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '上传类型管理',
        href: index().url,
    },
];

interface UploadType {
    id: number;
    name: string;
    description: string | null;
    extensions: string[];
    max_size: number;
    created_at: string;
}

type PageProps = {
    uploadTypes: UploadType[];
    success?: string;
};

type UploadTypeFormData = {
    name: string;
    description: string;
    extensions: string;
    max_size: string;
};

export default function UploadTypeIndex() {
    const { uploadTypes, success } = usePage<PageProps>().props;

    // 模态框状态
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUploadType, setSelectedUploadType] = useState<UploadType | null>(null);
    const [deletingUploadTypeId, setDeletingUploadTypeId] = useState<number | null>(null);

    // 表单状态
    const { data, setData, processing, errors, reset, clearErrors } =
        useForm<UploadTypeFormData>({
            name: '',
            description: '',
            extensions: '',
            max_size: '50',
        });

    // 格式化文件大小
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // 解析扩展名字符串为数组
    const parseExtensions = (extString: string): string[] => {
        return extString
            .split(/[,，\s]+/)
            .map(ext => ext.trim())
            .filter(ext => ext.length > 0);
    };

    // 打开创建模态框
    const openCreateModal = () => {
        clearErrors();
        reset();
        setData('max_size', '50');
        setIsCreateModalOpen(true);
    };

    // 打开编辑模态框
    const openEditModal = (uploadType: UploadType) => {
        clearErrors();
        setSelectedUploadType(uploadType);
        setData({
            name: uploadType.name,
            description: uploadType.description || '',
            extensions: uploadType.extensions.join(', '),
            max_size: Math.round(uploadType.max_size / 1048576).toString(),
        });
        setIsEditModalOpen(true);
    };

    // 打开删除确认模态框
    const openDeleteModal = (id: number) => {
        setDeletingUploadTypeId(id);
        setIsDeleteModalOpen(true);
    };

    // 提交创建表单
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(store().url, {
            ...data,
            extensions: parseExtensions(data.extensions),
            max_size: Number(data.max_size) * 1048576,
        });
        setIsCreateModalOpen(false);
    };

    // 提交编辑表单
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUploadType) return;
        router.put(update(selectedUploadType.id).url, {
            ...data,
            extensions: parseExtensions(data.extensions),
            max_size: Number(data.max_size) * 1048576,
        });
        setIsEditModalOpen(false);
    };

    // 确认删除
    const handleDeleteConfirm = () => {
        if (!deletingUploadTypeId) return;
        router.delete(destroy(deletingUploadTypeId).url);
        setIsDeleteModalOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="上传类型管理" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">上传类型管理</h1>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        添加上传类型
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
                                <TableHead>名称</TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead>扩展名</TableHead>
                                <TableHead>最大文件大小</TableHead>
                                <TableHead>创建时间</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uploadTypes.map((uploadType) => (
                                <TableRow key={uploadType.id}>
                                    <TableCell>{uploadType.id}</TableCell>
                                    <TableCell className="font-medium">{uploadType.name}</TableCell>
                                    <TableCell>{uploadType.description || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {uploadType.extensions.map((ext) => (
                                                <Badge key={ext} variant="secondary">
                                                    {ext}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatFileSize(uploadType.max_size)}</TableCell>
                                    <TableCell>
                                        {new Date(uploadType.created_at).toLocaleDateString('zh-CN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(uploadType)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openDeleteModal(uploadType.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {uploadTypes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        暂无数据
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* 创建上传类型模态框 */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>添加上传类型</DialogTitle>
                            <DialogDescription>创建新的文件上传类型配置</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">名称</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入类型名称"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">描述</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="请输入描述（可选）"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="extensions">扩展名</Label>
                                <Textarea
                                    id="extensions"
                                    value={data.extensions}
                                    onChange={(e) => setData('extensions', e.target.value)}
                                    placeholder="请输入扩展名，用逗号分隔，如：jpg,png,gif"
                                    rows={3}
                                />
                                {errors.extensions && (
                                    <p className="text-sm text-red-600">{errors.extensions}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_size">最大文件大小（MB）</Label>
                                <Input
                                    id="max_size"
                                    type="number"
                                    min="1"
                                    max="5120"
                                    value={data.max_size}
                                    onChange={(e) => setData('max_size', e.target.value)}
                                    placeholder="请输入最大文件大小"
                                />
                                <p className="text-xs text-muted-foreground">
                                    当前值: {data.max_size} MB
                                </p>
                                {errors.max_size && (
                                    <p className="text-sm text-red-600">{errors.max_size}</p>
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

                {/* 编辑上传类型模态框 */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>编辑上传类型</DialogTitle>
                            <DialogDescription>修改上传类型配置</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">名称</Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入类型名称"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">描述</Label>
                                <Textarea
                                    id="edit-description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="请输入描述（可选）"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-extensions">扩展名</Label>
                                <Textarea
                                    id="edit-extensions"
                                    value={data.extensions}
                                    onChange={(e) => setData('extensions', e.target.value)}
                                    placeholder="请输入扩展名，用逗号分隔，如：jpg,png,gif"
                                    rows={3}
                                />
                                {errors.extensions && (
                                    <p className="text-sm text-red-600">{errors.extensions}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-max_size">最大文件大小（MB）</Label>
                                <Input
                                    id="edit-max_size"
                                    type="number"
                                    min="1"
                                    max="5120"
                                    value={data.max_size}
                                    onChange={(e) => setData('max_size', e.target.value)}
                                    placeholder="请输入最大文件大小"
                                />
                                <p className="text-xs text-muted-foreground">
                                    当前值: {data.max_size} MB
                                </p>
                                {errors.max_size && (
                                    <p className="text-sm text-red-600">{errors.max_size}</p>
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
                                确定要删除这个上传类型吗？此操作无法撤销。
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
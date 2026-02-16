import { Head, router, usePage, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, FileType, Pencil, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
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

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 页面标题区域 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <FileType className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">上传类型管理</h1>
                            <p className="text-pink-100">配置文件上传类型、扩展名和大小限制</p>
                        </div>
                    </div>
                </div>

                {/* 操作栏 */}
                <div className="flex items-center justify-end bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <Button 
                        onClick={openCreateModal}
                        className="rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        添加上传类型
                    </Button>
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
                                <Upload className="w-5 h-5 text-rose-500" />
                                <span className="font-semibold text-gray-800">上传类型列表</span>
                                <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                                    {uploadTypes.length} 个
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-rose-50/50 to-pink-50/50 hover:from-rose-50/50 hover:to-pink-50/50">
                                <TableHead className="font-semibold">ID</TableHead>
                                <TableHead className="font-semibold">名称</TableHead>
                                <TableHead className="font-semibold">描述</TableHead>
                                <TableHead className="font-semibold">扩展名</TableHead>
                                <TableHead className="font-semibold">最大文件大小</TableHead>
                                <TableHead className="font-semibold">创建时间</TableHead>
                                <TableHead className="text-right font-semibold">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uploadTypes.map((uploadType) => (
                                <TableRow key={uploadType.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="text-gray-600">{uploadType.id}</TableCell>
                                    <TableCell className="font-medium text-gray-800">{uploadType.name}</TableCell>
                                    <TableCell className="text-gray-500">{uploadType.description || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {uploadType.extensions.map((ext) => (
                                                <Badge key={ext} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    .{ext}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{formatFileSize(uploadType.max_size)}</TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(uploadType.created_at).toLocaleDateString('zh-CN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600"
                                                onClick={() => openEditModal(uploadType)}
                                                title="编辑"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                                                onClick={() => openDeleteModal(uploadType.id)}
                                                title="删除"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {uploadTypes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <FileType className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">暂无上传类型</p>
                                            <p className="text-gray-400 text-sm mt-1">点击"添加上传类型"创建第一个配置</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>

                {/* 创建上传类型模态框 */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader className="pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl">添加上传类型</DialogTitle>
                                    <DialogDescription className="text-gray-500">
                                        创建新的文件上传类型配置
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700 font-medium">名称</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入类型名称"
                                    className="rounded-xl h-11 border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-700 font-medium">描述</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="请输入描述（可选）"
                                    rows={3}
                                    className="rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="extensions" className="text-gray-700 font-medium">扩展名</Label>
                                <Textarea
                                    id="extensions"
                                    value={data.extensions}
                                    onChange={(e) => setData('extensions', e.target.value)}
                                    placeholder="请输入扩展名，用逗号分隔，如：jpg,png,gif"
                                    rows={3}
                                    className="rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                                />
                                {errors.extensions && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                                        {errors.extensions}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_size" className="text-gray-700 font-medium">最大文件大小（MB）</Label>
                                <Input
                                    id="max_size"
                                    type="number"
                                    min="1"
                                    max="5120"
                                    value={data.max_size}
                                    onChange={(e) => setData('max_size', e.target.value)}
                                    placeholder="请输入最大文件大小"
                                    className="rounded-xl h-11 border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                                />
                                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                    当前值: {data.max_size} MB
                                </p>
                                {errors.max_size && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                                        {errors.max_size}
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
                                    className="rounded-xl h-11 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                                >
                                    {processing ? '创建中...' : '创建'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 编辑上传类型模态框 */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl">
                        <DialogHeader className="pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <Pencil className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl">编辑上传类型</DialogTitle>
                                    <DialogDescription className="text-gray-500">
                                        修改上传类型配置
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-5 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-gray-700 font-medium">名称</Label>
                                <Input
                                    id="edit-name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="请输入类型名称"
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
                                <Label htmlFor="edit-description" className="text-gray-700 font-medium">描述</Label>
                                <Textarea
                                    id="edit-description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="请输入描述（可选）"
                                    rows={3}
                                    className="rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-extensions" className="text-gray-700 font-medium">扩展名</Label>
                                <Textarea
                                    id="edit-extensions"
                                    value={data.extensions}
                                    onChange={(e) => setData('extensions', e.target.value)}
                                    placeholder="请输入扩展名，用逗号分隔，如：jpg,png,gif"
                                    rows={3}
                                    className="rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                />
                                {errors.extensions && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                                        {errors.extensions}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-max_size" className="text-gray-700 font-medium">最大文件大小（MB）</Label>
                                <Input
                                    id="edit-max_size"
                                    type="number"
                                    min="1"
                                    max="5120"
                                    value={data.max_size}
                                    onChange={(e) => setData('max_size', e.target.value)}
                                    placeholder="请输入最大文件大小"
                                    className="rounded-xl h-11 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                                />
                                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                    当前值: {data.max_size} MB
                                </p>
                                {errors.max_size && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                                        {errors.max_size}
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
                                    确定要删除这个上传类型吗？此操作无法撤销。
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
            </div>
        </AppLayout>
    );
}
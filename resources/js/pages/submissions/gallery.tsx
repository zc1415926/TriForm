import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, FileText, Filter, Grid3X3, LayoutGrid, List, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { StlModelViewer } from '@/components/stl-model-viewer';
import AppLayout from '@/layouts/app-layout';
import { index as submissionsIndex } from '@/routes/submissions';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: '作品提交',
        href: submissionsIndex().url,
    },
    {
        title: '作品广场',
        href: '',
    },
];

interface Student {
    id: number;
    name: string;
    year: string;
}

interface Assignment {
    id: number;
    name: string;
    lesson: {
        id: number;
        name: string;
    } | null;
}

interface Submission {
    id: number;
    student_id: number;
    assignment_id: number;
    file_path: string;
    file_name: string;
    file_size: number;
    preview_image_path: string | null;
    status: string;
    score: number | null;
    created_at: string;
    student: Student;
    assignment: Assignment;
}

type ViewMode = 'grid' | 'list' | 'masonry';
type SortField = 'created_at' | 'score' | 'file_name';

export default function SubmissionGallery() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // 分页状态
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // 筛选和搜索状态
    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // 排序状态
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // 视图模式
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // 图片预览模态框状态
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    // 3D模型预览模态框状态
    const [modelPreviewOpen, setModelPreviewOpen] = useState(false);
    const [modelPreviewData, setModelPreviewData] = useState<{
        fileUrl: string;
        fileName: string;
    } | null>(null);

    // 加载年份列表
    useEffect(() => {
        loadYears();
    }, []);

    // 滚动监听 - 无限滚动
    useEffect(() => {
        const handleScroll = () => {
            // 检查是否滚动到底部（距离底部 100px 时触发加载）
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;

            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, hasMore, loadingMore, selectedYear, sortField, sortDirection]);

    // 加载作品（筛选条件变化时重置分页）
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        loadSubmissions(1, true);
    }, [selectedYear, sortField, sortDirection]);

    const loadYears = async () => {
        try {
            const response = await axios.get('/api/submissions/students-by-year');
            // 从学生数据中提取年份
            const uniqueYears = [...new Set(response.data.map((s: { year: string }) => s.year))].sort().reverse() as string[];
            setYears(uniqueYears);
        } catch (error) {
            console.error('加载年份失败:', error);
        }
    };

    const loadSubmissions = async (pageNum: number = 1, reset: boolean = false) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();
            if (selectedYear !== 'all') params.append('year', selectedYear);
            if (searchQuery) params.append('search', searchQuery);
            params.append('sort', sortField);
            params.append('direction', sortDirection);
            params.append('page', pageNum.toString());
            params.append('per_page', '20');

            const response = await axios.get(`/api/submissions/all?${params.toString()}`);
            const { data, meta } = response.data;

            if (reset || pageNum === 1) {
                setSubmissions(data);
            } else {
                setSubmissions(prev => [...prev, ...data]);
            }

            setHasMore(meta.has_more);
            setPage(meta.current_page);
        } catch (error) {
            console.error('加载作品失败:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 加载更多
    const loadMore = () => {
        if (!loadingMore && hasMore) {
            loadSubmissions(page + 1);
        }
    };

    // 处理搜索
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setHasMore(true);
        loadSubmissions(1, true);
    };

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

    // 清除筛选
    const clearFilters = () => {
        setSelectedYear('all');
        setSearchQuery('');
        setSortField('created_at');
        setSortDirection('desc');
    };

    

    // 判断文件类型
    const getFileType = (fileName: string): 'image' | 'model' | 'other' => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        const modelExtensions = ['stl', 'obj'];

        if (imageExtensions.includes(ext)) {
            return 'image';
        }
        if (modelExtensions.includes(ext)) {
            return 'model';
        }
        return 'other';
    };

    // 点击图片区域
    const handleImageClick = (e: React.MouseEvent, submission: Submission) => {
        e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击

        const fileType = getFileType(submission.file_name);

        if (fileType === 'image') {
            // 打开图片预览模态框
            setImagePreviewUrl(`/storage/${submission.file_path}`);
            setImagePreviewOpen(true);
        } else if (fileType === 'model') {
            // 打开3D模型预览模态框
            setModelPreviewData({
                fileUrl: `/storage/${submission.file_path}`,
                fileName: submission.file_name,
            });
            setModelPreviewOpen(true);
        } else {
            // 其他文件类型，直接下载或查看详情
            window.open(`/storage/${submission.file_path}`, '_blank');
        }
    };

    // 获取显示的图片路径
    const getDisplayImagePath = (submission: Submission): string | null => {
        // 如果有缩略图，使用缩略图
        if (submission.preview_image_path) {
            return `/storage/${submission.preview_image_path}`;
        }
        
        // 如果是图片类型且没有缩略图，使用原图
        const fileType = getFileType(submission.file_name);
        if (fileType === 'image') {
            return `/storage/${submission.file_path}`;
        }
        
        return null;
    };

    // 图片预览框的显示样式
    const getImagePreviewStyle = () => {
        if (!imagePreviewUrl) return {};
        
        const img = new Image();
        img.src = imagePreviewUrl;
        
        // 获取窗口尺寸
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 图片加载完成后计算
        return {
            maxWidth: windowWidth * 0.8 + 'px',
            maxHeight: windowHeight * 0.8 + 'px',
            width: 'auto',
            height: 'auto',
        };
    };

    const getScoreBadge = (score: number | null) => {
        if (score === null) {
            return <span className="text-muted-foreground text-sm">未评分</span>;
        }
        return (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-600 text-white hover:bg-blue-600/80">
                {score} 分
            </span>
        );
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="作品广场" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">作品广场</h1>
                        <div className="flex items-center gap-2">
                            {/* 视图切换 */}
                            <div className="flex items-center rounded-lg border bg-muted/50 p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setViewMode('grid')}
                                    title="网格视图"
                                >
                                    <Grid3X3 className="size-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setViewMode('list')}
                                    title="列表视图"
                                >
                                    <List className="size-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setViewMode('masonry')}
                                    title="瀑布流视图"
                                >
                                    <LayoutGrid className="size-4" />
                                </Button>
                            </div>
                            <Button onClick={loadSubmissions} disabled={loading} variant="outline">
                                刷新
                            </Button>
                        </div>
                    </div>

                    {/* 筛选工具栏 */}
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
                        {/* 年份筛选 */}
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-muted-foreground" />
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[140px]">
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
                        </div>

                        {/* 搜索框 */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="搜索学生姓名..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-[200px] pl-9"
                                />
                            </div>
                            <Button type="submit" variant="outline" size="sm">
                                搜索
                            </Button>
                        </form>

                        <div className="h-6 w-px bg-border" />

                        {/* 排序 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">排序:</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('created_at')}
                                className={sortField === 'created_at' ? 'bg-muted' : ''}
                            >
                                提交时间
                                <SortIcon field="created_at" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('score')}
                                className={sortField === 'score' ? 'bg-muted' : ''}
                            >
                                分数
                                <SortIcon field="score" />
                            </Button>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            {/* 统计 */}
                            <span className="text-sm text-muted-foreground">
                                共 {submissions.length} 个作品
                            </span>
                            {(selectedYear !== 'all' || searchQuery) && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="mr-1 size-3" />
                                    清除筛选
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">加载中...</div>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">暂无作品</div>
                    </div>
                ) : viewMode === 'grid' ? (
                    // 网格视图
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {submissions.map((submission) => (
                            <Card
                                key={submission.id}
                                className="group overflow-hidden transition-all hover:shadow-lg py-0 pt-0"
                            >
                                {/* 作品截图 */}
                                <div
                                    className="relative aspect-[4/3] bg-muted cursor-pointer"
                                    onClick={(e) => handleImageClick(e, submission)}
                                >
                                    {getDisplayImagePath(submission) ? (
                                        <img
                                            src={getDisplayImagePath(submission)!}
                                            alt={submission.file_name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <FileText className="size-12 mx-auto mb-2 opacity-50" />
                                                <div className="text-sm">{submission.file_name}</div>
                                            </div>
                                        </div>
                                    )}
                                    {/* 点击提示 */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {getFileType(submission.file_name) === 'image' ? '查看大图' :
                                             getFileType(submission.file_name) === 'model' ? '3D预览' : '打开文件'}
                                        </span>
                                    </div>
                                </div>

                                <CardHeader className="p-2 pb-1 pt-0">
                                    <div className="text-sm font-semibold text-foreground truncate">
                                        {submission.assignment.lesson?.name || '未知课时'}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {submission.assignment.name}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-2 pt-0 pb-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                                {submission.student.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium truncate">{submission.student.name}</div>
                                                <div className="text-xs text-muted-foreground">{submission.student.year}年</div>
                                            </div>
                                        </div>
                                        {getScoreBadge(submission.score)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : viewMode === 'list' ? (
                    // 列表视图
                    <div className="space-y-3">
                        {submissions.map((submission) => (
                            <Card
                                key={submission.id}
                                className="group transition-all hover:shadow-md cursor-pointer"
                                onClick={(e) => handleImageClick(e, submission)}
                            >
                                <div className="flex items-center gap-4 p-4">
                                    {/* 缩略图 */}
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {getDisplayImagePath(submission) ? (
                                            <img
                                                src={getDisplayImagePath(submission)!}
                                                alt={submission.file_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <FileText className="size-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* 信息 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium">{submission.assignment.lesson?.name || '未知课时'}</div>
                                        <div className="text-sm text-muted-foreground">{submission.assignment.name}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {submission.student.name} · {submission.student.year}年 · {formatFileSize(submission.file_size)}
                                        </div>
                                    </div>

                                    {/* 分数和时间 */}
                                    <div className="text-right shrink-0">
                                        <div className="mb-1">{getScoreBadge(submission.score)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(submission.created_at).toLocaleDateString('zh-CN')}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    // 瀑布流视图
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
                        {submissions.map((submission) => (
                            <Card
                                key={submission.id}
                                className="group overflow-hidden transition-all hover:shadow-lg py-0 pt-0 break-inside-avoid"
                            >
                                {/* 作品截图 - 保持原始比例 */}
                                <div
                                    className="relative bg-muted cursor-pointer"
                                    onClick={(e) => handleImageClick(e, submission)}
                                >
                                    {getDisplayImagePath(submission) ? (
                                        <img
                                            src={getDisplayImagePath(submission)!}
                                            alt={submission.file_name}
                                            className="w-full h-auto transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex aspect-[4/3] w-full items-center justify-center text-muted-foreground">
                                            <div className="text-center">
                                                <FileText className="size-12 mx-auto mb-2 opacity-50" />
                                                <div className="text-sm">{submission.file_name}</div>
                                            </div>
                                        </div>
                                    )}
                                    {/* 点击提示 */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {getFileType(submission.file_name) === 'image' ? '查看大图' :
                                             getFileType(submission.file_name) === 'model' ? '3D预览' : '打开文件'}
                                        </span>
                                    </div>
                                </div>

                                <CardHeader className="p-2 pb-1 pt-0">
                                    <div className="text-sm font-semibold text-foreground truncate">
                                        {submission.assignment.lesson?.name || '未知课时'}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {submission.assignment.name}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-2 pt-0 pb-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                                {submission.student.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium truncate">{submission.student.name}</div>
                                                <div className="text-xs text-muted-foreground">{submission.student.year}年</div>
                                            </div>
                                        </div>
                                        {getScoreBadge(submission.score)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* 加载更多提示 */}
                {loadingMore && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            加载更多...
                        </div>
                    </div>
                )}

                {!hasMore && submissions.length > 0 && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        已经加载全部 {submissions.length} 条作品
                    </div>
                )}
            </div>

            {/* 图片预览模态框 */}
            <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
                <DialogContent className="w-fit !max-w-[95vw] !max-h-[90vh] overflow-hidden p-0">
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>图片预览</DialogTitle>
                            <DialogDescription>点击图片查看大图</DialogDescription>
                        </DialogHeader>
                    </VisuallyHidden>
                    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-black/5 p-6">
                        <img
                            src={imagePreviewUrl}
                            alt="预览图"
                            className="max-w-[95vw] max-h-[80vh] object-contain rounded-lg shadow-lg"
                            style={{
                                maxWidth: '95vw',
                                maxHeight: '80vh',
                                width: 'auto',
                                height: 'auto',
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* 3D模型预览模态框 */}
            <Dialog open={modelPreviewOpen} onOpenChange={setModelPreviewOpen}>
                <DialogContent className="w-fit !max-w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>3D模型预览 - {modelPreviewData?.fileName}</DialogTitle>
                        <DialogDescription className="sr-only">
                            使用鼠标左键旋转，右键平移，滚轮缩放
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center min-h-[500px]">
                        {modelPreviewData && (
                            <div className="aspect-[4/3] min-h-[400px] lg:min-h-[500px]">
                                <StlModelViewer
                                    fileUrl={modelPreviewData.fileUrl}
                                    fileName={modelPreviewData.fileName}
                                    onError={(error) => {
                                        console.error('3D模型加载失败:', error);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
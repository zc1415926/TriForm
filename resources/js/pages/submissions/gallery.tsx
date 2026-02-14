import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { 
    ArrowDown, 
    ArrowUp, 
    ArrowUpDown, 
    FileText, 
    Filter, 
    Grid3X3, 
    LayoutGrid, 
    List, 
    Search, 
    X,
    Sparkles,
    Image as ImageIcon,
    Box,
    Layers,
    Palette,
    Trophy,
    Star,
    Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { VoxModelViewer } from '@/components/vox-model-viewer';
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

// 获取文件类型的友好显示
const getFileTypeInfo = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const modelExtensions = ['stl', 'obj'];

    if (imageExtensions.includes(ext)) {
        return { type: 'image' as const, icon: ImageIcon, label: '图片', color: 'bg-pink-100 text-pink-600' };
    }
    if (modelExtensions.includes(ext)) {
        return { type: 'model' as const, icon: Box, label: '3D模型', color: 'bg-blue-100 text-blue-600' };
    }
    if (ext === 'vox') {
        return { type: 'vox' as const, icon: Layers, label: 'VOX', color: 'bg-purple-100 text-purple-600' };
    }
    return { type: 'other' as const, icon: FileText, label: '文件', color: 'bg-gray-100 text-gray-600' };
};

// 获取分数的彩虹色
const getScoreColor = (score: number | null): string => {
    if (score === null) return 'bg-gray-100 text-gray-500';
    if (score >= 10) return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'; // G
    if (score >= 8) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';    // A
    if (score >= 6) return 'bg-gradient-to-r from-green-400 to-green-600 text-white';  // B
    if (score >= 4) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'; // C
    return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';                    // O
};

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

    // VOX模型预览模态框状态
    const [voxPreviewOpen, setVoxPreviewOpen] = useState(false);
    const [voxPreviewData, setVoxPreviewData] = useState<{
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

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            loadSubmissions(page + 1);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setHasMore(true);
        loadSubmissions(1, true);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-1 size-3 opacity-50" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp className="ml-1 size-3" />
            : <ArrowDown className="ml-1 size-3" />;
    };

    const clearFilters = () => {
        setSelectedYear('all');
        setSearchQuery('');
        setSortField('created_at');
        setSortDirection('desc');
    };

    const getDisplayImagePath = (submission: Submission): string | null => {
        if (submission.preview_image_path) {
            return `/storage/${submission.preview_image_path}`;
        }
        
        const fileTypeInfo = getFileTypeInfo(submission.file_name);
        if (fileTypeInfo.type === 'image') {
            return `/storage/${submission.file_path}`;
        }
        
        return null;
    };

    const handleImageClick = (e: React.MouseEvent, submission: Submission) => {
        e.stopPropagation();
        const fileTypeInfo = getFileTypeInfo(submission.file_name);

        if (fileTypeInfo.type === 'image') {
            setImagePreviewUrl(`/storage/${submission.file_path}`);
            setImagePreviewOpen(true);
        } else if (fileTypeInfo.type === 'model') {
            setModelPreviewData({
                fileUrl: `/storage/${submission.file_path}`,
                fileName: submission.file_name,
            });
            setModelPreviewOpen(true);
        } else if (fileTypeInfo.type === 'vox') {
            setVoxPreviewData({
                fileUrl: `/storage/${submission.file_path}`,
                fileName: submission.file_name,
            });
            setVoxPreviewOpen(true);
        } else {
            window.open(`/storage/${submission.file_path}`, '_blank');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // 统计各类作品数量
    const stats = {
        total: submissions.length,
        image: submissions.filter(s => getFileTypeInfo(s.file_name).type === 'image').length,
        model: submissions.filter(s => getFileTypeInfo(s.file_name).type === 'model').length,
        vox: submissions.filter(s => getFileTypeInfo(s.file_name).type === 'vox').length,
        scored: submissions.filter(s => s.score !== null).length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="作品广场" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* 页面标题区域 */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-green-50 to-amber-50 p-8">
                    {/* 装饰元素 */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-float" />
                    <div className="absolute bottom-4 right-20 w-10 h-10 bg-green-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                    <Palette className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                                    作品广场
                                </h1>
                            </div>
                            <p className="text-gray-500 ml-1">欣赏同学们的精彩创意作品 🎨</p>
                        </div>
                        
                        {/* 视图切换 */}
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="icon"
                                className={`h-10 w-10 rounded-xl ${viewMode === 'grid' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="网格视图"
                            >
                                <Grid3X3 className="size-5" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="icon"
                                className={`h-10 w-10 rounded-xl ${viewMode === 'list' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="列表视图"
                            >
                                <List className="size-5" />
                            </Button>
                            <Button
                                variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                                size="icon"
                                className={`h-10 w-10 rounded-xl ${viewMode === 'masonry' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                                onClick={() => setViewMode('masonry')}
                                title="瀑布流视图"
                            >
                                <LayoutGrid className="size-5" />
                            </Button>
                        </div>
                    </div>

                    {/* 统计卡片 */}
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-gray-500">总作品</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <ImageIcon className="w-4 h-4 text-pink-500" />
                                <span className="text-xs text-gray-500">图片</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.image}</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <Box className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-gray-500">3D模型</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.model}</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <Layers className="w-4 h-4 text-purple-500" />
                                <span className="text-xs text-gray-500">VOX</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.vox}</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-xs text-gray-500">已评分</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.scored}</div>
                        </div>
                    </div>
                </div>

                {/* 筛选工具栏 */}
                <Card variant="soft" className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* 年份筛选 */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="size-4 text-blue-600" />
                            </div>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[140px] rounded-xl border-gray-200">
                                    <SelectValue placeholder="筛选年份" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">📚 全部年份</SelectItem>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            🎓 {year}年
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 搜索框 */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="🔍 搜索学生姓名..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-[220px] pl-10 rounded-xl border-gray-200 h-10"
                                />
                            </div>
                            <Button type="submit" variant="outline" size="sm" className="rounded-xl h-10">
                                搜索
                            </Button>
                        </form>

                        <div className="h-8 w-px bg-gray-200" />

                        {/* 排序 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">排序:</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('created_at')}
                                className={`rounded-xl ${sortField === 'created_at' ? 'bg-blue-100 text-blue-600' : ''}`}
                            >
                                📅 时间
                                <SortIcon field="created_at" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('score')}
                                className={`rounded-xl ${sortField === 'score' ? 'bg-blue-100 text-blue-600' : ''}`}
                            >
                                ⭐ 分数
                                <SortIcon field="score" />
                            </Button>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            {(selectedYear !== 'all' || searchQuery) && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={clearFilters}
                                    className="rounded-xl text-gray-500 hover:text-red-500"
                                >
                                    <X className="mr-1 size-4" />
                                    清除筛选
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* 作品列表 */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <div className="text-gray-500 text-lg">正在加载作品...</div>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Palette className="size-12 text-gray-400" />
                        </div>
                        <div className="text-xl font-medium text-gray-600 mb-2">还没有作品</div>
                        <div className="text-gray-400">快来上传你的第一个作品吧！🎨</div>
                    </div>
                ) : viewMode === 'grid' ? (
                    // 网格视图
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {submissions.map((submission, index) => {
                            const fileTypeInfo = getFileTypeInfo(submission.file_name);
                            const FileIcon = fileTypeInfo.icon;
                            
                            return (
                                <Card
                                    key={submission.id}
                                    variant="colored"
                                    className="group overflow-hidden hover-lift cursor-pointer"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* 作品截图 */}
                                    <div
                                        className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer overflow-hidden"
                                        onClick={(e) => handleImageClick(e, submission)}
                                    >
                                        {getDisplayImagePath(submission) ? (
                                            <img
                                                src={getDisplayImagePath(submission)!}
                                                alt={submission.file_name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <div className={`w-20 h-20 rounded-2xl ${fileTypeInfo.color} flex items-center justify-center`}>
                                                    <FileIcon className="size-10" />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* 文件类型标签 */}
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${fileTypeInfo.color}`}>
                                            {fileTypeInfo.label}
                                        </div>
                                        
                                        {/* 悬停遮罩 */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                            <span className="text-white text-sm font-medium flex items-center gap-1">
                                                <Sparkles className="w-4 h-4" />
                                                {fileTypeInfo.type === 'image' ? '查看大图' :
                                                 fileTypeInfo.type === 'model' ? '3D预览' :
                                                 fileTypeInfo.type === 'vox' ? 'VOX预览' : '打开文件'}
                                            </span>
                                        </div>

                                        {/* 分数徽章 */}
                                        {submission.score !== null && (
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${getScoreColor(submission.score)}`}>
                                                {submission.score}分
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader className="p-4 pb-2">
                                        <div className="text-sm font-bold text-gray-800 truncate">
                                            {submission.assignment.lesson?.name || '未知课时'}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {submission.assignment.name}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4 pt-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                    {submission.student.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-700 truncate">{submission.student.name}</div>
                                                    <div className="text-xs text-gray-400">{submission.student.year}年</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(submission.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : viewMode === 'list' ? (
                    // 列表视图
                    <div className="space-y-4">
                        {submissions.map((submission) => {
                            const fileTypeInfo = getFileTypeInfo(submission.file_name);
                            const FileIcon = fileTypeInfo.icon;
                            
                            return (
                                <Card
                                    key={submission.id}
                                    variant="soft"
                                    className="group hover-lift cursor-pointer overflow-hidden"
                                    onClick={(e) => handleImageClick(e, submission)}
                                >
                                    <div className="flex items-center gap-5 p-5">
                                        {/* 缩略图 */}
                                        <div className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl flex items-center justify-center ${fileTypeInfo.color.replace('text-', 'bg-').replace('100', '50')}`}>
                                            {getDisplayImagePath(submission) ? (
                                                <img
                                                    src={getDisplayImagePath(submission)!}
                                                    alt={submission.file_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <FileIcon className={`size-8 ${fileTypeInfo.color.split(' ')[1]}`} />
                                            )}
                                        </div>

                                        {/* 信息 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fileTypeInfo.color}`}>
                                                    {fileTypeInfo.label}
                                                </span>
                                                <div className="font-bold text-gray-800">{submission.assignment.lesson?.name || '未知课时'}</div>
                                            </div>
                                            <div className="text-sm text-gray-500 mb-2">{submission.assignment.name}</div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                        {submission.student.name.charAt(0)}
                                                    </div>
                                                    <span className="text-gray-600">{submission.student.name}</span>
                                                </div>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-gray-500">{submission.student.year}年</span>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-gray-500">{formatFileSize(submission.file_size)}</span>
                                            </div>
                                        </div>

                                        {/* 分数和时间 */}
                                        <div className="text-right shrink-0">
                                            {submission.score !== null ? (
                                                <div className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-lg font-bold shadow-md mb-2 ${getScoreColor(submission.score)}`}>
                                                    <Star className="w-5 h-5" />
                                                    {submission.score}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-sm mb-2">未评分</div>
                                            )}
                                            <div className="text-xs text-gray-400">
                                                {new Date(submission.created_at).toLocaleDateString('zh-CN')}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    // 瀑布流视图
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
                        {submissions.map((submission) => {
                            const fileTypeInfo = getFileTypeInfo(submission.file_name);
                            const FileIcon = fileTypeInfo.icon;
                            
                            return (
                                <Card
                                    key={submission.id}
                                    variant="colored"
                                    className="group overflow-hidden hover-lift cursor-pointer break-inside-avoid"
                                >
                                    <div
                                        className="relative bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer overflow-hidden"
                                        onClick={(e) => handleImageClick(e, submission)}
                                    >
                                        {getDisplayImagePath(submission) ? (
                                            <img
                                                src={getDisplayImagePath(submission)!}
                                                alt={submission.file_name}
                                                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex aspect-[4/3] w-full items-center justify-center">
                                                <div className={`w-20 h-20 rounded-2xl ${fileTypeInfo.color} flex items-center justify-center`}>
                                                    <FileIcon className="size-10" />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* 文件类型标签 */}
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${fileTypeInfo.color}`}>
                                            {fileTypeInfo.label}
                                        </div>
                                        
                                        {/* 悬停遮罩 */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                            <span className="text-white text-sm font-medium flex items-center gap-1">
                                                <Sparkles className="w-4 h-4" />
                                                查看详情
                                            </span>
                                        </div>

                                        {/* 分数徽章 */}
                                        {submission.score !== null && (
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${getScoreColor(submission.score)}`}>
                                                {submission.score}分
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader className="p-4 pb-2">
                                        <div className="text-sm font-bold text-gray-800 truncate">
                                            {submission.assignment.lesson?.name || '未知课时'}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {submission.assignment.name}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4 pt-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                    {submission.student.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-700 truncate">{submission.student.name}</div>
                                                    <div className="text-xs text-gray-400">{submission.student.year}年</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* 加载更多提示 */}
                {loadingMore && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                        <div className="text-gray-500">加载更多作品...</div>
                    </div>
                )}

                {!hasMore && submissions.length > 0 && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <Sparkles className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="text-gray-600 font-medium">已经加载全部 {submissions.length} 条作品</div>
                        <div className="text-gray-400 text-sm mt-1">太棒了！🎉</div>
                    </div>
                )}
            </div>

            {/* 图片预览模态框 */}
            <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
                <DialogContent className="!max-w-[98vw] !max-h-[95vh] overflow-hidden p-0 rounded-none border-0 bg-black">
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>图片预览</DialogTitle>
                            <DialogDescription>点击图片查看大图</DialogDescription>
                        </DialogHeader>
                    </VisuallyHidden>
                    <div className="flex items-center justify-center w-full h-full bg-black">
                        <img
                            src={imagePreviewUrl}
                            alt="预览图"
                            className="w-full h-full max-h-[95vh] object-contain"
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* 3D模型预览模态框 */}
            <Dialog open={modelPreviewOpen} onOpenChange={setModelPreviewOpen}>
                <DialogContent className="!max-w-4xl !max-h-[90vh] overflow-hidden p-0 rounded-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-blue-500" />
                            3D模型预览
                        </DialogTitle>
                        <DialogDescription>{modelPreviewData?.fileName}</DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        {modelPreviewData && (
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                <StlModelViewer
                                    fileUrl={modelPreviewData.fileUrl}
                                    fileName={modelPreviewData.fileName}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* VOX模型预览模态框 */}
            <Dialog open={voxPreviewOpen} onOpenChange={setVoxPreviewOpen}>
                <DialogContent className="!max-w-4xl !max-h-[90vh] overflow-hidden p-0 rounded-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-500" />
                            VOX模型预览
                        </DialogTitle>
                        <DialogDescription>{voxPreviewData?.fileName}</DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        {voxPreviewData && (
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                <VoxModelViewer
                                    fileUrl={voxPreviewData.fileUrl}
                                    fileName={voxPreviewData.fileName}
                                />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

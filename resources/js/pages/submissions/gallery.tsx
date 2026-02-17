import { Head, usePage } from '@inertiajs/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import axios from 'axios';
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
    Calendar,
    Heart,
    Share2,
    Download,
    Copy,
    FileType,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { StlModelViewer } from '@/components/stl-model-viewer';
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
    likes_count?: number;
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

    // 图片预览尺寸状态
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [imageFileName, setImageFileName] = useState('');

    // TXT文本预览模态框状态
    const [txtPreviewOpen, setTxtPreviewOpen] = useState(false);
    const [txtPreviewData, setTxtPreviewData] = useState<{
        content: string;
        fileName: string;
        fileSize: number;
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
            // 后端直接返回年份字符串数组
            const years = (response.data as string[]).sort().reverse();
            setYears(years);
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
            setImageFileName(submission.file_name);
            setImageDimensions(null); // 重置尺寸
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
        } else if (submission.file_name.endsWith('.txt')) {
            // 加载并显示TXT文件
            fetch(`/storage/${submission.file_path}`)
                .then(res => res.text())
                .then(content => {
                    setTxtPreviewData({
                        content,
                        fileName: submission.file_name,
                        fileSize: submission.file_size,
                    });
                    setTxtPreviewOpen(true);
                })
                .catch(() => {
                    window.open(`/storage/${submission.file_path}`, '_blank');
                });
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

    // 处理点赞
    const handleLike = async (submissionId: number) => {
        try {
            await axios.post(`/api/submissions/${submissionId}/like`);
            // 更新本地点赞数
            setSubmissions(prev => prev.map(s => 
                s.id === submissionId 
                    ? { ...s, likes_count: (s.likes_count || 0) + 1 }
                    : s
            ));
        } catch (error) {
            console.error('点赞失败:', error);
        }
    };

    // 处理分享
    const handleShare = (submission: Submission) => {
        const shareData = {
            title: `${submission.student.name}的3D作品`,
            text: `来看看${submission.student.name}在${submission.assignment.lesson?.name || '3D课程'}的作品！`,
            url: window.location.href,
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href);
            alert('链接已复制到剪贴板！');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="作品广场" />

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                {/* 页面标题区域 */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
                    {/* 装饰元素 */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-float" />
                    <div className="absolute bottom-4 right-20 w-10 h-10 bg-green-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Palette className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">作品广场</h1>
                                <p className="text-blue-100">欣赏同学们的精彩创意作品</p>
                            </div>
                        </div>
                        
                        {/* 视图切换 */}
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                className={`h-9 w-9 rounded-lg ${viewMode === 'grid' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`}
                                onClick={() => setViewMode('grid')}
                                title="网格视图"
                            >
                                <Grid3X3 className="size-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                className={`h-9 w-9 rounded-lg ${viewMode === 'list' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`}
                                onClick={() => setViewMode('list')}
                                title="列表视图"
                            >
                                <List className="size-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'masonry' ? 'secondary' : 'ghost'}
                                size="icon"
                                className={`h-9 w-9 rounded-lg ${viewMode === 'masonry' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}`}
                                onClick={() => setViewMode('masonry')}
                                title="瀑布流视图"
                            >
                                <LayoutGrid className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* 统计卡片 */}
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs text-blue-100">总作品</span>
                            </div>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-xs text-blue-100">图片</span>
                            </div>
                            <div className="text-2xl font-bold">{stats.image}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Box className="w-4 h-4" />
                                <span className="text-xs text-blue-100">3D模型</span>
                            </div>
                            <div className="text-2xl font-bold">{stats.model}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Layers className="w-4 h-4" />
                                <span className="text-xs text-blue-100">VOX</span>
                            </div>
                            <div className="text-2xl font-bold">{stats.vox}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs text-blue-100">已评分</span>
                            </div>
                            <div className="text-2xl font-bold">{stats.scored}</div>
                        </div>
                    </div>
                </div>

                {/* 筛选工具栏 */}
                <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        {/* 年份筛选 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-medium">年份筛选</span>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
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
                        </div>

                        <div className="w-px h-6 bg-gray-200" />

                        {/* 搜索框 */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="搜索学生姓名..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-[200px] pl-10 rounded-lg border-gray-200"
                                />
                            </div>
                            <Button type="submit" variant="outline" size="sm" className="rounded-lg">
                                搜索
                            </Button>
                        </form>

                        <div className="w-px h-6 bg-gray-200" />

                        {/* 排序 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-medium">排序:</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('created_at')}
                                className={`rounded-lg ${sortField === 'created_at' ? 'bg-blue-100 text-blue-600' : ''}`}
                            >
                                时间
                                <SortIcon field="created_at" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('score')}
                                className={`rounded-lg ${sortField === 'score' ? 'bg-blue-100 text-blue-600' : ''}`}
                            >
                                分数
                                <SortIcon field="score" />
                            </Button>
                        </div>

                        {(selectedYear !== 'all' || searchQuery) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={clearFilters}
                                className="rounded-lg text-gray-500 hover:text-red-500"
                            >
                                <X className="mr-1 size-4" />
                                清除筛选
                            </Button>
                        )}
                    </div>
                </div>

                {/* 作品列表 */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <div className="text-gray-500">正在加载作品...</div>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Palette className="size-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">还没有作品</p>
                        <p className="text-gray-400 text-sm mt-1">快来上传你的第一个作品吧</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    // 网格视图
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

                                    <CardHeader className="p-5 pb-3">
                                        <div className="text-base font-bold text-gray-800 truncate">
                                            {submission.assignment.lesson?.name || '未知课时'}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate mt-1">
                                            {submission.assignment.name}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-5 pt-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
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

                                        {/* 互动按钮 */}
                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 h-9 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(submission.id);
                                                }}
                                            >
                                                <Heart className="w-4 h-4 mr-1.5" />
                                                <span className="text-sm">{submission.likes_count || 0}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 h-9 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShare(submission);
                                                }}
                                            >
                                                <Share2 className="w-4 h-4 mr-1.5" />
                                                <span className="text-sm">分享</span>
                                            </Button>
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
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 space-y-8">
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

                                    <CardHeader className="p-5 pb-3">
                                        <div className="text-base font-bold text-gray-800 truncate">
                                            {submission.assignment.lesson?.name || '未知课时'}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate mt-1">
                                            {submission.assignment.name}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-5 pt-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
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
                <DialogContent
                    className="overflow-hidden p-0 rounded-2xl border-0 shadow-2xl bg-white [&>button]:hidden"
                    style={{
                        maxWidth: imageDimensions
                            ? `${Math.min(imageDimensions.width, window.innerWidth * 0.9)}px`
                            : '90vw',
                        width: 'auto',
                    }}
                >
                    <VisuallyHidden>
                        <DialogTitle>图片预览 - {imageFileName}</DialogTitle>
                    </VisuallyHidden>
                    {/* 标题栏 - 渐变色背景 */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <ImageIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm truncate max-w-[300px]">
                                    {imageFileName}
                                </h3>
                                {imageDimensions && (
                                    <p className="text-blue-100 text-xs">
                                        {imageDimensions.width} × {imageDimensions.height} 像素
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg"
                                onClick={() => setImagePreviewOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* 图片显示区域 - 浅色背景 */}
                    <div className="flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
                        <img
                            src={imagePreviewUrl}
                            alt={imageFileName}
                            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg border border-gray-100"
                            onLoad={(e) => {
                                const img = e.target as HTMLImageElement;
                                const windowWidth = window.innerWidth * 0.8;
                                const windowHeight = window.innerHeight * 0.8;

                                // 如果图片小于窗口80%，原尺寸显示；否则按比例缩放
                                if (img.naturalWidth <= windowWidth && img.naturalHeight <= windowHeight) {
                                    setImageDimensions({
                                        width: img.naturalWidth,
                                        height: img.naturalHeight,
                                    });
                                } else {
                                    const ratio = Math.min(
                                        windowWidth / img.naturalWidth,
                                        windowHeight / img.naturalHeight
                                    );
                                    setImageDimensions({
                                        width: Math.round(img.naturalWidth * ratio),
                                        height: Math.round(img.naturalHeight * ratio),
                                    });
                                }
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* 3D模型预览模态框 */}
            <Dialog open={modelPreviewOpen} onOpenChange={setModelPreviewOpen}>
                <DialogContent className="!max-w-4xl !max-h-[90vh] overflow-hidden p-0 rounded-2xl border-0 shadow-2xl bg-white [&>button]:hidden">
                    <VisuallyHidden>
                        <DialogTitle>3D模型预览 - {modelPreviewData?.fileName || ''}</DialogTitle>
                    </VisuallyHidden>
                    {modelPreviewData && (
                        <>
                            {/* 标题栏 - 蓝青渐变 */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Box className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">
                                            {modelPreviewData.fileName}
                                        </h3>
                                        <p className="text-cyan-100 text-sm">STL 3D 模型</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg"
                                        onClick={() => setModelPreviewOpen(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* 3D模型显示区域 - 浅色背景 */}
                            <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg border border-blue-100">
                                    <StlModelViewer
                                        fileUrl={modelPreviewData.fileUrl}
                                        fileName={modelPreviewData.fileName}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* VOX模型预览模态框 */}
            <Dialog open={voxPreviewOpen} onOpenChange={setVoxPreviewOpen}>
                <DialogContent className="!max-w-4xl !max-h-[90vh] overflow-hidden p-0 rounded-2xl border-0 shadow-2xl bg-white [&>button]:hidden">
                    <VisuallyHidden>
                        <DialogTitle>VOX模型预览 - {voxPreviewData?.fileName || ''}</DialogTitle>
                    </VisuallyHidden>
                    {voxPreviewData && (
                        <>
                            {/* 标题栏 - 紫粉渐变 */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Layers className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">
                                            {voxPreviewData.fileName}
                                        </h3>
                                        <p className="text-pink-100 text-sm">VOX 体素模型</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg"
                                        onClick={() => setVoxPreviewOpen(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* VOX模型显示区域 - 浅色背景 */}
                            <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg border border-purple-100">
                                    <VoxModelViewer
                                        fileUrl={voxPreviewData.fileUrl}
                                        fileName={voxPreviewData.fileName}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* TXT文本预览模态框 */}
            <Dialog open={txtPreviewOpen} onOpenChange={setTxtPreviewOpen}>
                <DialogContent className="!max-w-3xl !max-h-[85vh] overflow-hidden p-0 rounded-2xl border-0 shadow-2xl bg-white [&>button]:hidden">
                    <VisuallyHidden>
                        <DialogTitle>文本预览 - {txtPreviewData?.fileName || ''}</DialogTitle>
                    </VisuallyHidden>
                    {txtPreviewData && (
                        <>
                            {/* 标题栏 - 绿色渐变 */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <FileType className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-base">
                                            {txtPreviewData.fileName}
                                        </h3>
                                        <p className="text-green-100 text-sm">
                                            {formatFileSize(txtPreviewData.fileSize)} · {txtPreviewData.content.length} 字符
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg"
                                        onClick={() => setTxtPreviewOpen(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* 文本内容区域 - 浅色友好背景 */}
                            <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                                <div className="max-h-[60vh] overflow-auto rounded-xl bg-amber-50 border border-amber-100 p-5 shadow-inner">
                                    <pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                                        {txtPreviewData.content}
                                    </pre>
                                </div>
                            </div>

                            {/* 底部信息栏 */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                                <div className="flex items-center justify-between text-gray-400 text-xs">
                                    <span className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        纯文本文件
                                    </span>
                                    <span>按 ESC 键关闭</span>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

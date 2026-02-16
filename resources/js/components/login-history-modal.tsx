import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    History,
    User,
    Eye,
    CheckCircle,
    AlertTriangle,
    X,
    Trash2,
    Download
} from 'lucide-react';
import { getBrowserLoginHistory, clearAllRecords, type LoginRecord } from '@/lib/db';

interface LoginHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherName?: string;
    currentStudentId?: number;
    filterByCurrentStudent?: boolean;
}

export function LoginHistoryModal({ isOpen, onClose, teacherName, currentStudentId, filterByCurrentStudent = false }: LoginHistoryModalProps) {
    const [records, setRecords] = useState<LoginRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadRecords();
        }
    }, [isOpen, currentStudentId]);

    const loadRecords = async () => {
        setLoading(true);
        let data = await getBrowserLoginHistory();

        // 如果设置了只显示当前学生的记录
        if (filterByCurrentStudent && currentStudentId) {
            data = data.filter(r => r.studentId === currentStudentId);
        }

        setRecords(data);
        setLoading(false);
    };

    const handleClear = async () => {
        if (confirm('确定要清空所有本地记录吗？')) {
            await clearAllRecords();
            setRecords([]);
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(records, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `login-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 统计
    const stats = {
        total: records.length,
        teacherLogins: records.filter(r => r.loginType === 'teacher').length,
        studentLogins: records.filter(r => r.loginType === 'student').length,
        uniqueStudents: new Set(records.map(r => r.studentId)).size,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <History className="w-6 h-6 text-blue-500" />
                                登录记录审计
                            </DialogTitle>
                            <DialogDescription className="mt-2">
                                {teacherName ? (
                                    <span className="flex items-center gap-2 text-orange-600">
                                        <AlertTriangle className="w-4 h-4" />
                                        教师 <strong>{teacherName}</strong> 要求查看此设备的登录记录
                                    </span>
                                ) : (
                                    '此浏览器登录过的学生账号记录'
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* 统计 */}
                <div className="grid grid-cols-4 gap-3 my-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-xs text-gray-500">总记录</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">{stats.teacherLogins}</div>
                        <div className="text-xs text-gray-500">教师代登</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.studentLogins}</div>
                        <div className="text-xs text-gray-500">学生自登</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.uniqueStudents}</div>
                        <div className="text-xs text-gray-500">不同账号</div>
                    </div>
                </div>

                {/* 记录列表 */}
                <ScrollArea className="flex-1 border rounded-lg p-4 min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <History className="w-12 h-12 mb-2 opacity-50" />
                            <p>暂无登录记录</p>
                            <p className="text-sm">此浏览器还没有登录过任何学生账号</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.map((record, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            record.loginType === 'teacher'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-green-100 text-green-600'
                                        }`}>
                                            {record.loginType === 'teacher' ? <Eye className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-medium">{record.studentName}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(record.loginTime).toLocaleString('zh-CN')}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={record.loginType === 'teacher' ? 'destructive' : 'default'}
                                        className="text-xs"
                                    >
                                        {record.loginType === 'teacher' ? '教师代登' : '学生自登'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* 底部按钮 */}
                <div className="flex justify-between mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={records.length === 0}
                        >
                            <Download className="w-4 h-4 mr-1" />
                            导出记录
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            disabled={records.length === 0}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            清空记录
                        </Button>
                    </div>
                    <Button onClick={onClose}>
                        <X className="w-4 h-4 mr-1" />
                        关闭
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

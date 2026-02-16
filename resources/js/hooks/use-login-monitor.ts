import { useEffect, useState, useCallback, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { getEchoAsync, getEcho } from '@/echo';
import type { LoginRecord } from '@/lib/db';

interface BroadcastPayload {
    teacher: {
        id: number;
        name: string;
    };
    requested_at: string;
    message: string;
}

export function useLoginMonitor() {
    const { auth } = usePage().props as { auth: { student?: { id: number; name: string } } };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teacherName, setTeacherName] = useState<string>('');
    const channelRef = useRef<any>(null);

    const handleBroadcast = useCallback((payload: BroadcastPayload) => {
        console.log('[LoginMonitor] ✅ 收到广播事件:', payload);
        setTeacherName(payload.teacher.name);
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        const student = auth.student;

        console.log('[LoginMonitor] useEffect 触发, auth.student:', student);

        if (!student) {
            console.log('[LoginMonitor] ❌ 学生未登录，跳过订阅');
            return;
        }

        let isSubscribed = false;

        const setupSubscription = async () => {
            try {
                console.log('[LoginMonitor] 开始设置订阅，学生ID:', student.id);

                // 先检查同步获取
                const syncEcho = getEcho();
                console.log('[LoginMonitor] 同步获取Echo:', syncEcho ? '已存在' : '不存在');

                const echo = await getEchoAsync();
                console.log('[LoginMonitor] 异步获取Echo:', echo ? '成功' : '失败');

                if (!echo) {
                    console.error('[LoginMonitor] ❌ Echo未初始化，无法订阅');
                    return;
                }

                if (isSubscribed) {
                    console.log('[LoginMonitor] ⚠️ 已经订阅，跳过');
                    return;
                }

                // 1. 订阅学生私有频道（用于定向消息）
                const privateChannelName = `student.${student.id}`;
                console.log(`[LoginMonitor] 尝试订阅私有频道: ${privateChannelName}`);

                const privateChannel = echo.private(privateChannelName);
                channelRef.current = privateChannel;

                console.log('[LoginMonitor] 私有频道对象创建:', privateChannel ? '成功' : '失败');

                // 监听订阅成功
                privateChannel.subscribed(() => {
                    console.log(`[LoginMonitor] ✅ 成功订阅私有频道: ${privateChannelName}`);
                    isSubscribed = true;
                }).error((error: any) => {
                    console.error(`[LoginMonitor] ❌ 订阅私有频道失败:`, error);
                });

                // 监听登录历史请求事件（私有频道）
                console.log(`[LoginMonitor] 开始在私有频道监听事件`);
                privateChannel.listen('.login.history.requested', (payload: any) => {
                    console.log('[LoginMonitor] 📨 私有频道收到事件:', payload);
                    handleBroadcast(payload);
                });

                // 2. 订阅公共频道 students（用于广播给所有学生）
                const publicChannelName = 'students';
                console.log(`[LoginMonitor] 尝试订阅公共频道: ${publicChannelName}`);

                const publicChannel = echo.channel(publicChannelName);

                console.log('[LoginMonitor] 公共频道对象创建:', publicChannel ? '成功' : '失败');

                // 监听登录历史请求事件（公共频道）
                publicChannel.listen('.login.history.requested', (payload: any) => {
                    console.log('[LoginMonitor] 📨 公共频道收到事件:', payload);
                    handleBroadcast(payload);
                });

                console.log(`[LoginMonitor] ✅ 订阅设置完成: 私有频道(${privateChannelName}) + 公共频道(${publicChannelName})`);
            } catch (error) {
                console.error('[LoginMonitor] ❌ 订阅过程出错:', error);
            }
        };

        // 延迟一点时间确保 Echo 已初始化
        console.log('[LoginMonitor] 500ms后启动订阅...');
        const timeoutId = setTimeout(setupSubscription, 500);

        return () => {
            console.log('[LoginMonitor] 清理订阅...');
            clearTimeout(timeoutId);
            try {
                if (channelRef.current) {
                    console.log('[LoginMonitor] 停止监听私有频道事件');
                    channelRef.current.stopListening('.login.history.requested');
                }
                getEchoAsync().then(echo => {
                    if (echo) {
                        // 离开私有频道
                        echo.leave(`student.${student.id}`);
                        console.log(`[LoginMonitor] 已离开私有频道: student.${student.id}`);
                        // 离开公共频道
                        echo.leave('students');
                        console.log('[LoginMonitor] 已离开公共频道: students');
                    }
                });
            } catch (e) {
                // 忽略错误
            }
        };
    }, [auth.student, handleBroadcast]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setTeacherName('');
    }, []);

    return {
        isModalOpen,
        teacherName,
        closeModal,
    };
}

import { usePage } from '@inertiajs/react';
import { useLoginMonitor } from '@/hooks/use-login-monitor';
import type { SharedData } from '@/types';
import { LoginHistoryModal } from './login-history-modal';

/**
 * 登录监控包装组件
 * 放在学生布局中使用，监听教师广播并显示登录历史弹窗
 */
export function LoginMonitorWrapper() {
    const { isModalOpen, teacherName, closeModal } = useLoginMonitor();
    const { auth } = usePage<SharedData>().props;
    const currentStudentId = auth.student?.id;

    return (
        <LoginHistoryModal
            isOpen={isModalOpen}
            onClose={closeModal}
            teacherName={teacherName}
            currentStudentId={currentStudentId}
            filterByCurrentStudent={true}
        />
    );
}

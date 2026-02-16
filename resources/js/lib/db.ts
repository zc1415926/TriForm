import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';

// 登录记录数据结构
export interface LoginRecord {
    id?: number;
    studentId: number;
    studentName: string;
    loginTime: string;
    loginType: 'teacher' | 'student';
    teacherName?: string;
}

// IndexedDB Schema定义
interface LoginHistoryDB extends DBSchema {
    login_history: {
        keyPath: 'id';
        value: LoginRecord;
        indexes: {
            'by-student': number;
            'by-time': string;
        };
    };
}

const DB_NAME = 'student-login-db';
const DB_VERSION = 1;

// 打开数据库
async function openDatabase(): Promise<IDBPDatabase<LoginHistoryDB>> {
    return openDB<LoginHistoryDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // 创建登录历史表
            if (!db.objectStoreNames.contains('login_history')) {
                const store = db.createObjectStore('login_history', {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                // 创建索引
                store.createIndex('by-student', 'studentId');
                store.createIndex('by-time', 'loginTime');
            }
        },
    });
}

// 添加登录记录
export async function addLoginRecord(record: Omit<LoginRecord, 'id'>): Promise<void> {
    try {
        const db = await openDatabase();
        await db.add('login_history', record as LoginRecord);
        console.log('[IndexedDB] 登录记录已保存:', record);
    } catch (error) {
        console.error('[IndexedDB] 保存登录记录失败:', error);
    }
}

// 获取所有登录记录
export async function getAllLoginRecords(): Promise<LoginRecord[]> {
    try {
        const db = await openDatabase();
        return await db.getAll('login_history');
    } catch (error) {
        console.error('[IndexedDB] 获取登录记录失败:', error);
        return [];
    }
}

// 获取指定学生的登录记录
export async function getLoginRecordsByStudent(studentId: number): Promise<LoginRecord[]> {
    try {
        const db = await openDatabase();
        const index = db.transaction('login_history').store.index('by-student');
        return await index.getAll(studentId);
    } catch (error) {
        console.error('[IndexedDB] 获取学生登录记录失败:', error);
        return [];
    }
}

// 获取本浏览器的登录历史（按时间倒序）
export async function getBrowserLoginHistory(): Promise<LoginRecord[]> {
    try {
        const db = await openDatabase();
        const records = await db.getAll('login_history');
        // 按时间倒序排序
        return records.sort((a, b) =>
            new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
        );
    } catch (error) {
        console.error('[IndexedDB] 获取浏览器登录历史失败:', error);
        return [];
    }
}

// 清理旧记录（保留最近100条）
export async function cleanupOldRecords(maxRecords: number = 100): Promise<void> {
    try {
        const db = await openDatabase();
        const records = await db.getAll('login_history');

        if (records.length > maxRecords) {
            // 按时间排序
            const sorted = records.sort((a, b) =>
                new Date(a.loginTime).getTime() - new Date(b.loginTime).getTime()
            );

            // 删除旧记录
            const tx = db.transaction('login_history', 'readwrite');
            const toDelete = sorted.slice(0, records.length - maxRecords);

            for (const record of toDelete) {
                if (record.id) {
                    await tx.store.delete(record.id);
                }
            }

            await tx.done;
            console.log(`[IndexedDB] 已清理 ${toDelete.length} 条旧记录`);
        }
    } catch (error) {
        console.error('[IndexedDB] 清理旧记录失败:', error);
    }
}

// 清空所有记录
export async function clearAllRecords(): Promise<void> {
    try {
        const db = await openDatabase();
        await db.clear('login_history');
        console.log('[IndexedDB] 所有记录已清空');
    } catch (error) {
        console.error('[IndexedDB] 清空记录失败:', error);
    }
}

// 导出所有记录（用于调试）
export async function exportRecords(): Promise<LoginRecord[]> {
    return await getAllLoginRecords();
}

/**
 * 认证辅助函数
 */

import type { Page } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

/**
 * 登录到应用
 */
export async function login(page: Page, userType: 'admin' | 'teacher' = 'admin'): Promise<void> {
    const user = testUsers[userType];

    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');

    // 等待登录成功后的跳转
    await page.waitForURL('/dashboard', { timeout: 10000 });
}

/**
 * 登出应用
 */
export async function logout(page: Page): Promise<void> {
    await page.goto('/logout');
    await page.waitForURL('/login', { timeout: 10000 });
}

/**
 * 检查是否已登录
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
    const currentUrl = page.url();
    return !currentUrl.includes('/login');
}
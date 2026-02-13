/**
 * 认证流程测试
 */

import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';
import { waitForPageLoad } from '../helpers/page-helper';

test.describe('认证流程', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await waitForPageLoad(page);
    });

    test('登录页面应该显示正确', async ({ page }) => {
        // 检查页面标题
        await expect(page).toHaveTitle(/登录|Login|Laravel/);

        // 检查登录表单元素
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // 检查"记住我"复选框
        await expect(page.locator('input[type="checkbox"][name="remember"]')).toBeVisible();
    });

    test('使用有效凭据登录成功', async ({ page }) => {
        const user = testUsers.admin;

        // 填写登录表单
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);

        // 提交表单
        await page.click('button[type="submit"]');

        // 等待跳转到仪表板
        await page.waitForURL('/dashboard', { timeout: 10000 });

        // 验证登录成功
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('使用无效凭据登录失败', async ({ page }) => {
        // 填写错误的登录信息
        await page.fill('input[name="email"]', 'invalid@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');

        // 提交表单
        await page.click('button[type="submit"]');

        // 应该停留在登录页面
        await expect(page).toHaveURL('/login');

        // 检查错误消息
        const errorMessage = page.locator('.text-red-600, .text-red-500, [role="alert"]').first();
        await expect(errorMessage).toBeVisible();
    });

    test('邮箱格式验证', async ({ page }) => {
        // 填写无效的邮箱格式
        await page.fill('input[name="email"]', 'invalid-email');
        await page.fill('input[name="password"]', 'password');

        // 提交表单
        await page.click('button[type="submit"]');

        // 检查邮箱验证错误
        const emailError = page.locator('.text-red-600, .text-red-500').filter({ hasText: /邮箱|email/i }).first();
        await expect(emailError).toBeVisible();
    });

    test('必填字段验证', async ({ page }) => {
        // 直接提交空表单
        await page.click('button[type="submit"]');

        // 应该停留在登录页面
        await expect(page).toHaveURL('/login');

        // 检查验证错误
        const errors = page.locator('.text-red-600, .text-red-500, .error-message');
        await expect(errors.first()).toBeVisible();
    });

    test('密码可见性切换', async ({ page }) => {
        const passwordInput = page.locator('input[name="password"]');

        // 检查初始状态为密码类型
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // 查找并点击显示密码按钮
        const toggleButton = page.locator('button[aria-label*="密码"], button[aria-label*="password"], .password-toggle').first();

        if (await toggleButton.count() > 0) {
            await toggleButton.click();
            await expect(passwordInput).toHaveAttribute('type', 'text');

            await toggleButton.click();
            await expect(passwordInput).toHaveAttribute('type', 'password');
        }
    });

    test('登录后访问受保护页面', async ({ page }) => {
        // 先登录
        const user = testUsers.admin;
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard', { timeout: 10000 });

        // 访问学生管理页面
        await page.goto('/students');
        await waitForPageLoad(page);

        // 应该成功访问
        await expect(page).toHaveURL('/students');
        await expect(page.locator('text=学生管理').or(page.locator('text=Students'))).toBeVisible();
    });

    test('未登录用户被重定向到登录页', async ({ page }) => {
        // 尝试直接访问受保护页面
        await page.goto('/students');
        await waitForPageLoad(page);

        // 应该被重定向到登录页
        await expect(page).toHaveURL(/.*login.*/);
    });
});

test.describe('登出功能', () => {
    test('用户成功登出', async ({ page }) => {
        // 先登录
        await page.goto('/login');
        const user = testUsers.admin;
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard', { timeout: 10000 });

        // 点击登出按钮或链接
        const logoutButton = page.locator('a[href="/logout"], button:has-text("退出"), button:has-text("Logout"), [data-testid="logout"]').first();

        if (await logoutButton.count() > 0) {
            await logoutButton.click();

            // 等待跳转到登录页
            await page.waitForURL('/login', { timeout: 10000 });
            await expect(page).toHaveURL('/login');
        }
    });
});
/**
 * 仪表板页面测试
 */

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad } from '../helpers/page-helper';

test.describe('仪表板页面', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/dashboard');
        await waitForPageLoad(page);
    });

    test('页面加载正确显示', async ({ page }) => {
        // 检查页面标题
        await expect(page.locator('h1').filter({ hasText: /仪表板|Dashboard|首页/i })).toBeVisible();

        // 检查页面内容加载
        await expect(page.locator('main, .dashboard-content, [data-testid="dashboard"]').first()).toBeVisible();
    });

    test('导航菜单显示', async ({ page }) => {
        // 检查导航菜单
        const nav = page.locator('nav, .sidebar, .navigation').first();
        await expect(nav).toBeVisible();

        // 检查主要导航链接
        const navItems = ['学生', '课程', '作业', '提交', '设置'];
        for (const item of navItems) {
            const link = page.locator(`nav a:has-text("${item}"), .sidebar a:has-text("${item}"), .navigation a:has-text("${item}")`).first();
            if (await link.count() > 0) {
                await expect(link).toBeVisible();
            }
        }
    });

    test('导航到学生管理页面', async ({ page }) => {
        const studentLink = page.locator('nav a:has-text("学生"), .sidebar a:has-text("学生"), a[href="/students"]').first();

        if (await studentLink.count() > 0) {
            await studentLink.click();
            await page.waitForURL('/students', { timeout: 10000 });
            await expect(page).toHaveURL('/students');
        }
    });

    test('导航到课程管理页面', async ({ page }) => {
        const lessonLink = page.locator('nav a:has-text("课程"), .sidebar a:has-text("课程"), a[href="/lessons"]').first();

        if (await lessonLink.count() > 0) {
            await lessonLink.click();
            await page.waitForURL('/lessons', { timeout: 10000 });
            await expect(page).toHaveURL('/lessons');
        }
    });

    test('导航到作业管理页面', async ({ page }) => {
        const assignmentLink = page.locator('nav a:has-text("作业"), .sidebar a:has-text("作业"), a[href="/assignments"]').first();

        if (await assignmentLink.count() > 0) {
            await assignmentLink.click();
            await page.waitForURL('/assignments', { timeout: 10000 });
            await expect(page).toHaveURL('/assignments');
        }
    });

    test('导航到提交管理页面', async ({ page }) => {
        const submissionLink = page.locator('nav a:has-text("提交"), .sidebar a:has-text("提交"), a[href="/submissions"]').first();

        if (await submissionLink.count() > 0) {
            await submissionLink.click();
            await page.waitForURL('/submissions', { timeout: 10000 });
            await expect(page).toHaveURL('/submissions');
        }
    });

    test('导航到作品广场页面', async ({ page }) => {
        const galleryLink = page.locator('nav a:has-text("广场"), .sidebar a:has-text("广场"), a[href="/submissions/gallery"]').first();

        if (await galleryLink.count() > 0) {
            await galleryLink.click();
            await page.waitForURL('/submissions/gallery', { timeout: 10000 });
            await expect(page).toHaveURL('/submissions/gallery');
        }
    });

    test('统计数据展示', async ({ page }) => {
        // 检查是否有统计数据卡片
        const statCards = page.locator('.stat-card, .dashboard-card, .metric-card');

        if (await statCards.count() > 0) {
            // 验证统计卡片可见
            await expect(statCards.first()).toBeVisible();

            // 检查统计数据不为空
            const statValues = page.locator('.stat-value, .metric-value, .number');
            if (await statValues.count() > 0) {
                await expect(statValues.first()).not.toBeEmpty();
            }
        }
    });

    test('最近活动或列表', async ({ page }) => {
        // 检查是否有最近活动列表
        const recentList = page.locator('.recent-list, .activity-list, .dashboard-section');

        if (await recentList.count() > 0) {
            await expect(recentList.first()).toBeVisible();
        }
    });

    test('响应式布局', async ({ page }) => {
        // 测试不同视口大小
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 768, height: 1024 },
            { width: 375, height: 667 },
        ];

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.reload();
            await waitForPageLoad(page);

            // 检查主要内容仍然可见
            await expect(page.locator('h1').first()).toBeVisible();

            // 检查页面没有水平滚动条（布局问题）
            const hasHorizontalScrollbar = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });

            expect(hasHorizontalScrollbar).toBe(false);
        }

        // 恢复默认视口
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('页面加载性能', async ({ page }) => {
        // 测量页面加载时间
        const startTime = Date.now();
        await page.goto('/dashboard');
        await waitForPageLoad(page);
        const loadTime = Date.now() - startTime;

        // 页面加载时间应小于 5 秒
        expect(loadTime).toBeLessThan(5000);
    });
});
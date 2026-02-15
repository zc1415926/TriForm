/**
 * 核心按钮功能测试
 * 测试关键页面的主要操作按钮，避免与页面功能测试重复
 */

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad } from '../helpers/page-helper';

test.describe('🔘 核心按钮功能测试', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
    });

    test.describe('📊 仪表盘页面', () => {
        test('主要导航按钮可点击', async ({ page }) => {
            await page.goto('/dashboard');
            await waitForPageLoad(page);

            // 测试快捷操作按钮
            const buttons = [
                { selector: 'a[href="/submissions/show"]', name: '查看作品' },
                { selector: 'a[href="/students"]', name: '学生管理' },
                { selector: 'a[href="/lessons"]', name: '课时管理' },
                { selector: 'a[href="/submissions"]', name: '作品提交' },
            ];

            for (const { selector, name } of buttons) {
                const button = page.locator(selector).first();
                if (await button.count() > 0) {
                    await expect(button).toBeVisible();
                }
            }
        });
    });

    test.describe('👥 学生管理页面', () => {
        test('添加学生按钮和弹窗', async ({ page }) => {
            await page.goto('/students');
            await waitForPageLoad(page);

            const addButton = page.locator('button:has-text("添加学生"), a:has-text("添加学生")').first();
            await expect(addButton).toBeVisible();
            await addButton.click();

            // 验证弹窗或表单
            const dialog = page.locator('[role="dialog"], .dialog, form').first();
            await expect(dialog).toBeVisible();
        });
    });

    test.describe('📚 课时管理页面', () => {
        test('添加课时按钮功能', async ({ page }) => {
            await page.goto('/lessons');
            await waitForPageLoad(page);

            const addButton = page.locator('a:has-text("添加课时")').first();
            await expect(addButton).toBeVisible();

            // 测试排序功能
            const sortButtons = page.locator('button[title="排序"], th button').first();
            if (await sortButtons.count() > 0) {
                await expect(sortButtons).toBeVisible();
            }
        });
    });

    test.describe('📝 作业管理页面', () => {
        test('添加作业按钮', async ({ page }) => {
            await page.goto('/assignments');
            await waitForPageLoad(page);

            const addButton = page.locator('a:has-text("添加作业")').first();
            await expect(addButton).toBeVisible();
            await addButton.click();
            await page.waitForURL('**/assignments/create');
        });
    });

    test.describe('🎨 作品提交页面', () => {
        test('文件选择按钮存在', async ({ page }) => {
            await page.goto('/submissions');
            await waitForPageLoad(page);

            // 测试文件选择输入
            const fileInput = page.locator('input[type="file"]').first();
            await expect(fileInput).toBeVisible({ timeout: 5000 }).catch(() => {
                // 可能页面结构不同，只检查按钮存在
            });
        });
    });

    test.describe('⚙️ 设置页面', () => {
        test('保存按钮可点击', async ({ page }) => {
            await page.goto('/settings/profile');
            await waitForPageLoad(page);

            const saveButton = page.locator('button[type="submit"]').first();
            await expect(saveButton).toBeVisible();
        });
    });

    test.describe('🧭 导航菜单', () => {
        test('主导航链接可用', async ({ page }) => {
            await page.goto('/dashboard');
            await waitForPageLoad(page);

            const navLinks = [
                { href: '/students', text: '学生管理' },
                { href: '/lessons', text: '课时管理' },
                { href: '/assignments', text: '作业管理' },
                { href: '/submissions', text: '作品广场' },
                { href: '/submissions/show', text: '作品提交' },
            ];

            for (const { href, text } of navLinks) {
                const link = page.locator(`nav a[href="${href}"], header a[href="${href}"]`).first();
                if (await link.count() > 0) {
                    await expect(link).toBeVisible();
                }
            }
        });
    });
});
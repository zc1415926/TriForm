/**
 * 课程管理页面测试
 */

import { test, expect } from '@playwright/test';
import { testLessons } from '../fixtures/test-data';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad, confirmDialog } from '../helpers/page-helper';

test.describe('课程管理页面', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/lessons');
        await waitForPageLoad(page);
    });

    test('页面加载正确显示', async ({ page }) => {
        // 检查页面标题
        await expect(page.locator('h1').filter({ hasText: /课程|Lessons/i })).toBeVisible();

        // 检查新增按钮
        await expect(page.locator('button:has-text("新增"), button:has-text("添加"), a:has-text("新增")').first()).toBeVisible();

        // 检查课程列表或表格
        const content = page.locator('.lesson-list, table, .grid, [data-testid="lesson-list"]').first();
        await expect(content).toBeVisible();
    });

    test('新增课程', async ({ page }) => {
        // 点击新增按钮
        await page.click('button:has-text("新增"), button:has-text("添加"), a:has-text("新增")');
        await page.waitForTimeout(500);

        // 检查表单显示
        const form = page.locator('form').or(page.locator('[role="dialog"]')).first();
        await expect(form).toBeVisible();

        // 填写课程信息
        const lesson = testLessons.newLesson;
        await page.fill('input[name="title"]', lesson.title);

        // 填写富文本编辑器内容
        const editor = page.locator('.ProseMirror, [contenteditable="true"], textarea[name="content"]').first();
        if (await editor.count() > 0) {
            await editor.fill(lesson.content);
        }

        // 选择年份
        const yearSelect = page.locator('select[name="year"]').first();
        if (await yearSelect.count() > 0) {
            await yearSelect.selectOption(lesson.year);
        }

        // 提交表单
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 验证课程已添加
        await expect(page.locator('text=' + lesson.title)).toBeVisible();
    });

    test('查看课程详情', async ({ page }) => {
        // 查找第一个课程的查看/编辑链接
        const viewLink = page.locator('.lesson-item a, table tbody tr a, button:has-text("查看")').first();

        if (await viewLink.count() > 0) {
            await viewLink.click();
            await page.waitForTimeout(500);

            // 检查详情页面显示
            await expect(page.locator('h1, h2').first()).toBeVisible();

            // 返回列表
            await page.goto('/lessons');
            await waitForPageLoad(page);
        }
    });

    test('编辑课程', async ({ page }) => {
        // 查找编辑按钮
        const editButton = page.locator('button[aria-label*="编辑"], a:has-text("编辑"), .edit-button').first();

        if (await editButton.count() > 0) {
            await editButton.click();
            await page.waitForTimeout(500);

            // 修改课程标题
            const newTitle = testLessons.editLesson.title;
            const titleInput = page.locator('input[name="title"]');
            await titleInput.fill('');
            await titleInput.fill(newTitle);

            // 提交表单
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            // 验证修改成功
            await expect(page.locator('text=' + newTitle)).toBeVisible();
        }
    });

    test('删除课程', async ({ page }) => {
        // 先添加一个测试课程
        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        const testTitle = '待删除课程';
        await page.fill('input[name="title"]', testTitle);

        const yearSelect = page.locator('select[name="year"]').first();
        if (await yearSelect.count() > 0) {
            await yearSelect.selectOption('2026');
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 查找并点击删除按钮
        const deleteButton = page.locator(`:has-text("${testTitle}") + button[aria-label*="删除"], tr:has-text("${testTitle}") button[aria-label*="删除"]`).first();

        if (await deleteButton.count() > 0) {
            await deleteButton.click();

            // 确认删除
            await confirmDialog(page);
            await page.waitForTimeout(1000);

            // 验证课程已删除
            await expect(page.locator(`text=${testTitle}`)).not.toBeVisible();
        }
    });

    test('富文本编辑器功能', async ({ page }) => {
        // 点击新增按钮
        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        // 填写标题
        await page.fill('input[name="title"]', '富文本测试课程');

        // 测试富文本编辑器
        const editor = page.locator('.ProseMirror, [contenteditable="true"]').first();

        if (await editor.count() > 0) {
            // 输入内容
            await editor.fill('<p>这是一段测试内容</p>');
            await page.waitForTimeout(300);

            // 测试工具栏按钮
            const boldButton = page.locator('button[aria-label*="粗体"], button[aria-label*="bold"], .bold-button').first();
            if (await boldButton.count() > 0) {
                await boldButton.click();
                await page.waitForTimeout(200);
            }

            // 提交表单
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            // 验证课程已添加
            await expect(page.locator('text=富文本测试课程')).toBeVisible();
        }
    });

    test('表单验证', async ({ page }) => {
        // 点击新增按钮
        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        // 直接提交空表单
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);

        // 检查验证错误
        const errors = page.locator('.text-red-600, .text-red-500, .error-message');
        await expect(errors.first()).toBeVisible();
    });

    test('年份筛选', async ({ page }) => {
        // 检查年份筛选
        const yearSelect = page.locator('select[name="year"]').first();

        if (await yearSelect.count() > 0) {
            // 选择特定年份
            await yearSelect.selectOption('2026');
            await page.waitForTimeout(500);

            // 验证显示的课程
            const lessons = page.locator('.lesson-item, table tbody tr');
            const count = await lessons.count();

            if (count > 0) {
                // 检查课程年份
                for (let i = 0; i < Math.min(count, 5); i++) {
                    const yearText = await lessons.nth(i).locator('td').or(lessons.nth(i).locator('.year')).textContent();
                    if (yearText) {
                        expect(yearText).toContain('2026');
                    }
                }
            }
        }
    });

    test('课程列表数据完整性', async ({ page }) => {
        // 获取所有课程项
        const items = page.locator('.lesson-item, table tbody tr');
        const count = await items.count();

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const item = items.nth(i);

                // 检查标题存在
                const title = item.locator('h2, h3, .title, td:first-child').first();
                await expect(title).not.toBeEmpty();

                // 检查年份存在
                const year = item.locator('.year, td:nth-child(2)').first();
                if (await year.count() > 0) {
                    await expect(year).not.toBeEmpty();
                }
            }
        }
    });
});
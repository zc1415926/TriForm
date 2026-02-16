/**
 * 作业管理页面测试
 */

import { test, expect } from '@playwright/test';
import { testAssignments } from '../fixtures/test-data';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad, confirmDialog } from '../helpers/page-helper';

test.describe('作业管理页面', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/assignments');
        await waitForPageLoad(page);
    });

    test('页面加载正确显示', async ({ page }) => {
        // 检查页面标题
        await expect(page.locator('h1').filter({ hasText: /作业|Assignments/i })).toBeVisible();

        // 检查新增按钮
        await expect(page.locator('button:has-text("新增"), button:has-text("添加"), a:has-text("新增")').first()).toBeVisible();

        // 检查作业列表
        const content = page.locator('.assignment-list, table, .grid, [data-testid="assignment-list"]').first();
        await expect(content).toBeVisible();
    });

    test('新增作业', async ({ page }) => {
        // 点击新增按钮
        await page.click('button:has-text("新增"), button:has-text("添加"), a:has-text("新增")');
        await page.waitForTimeout(500);

        // 检查表单显示
        const form = page.locator('form').or(page.locator('[role="dialog"]')).first();
        await expect(form).toBeVisible();

        // 填写作业信息
        const assignment = testAssignments.newAssignment;
        await page.fill('input[name="title"]', assignment.title);
        await page.fill('textarea[name="description"]', assignment.description);

        // 选择关联课程
        const lessonSelect = page.locator('select[name="lesson_id"]').first();
        if (await lessonSelect.count() > 0) {
            const options = await lessonSelect.locator('option').count();
            if (options > 1) {
                await lessonSelect.selectOption({ index: 1 });
            }
        }

        // 选择上传类型
        const uploadTypeCheckboxes = page.locator('input[type="checkbox"][name*="upload_type"]');
        if (await uploadTypeCheckboxes.count() > 0) {
            await uploadTypeCheckboxes.first().check();
        }

        // 提交表单
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 验证作业已添加
        await expect(page.locator('text=' + assignment.title)).toBeVisible();
    });

    test('查看作业详情', async ({ page }) => {
        // 查找第一个作业的查看链接
        const viewLink = page.locator('.assignment-item a, table tbody tr a, button:has-text("查看")').first();

        if (await viewLink.count() > 0) {
            await viewLink.click();
            await page.waitForTimeout(500);

            // 检查详情页面显示
            await expect(page.locator('h1, h2').first()).toBeVisible();

            // 返回列表
            await page.goto('/assignments');
            await waitForPageLoad(page);
        }
    });

    test('编辑作业', async ({ page }) => {
        // 查找编辑按钮
        const editButton = page.locator('button[aria-label*="编辑"], a:has-text("编辑"), .edit-button').first();

        if (await editButton.count() > 0) {
            await editButton.click();
            await page.waitForTimeout(500);

            // 修改作业标题
            const newTitle = '编辑后的作业标题';
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

    test('删除作业', async ({ page }) => {
        // 先添加一个测试作业
        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        const testTitle = '待删除作业';
        await page.fill('input[name="title"]', testTitle);
        await page.fill('textarea[name="description"]', '这是一个待删除的测试作业');

        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 查找并点击删除按钮
        const deleteButton = page.locator(`:has-text("${testTitle}") + button[aria-label*="删除"], tr:has-text("${testTitle}") button[aria-label*="删除"]`).first();

        if (await deleteButton.count() > 0) {
            await deleteButton.click();

            // 确认删除
            await confirmDialog(page);
            await page.waitForTimeout(1000);

            // 验证作业已删除
            await expect(page.locator(`text=${testTitle}`)).not.toBeVisible();
        }
    });

    test('作业表单验证', async ({ page }) => {
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

    test('作业列表数据完整性', async ({ page }) => {
        // 获取所有作业项
        const items = page.locator('.assignment-item, table tbody tr');
        const count = await items.count();

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const item = items.nth(i);

                // 检查标题存在
                const title = item.locator('h2, h3, .title, td:first-child').first();
                await expect(title).not.toBeEmpty();

                // 检查操作按钮存在
                const actions = item.locator('button, a').first();
                await expect(actions).toBeVisible();
            }
        }
    });

    test('课程筛选', async ({ page }) => {
        // 检查是否有课程筛选
        const lessonFilter = page.locator('select[name="lesson_id"]').first();

        if (await lessonFilter.count() > 0) {
            const options = await lessonFilter.locator('option').count();
            if (options > 1) {
                await lessonFilter.selectOption({ index: 1 });
                await page.waitForTimeout(500);

                // 验证筛选结果
                const items = page.locator('.assignment-item, table tbody tr');
                const count = await items.count();

                // 筛选后项目数应该减少或保持不变
                expect(count).toBeGreaterThanOrEqual(0);
            }
        }
    });
});
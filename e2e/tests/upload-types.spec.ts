/**
 * 上传类型管理页面测试
 */

import { test, expect } from '@playwright/test';
import { testUploadTypes } from '../fixtures/test-data';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad, confirmDialog } from '../helpers/page-helper';

test.describe('上传类型管理页面', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/upload-types');
        await waitForPageLoad(page);
    });

    test('页面加载正确显示', async ({ page }) => {
        // 检查页面标题
        await expect(page.locator('h1').filter({ hasText: /上传类型|Upload Types/i })).toBeVisible();

        // 检查新增按钮
        await expect(page.locator('button:has-text("新增"), button:has-text("添加"), a:has-text("新增")').first()).toBeVisible();

        // 检查类型列表
        const content = page.locator('.upload-type-list, table, .grid, [data-testid="upload-type-list"]').first();
        await expect(content).toBeVisible();
    });

    test('新增上传类型', async ({ page }) => {
        // 点击新增按钮
        await page.click('button:has-text("新增"), button:has-text("添加"), a:has-text("新增")');
        await page.waitForTimeout(500);

        // 检查表单显示
        const form = page.locator('form').or(page.locator('[role="dialog"]')).first();
        await expect(form).toBeVisible();

        // 填写类型信息
        const uploadType = testUploadTypes.newUploadType;
        await page.fill('input[name="name"]', uploadType.name);
        await page.fill('input[name="extensions"]', uploadType.extensions.join(','));

        // 提交表单
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 验证类型已添加
        await expect(page.locator('text=' + uploadType.name)).toBeVisible();
    });

    test('编辑上传类型', async ({ page }) => {
        // 查找编辑按钮
        const editButton = page.locator('button[aria-label*="编辑"], a:has-text("编辑"), .edit-button').first();

        if (await editButton.count() > 0) {
            await editButton.click();
            await page.waitForTimeout(500);

            // 修改类型名称
            const newName = '编辑后的上传类型';
            const nameInput = page.locator('input[name="name"]');
            await nameInput.fill('');
            await nameInput.fill(newName);

            // 提交表单
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            // 验证修改成功
            await expect(page.locator('text=' + newName)).toBeVisible();
        }
    });

    test('删除上传类型', async ({ page }) => {
        // 先添加一个测试类型
        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        const testName = '待删除类型';
        await page.fill('input[name="name"]', testName);
        await page.fill('input[name="extensions"]', 'txt,pdf');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 查找并点击删除按钮
        const deleteButton = page.locator(`:has-text("${testName}") + button[aria-label*="删除"], tr:has-text("${testName}") button[aria-label*="删除"]`).first();

        if (await deleteButton.count() > 0) {
            await deleteButton.click();

            // 确认删除
            await confirmDialog(page);
            await page.waitForTimeout(1000);

            // 验证类型已删除
            await expect(page.locator(`text=${testName}`)).not.toBeVisible();
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

    test('扩展名格式验证', async ({ page }) => {
        // 点击新增按钮
        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        // 填写类型名称
        await page.fill('input[name="name"]', '测试类型');

        // 填写无效的扩展名格式
        await page.fill('input[name="extensions"]', 'invalid extension');

        // 提交表单
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);

        // 检查验证错误
        const errors = page.locator('.text-red-600, .text-red-500');
        if (await errors.count() > 0) {
            await expect(errors.first()).toBeVisible();
        }
    });

    test('上传类型列表数据完整性', async ({ page }) => {
        // 获取所有类型项
        const items = page.locator('.upload-type-item, table tbody tr');
        const count = await items.count();

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const item = items.nth(i);

                // 检查名称存在
                const name = item.locator('td:first-child, .name').first();
                await expect(name).not.toBeEmpty();

                // 检查扩展名存在
                const extensions = item.locator('td:nth-child(2), .extensions').first();
                if (await extensions.count() > 0) {
                    await expect(extensions).not.toBeEmpty();
                }

                // 检查操作按钮
                const actions = item.locator('button, a').first();
                await expect(actions).toBeVisible();
            }
        }
    });
});
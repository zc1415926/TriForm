/**
 * 学生管理页面测试
 */

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth-helper';
import { testStudents } from '../fixtures/test-data';
import { waitForPageLoad, confirmDialog, selectDropdownOption } from '../helpers/page-helper';

test.describe('学生管理页面', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
        await page.goto('/students');
        await waitForPageLoad(page);
    });

    test('页面加载正确显示', async ({ page }) => {
        // 检查页面标题
        await expect(page.locator('h1').filter({ hasText: /学生|Students/i })).toBeVisible();

        // 检查新增按钮
        await expect(page.locator('button:has-text("新增"), button:has-text("添加"), a:has-text("新增")').first()).toBeVisible();

        // 检查表格存在
        await expect(page.locator('table')).toBeVisible();

        // 检查表头
        const headers = ['姓名', '年级', '班级', '年份', '总分', '作业数'];
        for (const header of headers) {
            await expect(page.locator('th').filter({ hasText: header }).first()).toBeVisible();
        }
    });

    test('年份筛选功能', async ({ page }) => {
        // 检查年份筛选下拉框
        const yearSelect = page.locator('select[name="year"]').or(page.locator('[data-testid="year-select"]')).first();

        if (await yearSelect.count() > 0) {
            // 选择特定年份
            await selectDropdownOption(page, 'select[name="year"]', '2026');
            await page.waitForTimeout(500);

            // 验证表格数据
            const rows = page.locator('table tbody tr');
            if (await rows.count() > 0) {
                const yearCell = rows.first().locator('td').nth(3);
                await expect(yearCell).toHaveText('2026');
            }

            // 清除筛选
            await selectDropdownOption(page, 'select[name="year"]', '全部');
            await page.waitForTimeout(500);
        }
    });

    test('表格排序功能', async ({ page }) => {
        // 点击班级表头进行排序
        const classHeader = page.locator('th').filter({ hasText: '班级' }).first();
        await classHeader.click();
        await page.waitForTimeout(500);

        // 获取第一行的班级值
        const firstRowClass = await page.locator('table tbody tr:first-child td:nth-child(3)').textContent();

        // 再次点击切换排序方向
        await classHeader.click();
        await page.waitForTimeout(500);

        // 获取第一行的班级值，应该不同
        const firstRowClassAfter = await page.locator('table tbody tr:first-child td:nth-child(3)').textContent();
        expect(firstRowClass).not.toBe(firstRowClassAfter);
    });

    test('新增学生', async ({ page }) => {
        // 点击新增按钮
        await page.click('button:has-text("新增"), button:has-text("添加"), a:has-text("新增")');
        await page.waitForTimeout(500);

        // 检查弹窗或表单显示
        const form = page.locator('form').or(page.locator('[role="dialog"]')).first();
        await expect(form).toBeVisible();

        // 填写学生信息
        const student = testStudents.newStudent;
        await page.fill('input[name="name"]', student.name);
        await page.fill('input[name="grade"]', student.grade);
        await page.fill('input[name="class"]', student.class);
        await page.fill('input[name="year"]', student.year);

        // 提交表单
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 验证学生已添加
        await expect(page.locator('table tbody tr').filter({ hasText: student.name })).toBeVisible();
    });

    test('编辑学生', async ({ page }) => {
        // 查找编辑按钮
        const editButton = page.locator('table tbody tr:first-child button[aria-label*="编辑"], table tbody tr:first-child a:has-text("编辑")').first();

        if (await editButton.count() > 0) {
            await editButton.click();
            await page.waitForTimeout(500);

            // 修改学生姓名
            const newName = '编辑后的学生';
            const nameInput = page.locator('input[name="name"]');
            await nameInput.fill('');
            await nameInput.fill(newName);

            // 提交表单
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            // 验证修改成功
            await expect(page.locator('table tbody tr').filter({ hasText: newName })).toBeVisible();
        }
    });

    test('删除学生', async ({ page }) => {
        // 先添加一个测试学生
        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        const testName = '待删除学生';
        await page.fill('input[name="name"]', testName);
        await page.fill('input[name="grade"]', '3');
        await page.fill('input[name="class"]', '2');
        await page.fill('input[name="year"]', '2026');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 查找并点击删除按钮
        const deleteButton = page.locator(`table tbody tr:has-text("${testName}") button[aria-label*="删除"]`).first();

        if (await deleteButton.count() > 0) {
            await deleteButton.click();

            // 确认删除
            await confirmDialog(page);
            await page.waitForTimeout(1000);

            // 验证学生已删除
            await expect(page.locator(`table tbody tr:has-text("${testName}")`)).not.toBeVisible();
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

    test('表格数据完整性', async ({ page }) => {
        // 获取所有表格行
        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();

        if (rowCount > 0) {
            // 检查每行都有必要的列数据
            for (let i = 0; i < rowCount; i++) {
                const row = rows.nth(i);
                const cells = row.locator('td');
                await expect(cells.nth(0)).not.toBeEmpty(); // 姓名
                await expect(cells.nth(1)).not.toBeEmpty(); // 年级
                await expect(cells.nth(2)).not.toBeEmpty(); // 班级
                await expect(cells.nth(3)).not.toBeEmpty(); // 年份
            }
        }
    });

    test('搜索或筛选功能', async ({ page }) => {
        // 检查是否有搜索输入框
        const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], input[name="search"]').first();

        if (await searchInput.count() > 0) {
            // 输入搜索关键词
            await searchInput.fill('张');
            await page.waitForTimeout(500);

            // 验证搜索结果
            const rows = page.locator('table tbody tr');
            const rowCount = await rows.count();

            if (rowCount > 0) {
                // 检查所有行都包含搜索关键词
                for (let i = 0; i < rowCount; i++) {
                    const rowText = await rows.nth(i).textContent();
                    expect(rowText).toContain('张');
                }
            }

            // 清空搜索
            await searchInput.fill('');
            await page.waitForTimeout(500);
        }
    });

    test('分页功能', async ({ page }) => {
        // 检查分页组件
        const pagination = page.locator('.pagination, [role="navigation"]').first();

        if (await pagination.count() > 0) {
            const nextButton = pagination.locator('button:has-text("下一页"), a:has-text("下一页"), button:has-text("Next")').first();

            if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
                const firstPageText = await page.locator('table tbody tr:first-child td:first-child').textContent();

                await nextButton.click();
                await page.waitForTimeout(500);

                const secondPageText = await page.locator('table tbody tr:first-child td:first-child').textContent();
                expect(firstPageText).not.toBe(secondPageText);
            }
        }
    });
});
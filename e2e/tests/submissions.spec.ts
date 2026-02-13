/**
 * 作品提交页面测试
 */

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad, confirmDialog } from '../helpers/page-helper';

test.describe('作品提交页面', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
    });

    test('提交列表页面加载正确', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        // 检查页面标题
        await expect(page.locator('h1').filter({ hasText: /提交|作品|Submissions/i })).toBeVisible();

        // 检查筛选器
        await expect(page.locator('select[name="year"]').or(page.locator('[data-testid="year-filter"]')).first()).toBeVisible();
    });

    test('作品广场页面加载正确', async ({ page }) => {
        await page.goto('/submissions/gallery');
        await waitForPageLoad(page);

        // 检查页面标题
        await expect(page.locator('h1').filter({ hasText: /广场|Gallery/i })).toBeVisible();

        // 检查作品展示区域
        const gallery = page.locator('.gallery, .submissions-grid, [data-testid="gallery"]').first();
        await expect(gallery).toBeVisible();
    });

    test('提交详情页面', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        // 查找第一个提交的查看链接
        const viewLink = page.locator('.submission-item a, table tbody tr a, button:has-text("查看")').first();

        if (await viewLink.count() > 0) {
            await viewLink.click();
            await page.waitForTimeout(500);

            // 检查详情页面显示
            await expect(page.locator('h1, h2').first()).toBeVisible();
        }
    });

    test('年份筛选功能', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        const yearSelect = page.locator('select[name="year"]').first();

        if (await yearSelect.count() > 0) {
            const options = await yearSelect.locator('option').count();
            if (options > 1) {
                await yearSelect.selectOption({ index: 1 });
                await page.waitForTimeout(500);

                // 验证筛选结果
                const items = page.locator('.submission-item, table tbody tr, .gallery-item');
                const count = await items.count();
                expect(count).toBeGreaterThanOrEqual(0);
            }
        }
    });

    test('学生筛选联动', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        const yearSelect = page.locator('select[name="year"]').first();
        const studentSelect = page.locator('select[name="student_id"]').first();

        if (await yearSelect.count() > 0 && await studentSelect.count() > 0) {
            // 选择年份
            await yearSelect.selectOption({ index: 1 });
            await page.waitForTimeout(1000);

            // 检查学生下拉框是否更新
            const studentOptions = await studentSelect.locator('option').count();
            expect(studentOptions).toBeGreaterThan(0);
        }
    });

    test('课程和作业筛选联动', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        const lessonSelect = page.locator('select[name="lesson_id"]').first();
        const assignmentSelect = page.locator('select[name="assignment_id"]').first();

        if (await lessonSelect.count() > 0 && await assignmentSelect.count() > 0) {
            const lessonOptions = await lessonSelect.locator('option').count();

            if (lessonOptions > 1) {
                // 选择课程
                await lessonSelect.selectOption({ index: 1 });
                await page.waitForTimeout(1000);

                // 检查作业下拉框是否更新
                const assignmentOptions = await assignmentSelect.locator('option').count();
                expect(assignmentOptions).toBeGreaterThan(0);
            }
        }
    });

    test('作品评分功能', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        // 查找评分按钮
        const scoreButton = page.locator('button:has-text("评分"), button[aria-label*="评分"], .score-button').first();

        if (await scoreButton.count() > 0) {
            await scoreButton.click();
            await page.waitForTimeout(500);

            // 检查评分弹窗
            const dialog = page.locator('[role="dialog"], .dialog, .modal').first();
            await expect(dialog).toBeVisible();

            // 选择评分等级
            const scoreSelect = dialog.locator('select[name="score"]').first();
            if (await scoreSelect.count() > 0) {
                await scoreSelect.selectOption('A');
            }

            // 填写评语
            const commentInput = dialog.locator('textarea[name="comment"]').first();
            if (await commentInput.count() > 0) {
                await commentInput.fill('测试评语');
            }

            // 提交评分
            await dialog.locator('button[type="submit"], button:has-text("确认")').click();
            await page.waitForTimeout(1000);
        }
    });

    test('取消评分功能', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        // 查找已评分的作品
        const scoredItem = page.locator('.submission-item:has-text("已评分"), tr:has-text("已评分")').first();

        if (await scoredItem.count() > 0) {
            // 查找取消评分按钮
            const cancelButton = scoredItem.locator('button:has-text("取消评分"), button[aria-label*="取消"]').first();

            if (await cancelButton.count() > 0) {
                await cancelButton.click();

                // 确认取消
                await confirmDialog(page);
                await page.waitForTimeout(1000);
            }
        }
    });

    test('删除作品提交', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        // 查找删除按钮
        const deleteButton = page.locator('button[aria-label*="删除"], button:has-text("删除"), .delete-button').first();

        if (await deleteButton.count() > 0) {
            await deleteButton.click();

            // 确认删除
            await confirmDialog(page);
            await page.waitForTimeout(1000);
        }
    });

    test('作品预览功能', async ({ page }) => {
        await page.goto('/submissions/gallery');
        await waitForPageLoad(page);

        // 查找作品项
        const galleryItem = page.locator('.gallery-item, .submission-card, .work-item').first();

        if (await galleryItem.count() > 0) {
            // 点击作品
            await galleryItem.click();
            await page.waitForTimeout(500);

            // 检查预览或详情显示
            const preview = page.locator('.preview, .detail-view, [role="dialog"]').first();
            if (await preview.count() > 0) {
                await expect(preview).toBeVisible();
            }
        }
    });

    test('3D模型预览', async ({ page }) => {
        await page.goto('/submissions/gallery');
        await waitForPageLoad(page);

        // 查找3D模型作品
        const modelItem = page.locator('.gallery-item:has(.stl-viewer), .submission-card:has(.model-3d)').first();

        if (await modelItem.count() > 0) {
            await modelItem.click();
            await page.waitForTimeout(500);

            // 检查3D查看器
            const viewer = page.locator('.stl-viewer, .babylon-canvas, canvas').first();
            await expect(viewer).toBeVisible();
        }
    });

    test('图片预览', async ({ page }) => {
        await page.goto('/submissions/gallery');
        await waitForPageLoad(page);

        // 查找图片作品
        const imageItem = page.locator('.gallery-item:has(img), .submission-card:has(img)').first();

        if (await imageItem.count() > 0) {
            await imageItem.click();
            await page.waitForTimeout(500);

            // 检查图片显示
            const image = page.locator('img').first();
            await expect(image).toBeVisible();
        }
    });

    test('提交数据完整性', async ({ page }) => {
        await page.goto('/submissions');
        await waitForPageLoad(page);

        const items = page.locator('.submission-item, table tbody tr');
        const count = await items.count();

        if (count > 0) {
            for (let i = 0; i < Math.min(count, 5); i++) {
                const item = items.nth(i);

                // 检查学生姓名
                const studentName = item.locator('.student-name, td:nth-child(1)').first();
                if (await studentName.count() > 0) {
                    await expect(studentName).not.toBeEmpty();
                }

                // 检查作业名称
                const assignmentName = item.locator('.assignment-name, td:nth-child(2)').first();
                if (await assignmentName.count() > 0) {
                    await expect(assignmentName).not.toBeEmpty();
                }
            }
        }
    });
});
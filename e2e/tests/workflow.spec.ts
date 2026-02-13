/**
 * 完整工作流程端到端测试
 */

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad, confirmDialog } from '../helpers/page-helper';

test.describe('完整工作流程', () => {
    test('创建课程 -> 创建作业 -> 查看提交流程', async ({ page }) => {
        // 1. 登录
        await login(page, 'admin');

        // 2. 创建课程
        await page.goto('/lessons');
        await waitForPageLoad(page);

        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        const lessonTitle = 'E2E测试课程' + Date.now();
        await page.fill('input[name="title"]', lessonTitle);

        // 填写富文本内容
        const editor = page.locator('.ProseMirror, [contenteditable="true"], textarea[name="content"]').first();
        if (await editor.count() > 0) {
            await editor.fill('<p>E2E测试课程内容</p>');
        }

        // 选择年份
        const yearSelect = page.locator('select[name="year"]').first();
        if (await yearSelect.count() > 0) {
            await yearSelect.selectOption('2026');
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 验证课程已创建
        await expect(page.locator('text=' + lessonTitle)).toBeVisible();

        // 3. 创建作业
        await page.goto('/assignments');
        await waitForPageLoad(page);

        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        const assignmentTitle = 'E2E测试作业' + Date.now();
        await page.fill('input[name="title"]', assignmentTitle);
        await page.fill('textarea[name="description"]', '这是E2E测试作业的描述');

        // 选择课程
        const lessonSelect = page.locator('select[name="lesson_id"]').first();
        if (await lessonSelect.count() > 0) {
            // 选择刚才创建的课程
            const options = await lessonSelect.locator('option').allTextContents();
            for (let i = 0; i < options.length; i++) {
                if (options[i].includes(lessonTitle)) {
                    await lessonSelect.selectOption({ index: i });
                    break;
                }
            }
        }

        // 选择上传类型
        const uploadTypeCheckboxes = page.locator('input[type="checkbox"][name*="upload_type"]');
        if (await uploadTypeCheckboxes.count() > 0) {
            await uploadTypeCheckboxes.first().check();
        }

        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 验证作业已创建
        await expect(page.locator('text=' + assignmentTitle)).toBeVisible();

        // 4. 查看提交页面
        await page.goto('/submissions');
        await waitForPageLoad(page);

        // 验证提交页面加载
        await expect(page.locator('h1').filter({ hasText: /提交|Submissions/i })).toBeVisible();

        // 选择年份筛选
        const submissionYearSelect = page.locator('select[name="year"]').first();
        if (await submissionYearSelect.count() > 0) {
            await submissionYearSelect.selectOption('2026');
            await page.waitForTimeout(500);
        }
    });

    test('学生管理完整流程', async ({ page }) => {
        // 1. 登录
        await login(page, 'admin');

        // 2. 进入学生管理
        await page.goto('/students');
        await waitForPageLoad(page);

        // 3. 添加学生
        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        const studentName = 'E2E测试学生' + Date.now();
        await page.fill('input[name="name"]', studentName);
        await page.fill('input[name="grade"]', '5');
        await page.fill('input[name="class"]', '3');
        await page.fill('input[name="year"]', '2026');

        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        // 验证学生已添加
        await expect(page.locator('table tbody tr').filter({ hasText: studentName })).toBeVisible();

        // 4. 编辑学生
        const editButton = page.locator(`tr:has-text("${studentName}") button[aria-label*="编辑"]`).first();
        if (await editButton.count() > 0) {
            await editButton.click();
            await page.waitForTimeout(500);

            const newName = studentName + '_已编辑';
            await page.fill('input[name="name"]', newName);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            // 验证编辑成功
            await expect(page.locator('table tbody tr').filter({ hasText: newName })).toBeVisible();
        }

        // 5. 年份筛选
        const yearSelect = page.locator('select[name="year"]').first();
        if (await yearSelect.count() > 0) {
            await yearSelect.selectOption('2026');
            await page.waitForTimeout(500);

            // 验证筛选结果
            const rows = page.locator('table tbody tr');
            if (await rows.count() > 0) {
                const yearCell = rows.first().locator('td').nth(3);
                await expect(yearCell).toHaveText('2026');
            }
        }
    });

    test('作品评分工作流程', async ({ page }) => {
        // 1. 登录
        await login(page, 'admin');

        // 2. 进入提交页面
        await page.goto('/submissions');
        await waitForPageLoad(page);

        // 3. 选择一个作品进行评分
        const scoreButton = page.locator('button:has-text("评分"), button[aria-label*="评分"]').first();

        if (await scoreButton.count() > 0) {
            await scoreButton.click();
            await page.waitForTimeout(500);

            // 填写评分
            const dialog = page.locator('[role="dialog"]').first();

            const scoreSelect = dialog.locator('select[name="score"]').first();
            if (await scoreSelect.count() > 0) {
                await scoreSelect.selectOption('A');
            }

            const commentInput = dialog.locator('textarea[name="comment"]').first();
            if (await commentInput.count() > 0) {
                await commentInput.fill('E2E测试评语：作品完成度很高！');
            }

            await dialog.locator('button[type="submit"], button:has-text("确认")').click();
            await page.waitForTimeout(1000);

            // 验证评分成功
            await expect(page.locator('text=已评分').first()).toBeVisible();
        }
    });

    test('作品广场浏览流程', async ({ page }) => {
        // 1. 登录
        await login(page, 'admin');

        // 2. 进入作品广场
        await page.goto('/submissions/gallery');
        await waitForPageLoad(page);

        // 3. 验证页面元素
        await expect(page.locator('h1').filter({ hasText: /广场|Gallery/i })).toBeVisible();

        // 4. 点击作品查看详情
        const galleryItem = page.locator('.gallery-item, .submission-card').first();

        if (await galleryItem.count() > 0) {
            await galleryItem.click();
            await page.waitForTimeout(500);

            // 检查详情显示
            const detail = page.locator('.preview, .detail-view, [role="dialog"]').first();
            if (await detail.count() > 0) {
                await expect(detail).toBeVisible();
            }
        }
    });

    test('多页面导航流程', async ({ page }) => {
        // 1. 登录
        await login(page, 'admin');

        const pages = [
            { url: '/dashboard', name: '仪表板' },
            { url: '/students', name: '学生管理' },
            { url: '/lessons', name: '课程管理' },
            { url: '/assignments', name: '作业管理' },
            { url: '/submissions', name: '提交管理' },
            { url: '/submissions/gallery', name: '作品广场' },
            { url: '/upload-types', name: '上传类型' },
        ];

        for (const pageInfo of pages) {
            await page.goto(pageInfo.url);
            await waitForPageLoad(page);

            // 验证页面加载
            await expect(page).toHaveURL(pageInfo.url);
            await expect(page.locator('h1').first()).toBeVisible();
        }
    });

    test('错误处理和边界情况', async ({ page }) => {
        // 1. 登录
        await login(page, 'admin');

        // 2. 测试不存在的页面
        await page.goto('/non-existent-page');
        await waitForPageLoad(page);

        // 应该显示404错误或重定向
        const currentUrl = page.url();
        expect(currentUrl).not.toContain('/non-existent-page');

        // 3. 测试无效的表单提交
        await page.goto('/students');
        await waitForPageLoad(page);

        await page.click('button:has-text("新增"), button:has-text("添加")');
        await page.waitForTimeout(500);

        // 提交空表单
        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);

        // 验证表单验证错误
        const errors = page.locator('.text-red-600, .text-red-500, .error-message');
        await expect(errors.first()).toBeVisible();
    });
});
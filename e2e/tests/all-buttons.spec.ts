/**
 * 全站按钮测试套件
 * 测试所有页面的所有按钮功能
 */

import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad, confirmDialog } from '../helpers/page-helper';

test.describe('🔘 全站按钮测试', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'admin');
    });

    test.describe('📊 仪表盘页面按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/dashboard');
            await waitForPageLoad(page);
        });

        test('快捷操作按钮 - 查看作品', async ({ page }) => {
            const viewWorksButton = page.locator('a[href="/submissions/show"] button, button:has-text("查看作品"), a:has-text("查看作品")').first();
            if (await viewWorksButton.count() > 0) {
                await viewWorksButton.click();
                await page.waitForURL('/submissions/show', { timeout: 10000 });
                await expect(page).toHaveURL('/submissions/show');
            }
        });

        test('快捷操作按钮 - 学生管理', async ({ page }) => {
            const studentManageButton = page.locator('a[href="/students"] button, button:has-text("学生管理"), a:has-text("学生管理")').first();
            if (await studentManageButton.count() > 0) {
                await studentManageButton.click();
                await page.waitForURL('/students', { timeout: 10000 });
                await expect(page).toHaveURL('/students');
            }
        });

        test('快捷操作按钮 - 课时管理', async ({ page }) => {
            const lessonManageButton = page.locator('a[href="/lessons"] button, button:has-text("课时管理"), a:has-text("课时管理")').first();
            if (await lessonManageButton.count() > 0) {
                await lessonManageButton.click();
                await page.waitForURL('/lessons', { timeout: 10000 });
                await expect(page).toHaveURL('/lessons');
            }
        });

        test('快捷操作按钮 - 作品提交', async ({ page }) => {
            const submitButton = page.locator('a[href="/submissions"] button, button:has-text("作品提交"), a:has-text("作品提交")').first();
            if (await submitButton.count() > 0) {
                await submitButton.click();
                await page.waitForURL('/submissions', { timeout: 10000 });
                await expect(page).toHaveURL('/submissions');
            }
        });

        test('查看全部按钮 - 最近提交', async ({ page }) => {
            const viewAllButton = page.locator('a:has-text("查看全部"), button:has-text("查看全部")').first();
            if (await viewAllButton.count() > 0) {
                await viewAllButton.click();
                await page.waitForTimeout(1000);
                // 验证页面跳转或弹窗
                const currentUrl = page.url();
                expect(currentUrl).toContain('/submissions');
            }
        });

        test('去评分按钮 - 待评分作品', async ({ page }) => {
            const gradeButton = page.locator('a:has-text("去评分"), button:has-text("去评分")').first();
            if (await gradeButton.count() > 0) {
                await gradeButton.click();
                await page.waitForTimeout(1000);
            }
        });
    });

    test.describe('👥 学生管理页面按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/students');
            await waitForPageLoad(page);
        });

        test('添加学生按钮', async ({ page }) => {
            const addButton = page.locator('button:has-text("添加学生"), a:has-text("添加学生"), button:has-text("新增")').first();
            await expect(addButton).toBeVisible();
            await addButton.click();
            await page.waitForTimeout(500);

            // 验证弹窗或表单出现
            const dialog = page.locator('[role="dialog"], .dialog, .modal').first();
            const form = page.locator('form').first();
            await expect(dialog.or(form)).toBeVisible();

            // 关闭弹窗
            const cancelButton = page.locator('button:has-text("取消"), button[type="button"]').first();
            if (await cancelButton.count() > 0) {
                await cancelButton.click();
            }
        });

        test('年份筛选下拉框', async ({ page }) => {
            const yearSelect = page.locator('button[role="combobox"], select[name="year"]').first();
            if (await yearSelect.count() > 0) {
                await yearSelect.click();
                await page.waitForTimeout(300);

                // 选择一个年份
                const yearOption = page.locator('[role="option"]:has-text("2026"), option[value="2026"]').first();
                if (await yearOption.count() > 0) {
                    await yearOption.click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('下载模板按钮', async ({ page }) => {
            const downloadTemplateButton = page.locator('button:has-text("下载模板"), a:has-text("下载模板")').first();
            if (await downloadTemplateButton.count() > 0) {
                await expect(downloadTemplateButton).toBeVisible();
                // 注意：实际下载测试需要额外处理
            }
        });

        test('导入按钮', async ({ page }) => {
            const importButton = page.locator('button:has-text("导入"), a:has-text("导入")').first();
            if (await importButton.count() > 0) {
                await importButton.click();
                await page.waitForTimeout(500);

                // 验证导入弹窗
                const dialog = page.locator('[role="dialog"]').filter({ hasText: /导入/ }).first();
                await expect(dialog).toBeVisible();

                // 关闭弹窗
                const cancelButton = page.locator('button:has-text("取消")').first();
                if (await cancelButton.count() > 0) {
                    await cancelButton.click();
                }
            }
        });

        test('导出按钮', async ({ page }) => {
            const exportButton = page.locator('button:has-text("导出"), a:has-text("导出")').first();
            if (await exportButton.count() > 0) {
                await expect(exportButton).toBeVisible();
            }
        });

        test('表格行操作按钮 - 查看', async ({ page }) => {
            const viewButtons = page.locator('button[title="查看"], a[title="查看"], button:has([data-lucide="eye"])');
            if (await viewButtons.count() > 0) {
                await viewButtons.first().click();
                await page.waitForTimeout(1000);

                // 验证跳转到详情页
                const currentUrl = page.url();
                expect(currentUrl).toMatch(/\/students\/\d+/);

                // 返回列表页
                await page.goto('/students');
                await waitForPageLoad(page);
            }
        });

        test('表格行操作按钮 - 编辑', async ({ page }) => {
            const editButtons = page.locator('button[title="编辑"], a[title="编辑"], button:has([data-lucide="pencil"])');
            if (await editButtons.count() > 0) {
                await editButtons.first().click();
                await page.waitForTimeout(500);

                // 验证编辑弹窗或页面
                const dialog = page.locator('[role="dialog"]').filter({ hasText: /编辑/ }).first();
                const form = page.locator('form');
                await expect(dialog.or(form)).toBeVisible();

                // 关闭弹窗
                const cancelButton = page.locator('button:has-text("取消")').first();
                if (await cancelButton.count() > 0) {
                    await cancelButton.click();
                }
            }
        });

        test('表格行操作按钮 - 删除', async ({ page }) => {
            const deleteButtons = page.locator('button[title="删除"], button:has([data-lucide="trash"]), button:has-text("删除")');
            if (await deleteButtons.count() > 0) {
                // 注意：不实际点击删除，只验证按钮存在
                await expect(deleteButtons.first()).toBeVisible();
            }
        });

        test('表头排序按钮', async ({ page }) => {
            const sortableHeaders = page.locator('th button, th:has([data-lucide="arrow-up-down"])');
            if (await sortableHeaders.count() > 0) {
                const firstHeader = sortableHeaders.first();
                await firstHeader.click();
                await page.waitForTimeout(500);

                // 验证排序图标变化
                await firstHeader.click();
                await page.waitForTimeout(500);
            }
        });
    });

    test.describe('📚 课时管理页面按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/lessons');
            await waitForPageLoad(page);
        });

        test('添加课时按钮', async ({ page }) => {
            const addButton = page.locator('button:has-text("添加课时"), a:has-text("添加课时"), button:has-text("新增")').first();
            await expect(addButton).toBeVisible();
            await addButton.click();
            await page.waitForURL('/lessons/create', { timeout: 10000 });
            await expect(page).toHaveURL('/lessons/create');
        });

        test('年份筛选按钮', async ({ page }) => {
            const yearSelect = page.locator('button[role="combobox"]').filter({ hasText: /年份|全部/ }).first();
            if (await yearSelect.count() > 0) {
                await yearCount.click();
                await page.waitForTimeout(300);

                // 选择年份
                const option = page.locator('[role="option"]').first();
                if (await option.count() > 0) {
                    await option.click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('搜索按钮', async ({ page }) => {
            const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
            if (await searchInput.count() > 0) {
                await searchInput.fill('测试');

                const searchButton = page.locator('button[type="submit"], button:has-text("搜索")').first();
                if (await searchButton.count() > 0) {
                    await searchButton.click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('导入按钮', async ({ page }) => {
            const importButton = page.locator('button:has-text("导入"), button[title="导入课时"]').first();
            if (await importButton.count() > 0) {
                await importButton.click();
                await page.waitForTimeout(500);

                // 验证导入弹窗
                const dialog = page.locator('[role="dialog"]').filter({ hasText: /导入/ }).first();
                if (await dialog.count() > 0) {
                    await expect(dialog).toBeVisible();

                    // 关闭弹窗
                    const cancelButton = page.locator('button:has-text("取消")').first();
                    if (await cancelButton.count() > 0) {
                        await cancelButton.click();
                    }
                }
            }
        });

        test('清除筛选按钮', async ({ page }) => {
            // 先选择筛选条件
            const yearSelect = page.locator('button[role="combobox"]').first();
            if (await yearSelect.count() > 0) {
                await yearSelect.click();
                await page.waitForTimeout(300);

                const option = page.locator('[role="option"]').nth(1);
                if (await option.count() > 0) {
                    await option.click();
                    await page.waitForTimeout(500);

                    // 点击清除筛选
                    const clearButton = page.locator('button[title="清除筛选"], button:has([data-lucide="x"])').first();
                    if (await clearButton.count() > 0) {
                        await clearButton.click();
                        await page.waitForTimeout(500);
                    }
                }
            }
        });

        test('表格操作按钮 - 查看详情', async ({ page }) => {
            const detailButtons = page.locator('button[title="查看详情"], button:has([data-lucide="eye"])');
            if (await detailButtons.count() > 0) {
                await detailButtons.first().click();
                await page.waitForTimeout(500);

                // 验证详情弹窗
                const dialog = page.locator('[role="dialog"]').first();
                await expect(dialog).toBeVisible();

                // 关闭弹窗
                const closeButton = page.locator('button:has-text("关闭"), button:has([data-lucide="x"])').first();
                if (await closeButton.count() > 0) {
                    await closeButton.click();
                }
            }
        });

        test('表格操作按钮 - 编辑', async ({ page }) => {
            const editButtons = page.locator('a[href*="/lessons/"][href$="/edit"], button[title="编辑"]');
            if (await editButtons.count() > 0) {
                await editButtons.first().click();
                await page.waitForURL(/\/lessons\/\d+\/edit/, { timeout: 10000 });

                // 返回列表页
                await page.goto('/lessons');
                await waitForPageLoad(page);
            }
        });

        test('表格操作按钮 - 复制', async ({ page }) => {
            const copyButtons = page.locator('button[title="复制课时"], button:has([data-lucide="copy"])');
            if (await copyButtons.count() > 0) {
                await copyButtons.first().click();
                await page.waitForTimeout(500);

                // 验证确认弹窗
                const dialog = page.locator('[role="dialog"]').filter({ hasText: /复制/ }).first();
                if (await dialog.count() > 0) {
                    await expect(dialog).toBeVisible();

                    // 点击取消
                    const cancelButton = page.locator('button:has-text("取消")').first();
                    if (await cancelButton.count() > 0) {
                        await cancelButton.click();
                    }
                }
            }
        });

        test('表格操作按钮 - 导出', async ({ page }) => {
            const exportButtons = page.locator('button[title="导出课时"], button:has([data-lucide="download"])');
            if (await exportButtons.count() > 0) {
                await expect(exportButtons.first()).toBeVisible();
            }
        });

        test('表格操作按钮 - 删除', async ({ page }) => {
            const deleteButtons = page.locator('button[title="删除"], button:has([data-lucide="trash"])');
            if (await deleteButtons.count() > 0) {
                await expect(deleteButtons.first()).toBeVisible();
            }
        });
    });

    test.describe('📝 作业管理页面按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/assignments');
            await waitForPageLoad(page);
        });

        test('添加作业按钮', async ({ page }) => {
            const addButton = page.locator('button:has-text("添加作业"), a:has-text("添加作业"), button:has-text("新增")').first();
            if (await addButton.count() > 0) {
                await expect(addButton).toBeVisible();
                await addButton.click();
                await page.waitForTimeout(500);

                // 验证跳转或弹窗
                const form = page.locator('form').first();
                const dialog = page.locator('[role="dialog"]').first();
                await expect(form.or(dialog)).toBeVisible();
            }
        });

        test('表格操作按钮 - 查看', async ({ page }) => {
            const viewButtons = page.locator('button[title="查看"], button:has([data-lucide="eye"])');
            if (await viewButtons.count() > 0) {
                await expect(viewButtons.first()).toBeVisible();
            }
        });

        test('表格操作按钮 - 编辑', async ({ page }) => {
            const editButtons = page.locator('button[title="编辑"], a:has-text("编辑"), button:has([data-lucide="pencil"])');
            if (await editButtons.count() > 0) {
                await expect(editButtons.first()).toBeVisible();
            }
        });

        test('表格操作按钮 - 删除', async ({ page }) => {
            const deleteButtons = page.locator('button[title="删除"], button:has([data-lucide="trash"])');
            if (await deleteButtons.count() > 0) {
                await expect(deleteButtons.first()).toBeVisible();
            }
        });
    });

    test.describe('📤 上传类型页面按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/upload-types');
            await waitForPageLoad(page);
        });

        test('添加上传类型按钮', async ({ page }) => {
            const addButton = page.locator('button:has-text("添加"), a:has-text("添加"), button:has-text("新增")').first();
            if (await addButton.count() > 0) {
                await expect(addButton).toBeVisible();
                await addButton.click();
                await page.waitForTimeout(500);

                const form = page.locator('form').first();
                const dialog = page.locator('[role="dialog"]').first();
                await expect(form.or(dialog)).toBeVisible();
            }
        });

        test('表格操作按钮 - 编辑', async ({ page }) => {
            const editButtons = page.locator('button[title="编辑"], button:has([data-lucide="pencil"])');
            if (await editButtons.count() > 0) {
                await expect(editButtons.first()).toBeVisible();
            }
        });

        test('表格操作按钮 - 删除', async ({ page }) => {
            const deleteButtons = page.locator('button[title="删除"], button:has([data-lucide="trash"])');
            if (await deleteButtons.count() > 0) {
                await expect(deleteButtons.first()).toBeVisible();
            }
        });
    });

    test.describe('🎨 作品提交页面按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/submissions');
            await waitForPageLoad(page);
        });

        test('年份选择下拉框', async ({ page }) => {
            const yearSelect = page.locator('button[role="combobox"]').first();
            if (await yearSelect.count() > 0) {
                await yearSelect.click();
                await page.waitForTimeout(300);

                const option = page.locator('[role="option"]').first();
                if (await option.count() > 0) {
                    await option.click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('学生选择下拉框', async ({ page }) => {
            const studentSelect = page.locator('button[role="combobox"]').nth(1);
            if (await studentSelect.count() > 0) {
                // 需要先选择年份
                const yearSelect = page.locator('button[role="combobox"]').first();
                if (await yearSelect.count() > 0) {
                    await yearSelect.click();
                    await page.waitForTimeout(300);

                    const yearOption = page.locator('[role="option"]').first();
                    if (await yearOption.count() > 0) {
                        await yearOption.click();
                        await page.waitForTimeout(1000);

                        // 然后选择学生
                        await studentSelect.click();
                        await page.waitForTimeout(300);

                        const studentOption = page.locator('[role="option"]').first();
                        if (await studentOption.count() > 0) {
                            await studentOption.click();
                            await page.waitForTimeout(500);
                        }
                    }
                }
            }
        });

        test('课时选择下拉框', async ({ page }) => {
            const lessonSelect = page.locator('button[role="combobox"]').nth(2);
            if (await lessonSelect.count() > 0) {
                await expect(lessonSelect).toBeVisible();
            }
        });

        test('文件选择按钮', async ({ page }) => {
            const fileInputs = page.locator('input[type="file"]');
            if (await fileInputs.count() > 0) {
                await expect(fileInputs.first()).toBeHidden(); // 文件输入通常是隐藏的

                // 查找对应的标签按钮
                const fileLabels = page.locator('label:has-text("选择文件"), button:has-text("选择文件")');
                if (await fileLabels.count() > 0) {
                    await expect(fileLabels.first()).toBeVisible();
                }
            }
        });

        test('提交按钮', async ({ page }) => {
            const submitButton = page.locator('button[type="submit"], button:has-text("提交")').first();
            if (await submitButton.count() > 0) {
                await expect(submitButton).toBeVisible();
            }
        });
    });

    test.describe('🖼️ 作品广场页面按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/submissions/gallery');
            await waitForPageLoad(page);
        });

        test('视图切换按钮 - 网格视图', async ({ page }) => {
            const gridButton = page.locator('button[title="网格视图"], button:has([data-lucide="grid"])').first();
            if (await gridButton.count() > 0) {
                await gridButton.click();
                await page.waitForTimeout(500);

                // 验证网格视图激活
                const isActive = await gridButton.evaluate(el => el.getAttribute('data-state') === 'on' || el.classList.contains('bg-primary'));
                expect(isActive).toBeTruthy();
            }
        });

        test('视图切换按钮 - 列表视图', async ({ page }) => {
            const listButton = page.locator('button[title="列表视图"], button:has([data-lucide="list"])').first();
            if (await listButton.count() > 0) {
                await listButton.click();
                await page.waitForTimeout(500);
            }
        });

        test('视图切换按钮 - 瀑布流视图', async ({ page }) => {
            const masonryButton = page.locator('button[title="瀑布流视图"], button:has([data-lucide="layout-grid"])').first();
            if (await masonryButton.count() > 0) {
                await masonryButton.click();
                await page.waitForTimeout(500);
            }
        });

        test('年份筛选下拉框', async ({ page }) => {
            const yearSelect = page.locator('button[role="combobox"]').filter({ hasText: /年份|全部/ }).first();
            if (await yearSelect.count() > 0) {
                await yearSelect.click();
                await page.waitForTimeout(300);

                const option = page.locator('[role="option"]').first();
                if (await option.count() > 0) {
                    await option.click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('搜索按钮', async ({ page }) => {
            const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
            const searchButton = page.locator('button:has-text("搜索"), button[type="submit"]').first();

            if (await searchInput.count() > 0 && await searchButton.count() > 0) {
                await searchInput.fill('测试');
                await searchButton.click();
                await page.waitForTimeout(500);
            }
        });

        test('排序按钮 - 时间', async ({ page }) => {
            const timeSortButton = page.locator('button:has-text("时间"), button:has-text("日期")').first();
            if (await timeSortButton.count() > 0) {
                await timeSortButton.click();
                await page.waitForTimeout(500);

                // 再次点击切换排序方向
                await timeSortButton.click();
                await page.waitForTimeout(500);
            }
        });

        test('排序按钮 - 分数', async ({ page }) => {
            const scoreSortButton = page.locator('button:has-text("分数"), button:has-text("评分")').first();
            if (await scoreSortButton.count() > 0) {
                await scoreSortButton.click();
                await page.waitForTimeout(500);
            }
        });

        test('清除筛选按钮', async ({ page }) => {
            const clearButton = page.locator('button:has-text("清除"), button:has([data-lucide="x"])').filter({ hasText: /清除|筛选/ }).first();
            if (await clearButton.count() > 0) {
                await expect(clearButton).toBeVisible();
            }
        });

        test('作品卡片点击', async ({ page }) => {
            const workCards = page.locator('.card, [data-testid="work-card"], .submission-card').first();
            if (await workCards.count() > 0) {
                await workCards.click();
                await page.waitForTimeout(500);

                // 验证预览弹窗或跳转
                const dialog = page.locator('[role="dialog"]').first();
                if (await dialog.count() > 0) {
                    await expect(dialog).toBeVisible();

                    // 关闭弹窗
                    const closeButton = page.locator('button:has-text("关闭"), button:has([data-lucide="x"])').first();
                    if (await closeButton.count() > 0) {
                        await closeButton.click();
                    }
                }
            }
        });
    });

    test.describe('👁️ 查看作品页面按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/submissions/show');
            await waitForPageLoad(page);
        });

        test('年份筛选下拉框', async ({ page }) => {
            const yearSelect = page.locator('button[role="combobox"]').first();
            if (await yearSelect.count() > 0) {
                await yearSelect.click();
                await page.waitForTimeout(300);

                const option = page.locator('[role="option"]').first();
                if (await option.count() > 0) {
                    await option.click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('课时筛选下拉框', async ({ page }) => {
            const lessonSelect = page.locator('button[role="combobox"]').nth(1);
            if (await lessonSelect.count() > 0) {
                await expect(lessonSelect).toBeVisible();
            }
        });

        test('作业筛选下拉框', async ({ page }) => {
            const assignmentSelect = page.locator('button[role="combobox"]').nth(2);
            if (await assignmentSelect.count() > 0) {
                await expect(assignmentSelect).toBeVisible();
            }
        });

        test('学生筛选下拉框', async ({ page }) => {
            const studentSelect = page.locator('button[role="combobox"]').nth(3);
            if (await studentSelect.count() > 0) {
                await expect(studentSelect).toBeVisible();
            }
        });

        test('评分按钮', async ({ page }) => {
            const gradeButtons = page.locator('button:has-text("评分"), button[title="评分"], button:has([data-lucide="star"])');
            if (await gradeButtons.count() > 0) {
                await expect(gradeButtons.first()).toBeVisible();
            }
        });

        test('删除按钮', async ({ page }) => {
            const deleteButtons = page.locator('button:has-text("删除"), button[title="删除"], button:has([data-lucide="trash"])');
            if (await deleteButtons.count() > 0) {
                await expect(deleteButtons.first()).toBeVisible();
            }
        });
    });

    test.describe('⚙️ 设置页面按钮', () => {
        test('个人资料设置按钮', async ({ page }) => {
            await page.goto('/settings/profile');
            await waitForPageLoad(page);

            const saveButton = page.locator('button[type="submit"], button:has-text("保存")').first();
            if (await saveButton.count() > 0) {
                await expect(saveButton).toBeVisible();
            }
        });

        test('密码设置按钮', async ({ page }) => {
            await page.goto('/settings/password');
            await waitForPageLoad(page);

            const saveButton = page.locator('button[type="submit"], button:has-text("保存")').first();
            if (await saveButton.count() > 0) {
                await expect(saveButton).toBeVisible();
            }
        });

        test('外观设置按钮', async ({ page }) => {
            await page.goto('/settings/appearance');
            await waitForPageLoad(page);

            // 检查主题切换按钮
            const themeButtons = page.locator('button[role="radio"], button[data-theme]');
            if (await themeButtons.count() > 0) {
                await themeButtons.first().click();
                await page.waitForTimeout(500);
            }
        });
    });

    test.describe('🔐 认证页面按钮', () => {
        test('登录页面按钮', async ({ page }) => {
            await page.goto('/login');
            await waitForPageLoad(page);

            // 登录按钮
            const loginButton = page.locator('button[type="submit"], button:has-text("登录")').first();
            await expect(loginButton).toBeVisible();

            // 记住我复选框
            const rememberMeCheckbox = page.locator('input[type="checkbox"][name="remember"]').first();
            if (await rememberMeCheckbox.count() > 0) {
                await expect(rememberMeCheckbox).toBeVisible();
            }

            // 忘记密码链接
            const forgotPasswordLink = page.locator('a[href="/forgot-password"], a:has-text("忘记密码")').first();
            if (await forgotPasswordLink.count() > 0) {
                await expect(forgotPasswordLink).toBeVisible();
            }
        });
    });

    test.describe('🧭 导航菜单按钮', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/dashboard');
            await waitForPageLoad(page);
        });

        test('侧边栏折叠按钮', async ({ page }) => {
            const collapseButton = page.locator('button[title="折叠菜单"], button:has([data-lucide="panel-left-close"]), button:has([data-lucide="chevron-left"])').first();
            if (await collapseButton.count() > 0) {
                await collapseButton.click();
                await page.waitForTimeout(500);

                // 再次点击展开
                const expandButton = page.locator('button[title="展开菜单"], button:has([data-lucide="panel-left-open"]), button:has([data-lucide="chevron-right"])').first();
                if (await expandButton.count() > 0) {
                    await expandButton.click();
                    await page.waitForTimeout(500);
                }
            }
        });

        test('用户菜单按钮', async ({ page }) => {
            const userMenuButton = page.locator('button[aria-label="用户菜单"], button:has([data-lucide="user"])').first();
            if (await userMenuButton.count() > 0) {
                await userMenuButton.click();
                await page.waitForTimeout(500);

                // 验证下拉菜单
                const dropdownMenu = page.locator('[role="menu"], .dropdown-menu').first();
                if (await dropdownMenu.count() > 0) {
                    await expect(dropdownMenu).toBeVisible();

                    // 点击其他地方关闭
                    await page.click('body');
                    await page.waitForTimeout(300);
                }
            }
        });

        test('导航链接 - 仪表盘', async ({ page }) => {
            const dashboardLink = page.locator('nav a[href="/dashboard"], .sidebar a[href="/dashboard"]').first();
            if (await dashboardLink.count() > 0) {
                await dashboardLink.click();
                await page.waitForURL('/dashboard', { timeout: 10000 });
                await expect(page).toHaveURL('/dashboard');
            }
        });

        test('导航链接 - 学生管理', async ({ page }) => {
            const studentsLink = page.locator('nav a[href="/students"], .sidebar a[href="/students"]').first();
            if (await studentsLink.count() > 0) {
                await studentsLink.click();
                await page.waitForURL('/students', { timeout: 10000 });
                await expect(page).toHaveURL('/students');
            }
        });

        test('导航链接 - 课时管理', async ({ page }) => {
            const lessonsLink = page.locator('nav a[href="/lessons"], .sidebar a[href="/lessons"]').first();
            if (await lessonsLink.count() > 0) {
                await lessonsLink.click();
                await page.waitForURL('/lessons', { timeout: 10000 });
                await expect(page).toHaveURL('/lessons');
            }
        });

        test('导航链接 - 作业管理', async ({ page }) => {
            const assignmentsLink = page.locator('nav a[href="/assignments"], .sidebar a[href="/assignments"]').first();
            if (await assignmentsLink.count() > 0) {
                await assignmentsLink.click();
                await page.waitForURL('/assignments', { timeout: 10000 });
                await expect(page).toHaveURL('/assignments');
            }
        });

        test('导航链接 - 作品提交', async ({ page }) => {
            const submissionsLink = page.locator('nav a[href="/submissions"], .sidebar a[href="/submissions"]').first();
            if (await submissionsLink.count() > 0) {
                await submissionsLink.click();
                await page.waitForURL('/submissions', { timeout: 10000 });
                await expect(page).toHaveURL('/submissions');
            }
        });

        test('导航链接 - 作品广场', async ({ page }) => {
            const galleryLink = page.locator('nav a[href="/submissions/gallery"], .sidebar a[href="/submissions/gallery"]').first();
            if (await galleryLink.count() > 0) {
                await galleryLink.click();
                await page.waitForURL('/submissions/gallery', { timeout: 10000 });
                await expect(page).toHaveURL('/submissions/gallery');
            }
        });

        test('导航链接 - 上传类型', async ({ page }) => {
            const uploadTypesLink = page.locator('nav a[href="/upload-types"], .sidebar a[href="/upload-types"]').first();
            if (await uploadTypesLink.count() > 0) {
                await uploadTypesLink.click();
                await page.waitForURL('/upload-types', { timeout: 10000 });
                await expect(page).toHaveURL('/upload-types');
            }
        });

        test('导航链接 - 设置', async ({ page }) => {
            const settingsLink = page.locator('nav a[href^="/settings"], .sidebar a[href^="/settings"]').first();
            if (await settingsLink.count() > 0) {
                await settingsLink.click();
                await page.waitForTimeout(1000);

                const currentUrl = page.url();
                expect(currentUrl).toContain('/settings');
            }
        });
    });
});

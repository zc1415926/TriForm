/**
 * 页面操作辅助函数
 */

import { Page, expect } from '@playwright/test';

/**
 * 等待页面加载完成
 */
export async function waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
}

/**
 * 等待 Inertia 页面加载
 */
export async function waitForInertiaPage(page: Page): Promise<void> {
    // Inertia 页面加载指示器
    await page.waitForSelector('[data-inertia]', { state: 'attached', timeout: 10000 });
}

/**
 * 获取表格行数
 */
export async function getTableRowCount(page: Page, tableSelector: string): Promise<number> {
    const rows = await page.locator(`${tableSelector} tbody tr`).count();
    return rows;
}

/**
 * 点击确认对话框的确认按钮
 */
export async function confirmDialog(page: Page): Promise<void> {
    // 等待对话框出现
    await page.waitForSelector('[role="alertdialog"], .alert-dialog, dialog', { timeout: 5000 });

    // 点击确认按钮
    const confirmButton = page.locator('button:has-text("确认"), button:has-text("删除"), button:has-text("确定"), [data-testid="confirm-button"]').first();
    await confirmButton.click();

    // 等待对话框消失
    await page.waitForTimeout(500);
}

/**
 * 填写表单并提交
 */
export async function fillFormAndSubmit(
    page: Page,
    formData: Record<string, string>,
    submitButtonSelector: string = 'button[type="submit"]'
): Promise<void> {
    for (const [field, value] of Object.entries(formData)) {
        const input = page.locator(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`).first();

        if (await input.count() > 0) {
            const tagName = await input.evaluate(el => el.tagName.toLowerCase());

            if (tagName === 'select') {
                await input.selectOption(value);
            } else {
                await input.fill(value);
            }
        }
    }

    await page.click(submitButtonSelector);
}

/**
 * 检查 Toast 消息
 */
export async function checkToastMessage(page: Page, expectedText: string): Promise<void> {
    const toast = page.locator('.toast, [role="status"], .notification').filter({ hasText: expectedText }).first();
    await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * 选择下拉框选项
 */
export async function selectDropdownOption(page: Page, selector: string, optionText: string): Promise<void> {
    // 点击下拉框触发器
    await page.click(selector);

    // 等待下拉选项出现
    await page.waitForTimeout(300);

    // 选择选项
    const option = page.locator(`[role="option"]:has-text("${optionText}"), .select-item:has-text("${optionText}")`).first();
    await option.click();

    await page.waitForTimeout(300);
}

/**
 * 等待元素可见
 */
export async function waitForElement(
    page: Page,
    selector: string,
    timeout: number = 5000
): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * 清除输入框内容
 */
export async function clearInput(page: Page, selector: string): Promise<void> {
    const input = page.locator(selector);
    await input.click();
    await input.fill('');
}

/**
 * 获取元素文本内容
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
    const element = page.locator(selector).first();
    return await element.textContent() || '';
}
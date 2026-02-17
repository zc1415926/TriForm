import { test, expect } from '@playwright/test';

test.describe('设置页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://127.0.0.1:8000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  });

  test('个人资料设置页面', async ({ page }) => {
    console.log('=== 测试个人资料设置页面 ===');
    
    await page.goto('http://127.0.0.1:8000/settings/profile');
    await page.waitForLoadState('networkidle');
    
    // 检查页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 检查表单元素
    const nameInput = await page.locator('input[name="name"]').isVisible().catch(() => false);
    const emailInput = await page.locator('input[name="email"]').isVisible().catch(() => false);
    const saveButton = await page.locator('button:has-text("保存")').isVisible().catch(() => false);
    
    console.log('姓名输入框:', nameInput ? '✅ 存在' : '❌ 不存在');
    console.log('邮箱输入框:', emailInput ? '✅ 存在' : '❌ 不存在');
    console.log('保存按钮:', saveButton ? '✅ 存在' : '❌ 不存在');
    
    // 截图
    await page.screenshot({ path: '/home/zc1415926/TriForm/test-results/settings-profile.png', fullPage: true });
    
    // 检查控制台错误
    const consoleErrors = await page.evaluate(() => {
      return (window as { consoleErrors?: string[] }).consoleErrors || [];
    });
    console.log('控制台错误:', consoleErrors.length > 0 ? consoleErrors : '无');
    
    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
  });

  test('密码设置页面', async ({ page }) => {
    console.log('=== 测试密码设置页面 ===');
    
    await page.goto('http://127.0.0.1:8000/settings/password');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 检查密码输入框
    const currentPassword = await page.locator('input[name="current_password"]').isVisible().catch(() => false);
    const newPassword = await page.locator('input[name="password"]').isVisible().catch(() => false);
    const confirmPassword = await page.locator('input[name="password_confirmation"]').isVisible().catch(() => false);
    const updateButton = await page.locator('button:has-text("更新")').isVisible().catch(() => false);
    
    console.log('当前密码输入框:', currentPassword ? '✅ 存在' : '❌ 不存在');
    console.log('新密码输入框:', newPassword ? '✅ 存在' : '❌ 不存在');
    console.log('确认密码输入框:', confirmPassword ? '✅ 存在' : '❌ 不存在');
    console.log('更新按钮:', updateButton ? '✅ 存在' : '❌ 不存在');
    
    await page.screenshot({ path: '/home/zc1415926/TriForm/test-results/settings-password.png', fullPage: true });
    
    expect(currentPassword).toBeTruthy();
    expect(newPassword).toBeTruthy();
    expect(confirmPassword).toBeTruthy();
  });

  test('外观设置页面', async ({ page }) => {
    console.log('=== 测试外观设置页面 ===');
    
    await page.goto('http://127.0.0.1:8000/settings/appearance');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 检查主题选项
    const pageContent = await page.content();
    const hasLight = pageContent.includes('浅色') || pageContent.includes('Light');
    const hasDark = pageContent.includes('深色') || pageContent.includes('Dark');
    const hasSystem = pageContent.includes('系统') || pageContent.includes('System');
    
    console.log('浅色主题选项:', hasLight ? '✅ 存在' : '❌ 不存在');
    console.log('深色主题选项:', hasDark ? '✅ 存在' : '❌ 不存在');
    console.log('系统主题选项:', hasSystem ? '✅ 存在' : '❌ 不存在');
    
    await page.screenshot({ path: '/home/zc1415926/TriForm/test-results/settings-appearance.png', fullPage: true });
    
    // 检查是否有主题选择相关的元素
    const themeSelectors = await page.locator('[data-theme], input[name="theme"], [role="radiogroup"]').count();
    console.log('主题选择器数量:', themeSelectors);
  });
});
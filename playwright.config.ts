import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件
 * 使用系统已安装的 Firefox 浏览器进行端到端测试
 */

export default defineConfig({
    testDir: './e2e/tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],
    use: {
        baseURL: process.env.APP_URL || 'http://localhost:8000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000,
        navigationTimeout: 10000,
    },
    projects: [
        {
            name: 'firefox',
            use: {
                browserName: 'firefox',
                launchOptions: {
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                },
                viewport: null,
            },
        },
    ],
    // 自动启动 Laravel 服务器（仅在 CI 环境）
    webServer: process.env.CI
        ? {
              command: 'php artisan serve --port=8000',
              url: 'http://localhost:8000',
              reuseExistingServer: false,
              timeout: 120000,
          }
        : undefined,
    // 输出目录
    outputDir: 'test-results/',
    // 全局设置
    globalSetup: undefined,
    globalTeardown: undefined,
});
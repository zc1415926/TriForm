# E2E 测试 (Playwright)

本项目使用 Playwright 进行端到端 (E2E) 测试，使用系统已安装的 Firefox 浏览器。

## 测试文件结构

```
e2e/
├── fixtures/
│   └── test-data.ts          # 测试数据
├── helpers/
│   ├── auth-helper.ts        # 认证辅助函数
│   └── page-helper.ts        # 页面操作辅助函数
├── tests/
│   ├── auth.spec.ts          # 认证流程测试
│   ├── dashboard.spec.ts     # 仪表板页面测试
│   ├── students.spec.ts      # 学生管理页面测试
│   ├── lessons.spec.ts       # 课程管理页面测试
│   ├── assignments.spec.ts   # 作业管理页面测试
│   ├── submissions.spec.ts   # 作品提交页面测试
│   ├── upload-types.spec.ts  # 上传类型管理测试
│   └── workflow.spec.ts      # 完整工作流程测试
└── README.md                 # 本文档
```

## 可用命令

```bash
# 运行所有 E2E 测试
npm run e2e

# 在 UI 模式下运行测试（可交互调试）
npm run e2e:ui

# 调试模式运行
npm run e2e:debug

# 查看测试报告
npm run e2e:report
```

## 环境要求

1. **系统要求**
   - Firefox 浏览器已安装 (`/usr/bin/firefox`)
   - PHP 8.2+
   - Node.js 20+

2. **前置步骤**
   ```bash
   # 1. 安装依赖
   composer install
   npm install

   # 2. 配置环境
   cp .env.example .env
   php artisan key:generate

   # 3. 运行迁移和填充
   php artisan migrate
   php artisan db:seed

   # 4. 构建前端资源
   npm run build
   ```

## 运行测试

### 本地开发环境

```bash
# 1. 启动 Laravel 服务器（终端1）
php artisan serve --port=8000

# 2. 运行测试（终端2）
npm run e2e
```

### CI 环境

GitHub Actions 配置已包含在 `.github/workflows/e2e.yml` 中，会自动：
1. 启动 PostgreSQL 服务
2. 安装 PHP 和 Node.js 依赖
3. 运行数据库迁移和填充
4. 构建前端资源
5. 运行 Playwright 测试

## 测试覆盖范围

### 1. 认证流程 (`auth.spec.ts`)
- 登录页面显示
- 有效/无效凭据登录
- 表单验证
- 密码可见性切换
- 访问控制和重定向
- 登出功能

### 2. 仪表板 (`dashboard.spec.ts`)
- 页面加载
- 导航菜单
- 页面间导航
- 统计数据展示
- 响应式布局
- 加载性能

### 3. 学生管理 (`students.spec.ts`)
- 年份筛选
- 表格排序
- 新增/编辑/删除学生
- 表单验证
- 搜索功能
- 分页功能

### 4. 课程管理 (`lessons.spec.ts`)
- 新增/编辑/删除课程
- 富文本编辑器
- 年份筛选
- 表单验证

### 5. 作业管理 (`assignments.spec.ts`)
- 新增/编辑/删除作业
- 课程关联
- 上传类型选择
- 表单验证

### 6. 作品提交 (`submissions.spec.ts`)
- 提交列表
- 作品广场
- 年份/学生/课程筛选联动
- 评分功能
- 作品预览
- 3D模型预览

### 7. 上传类型 (`upload-types.spec.ts`)
- 新增/编辑/删除上传类型
- 扩展名格式验证

### 8. 完整工作流程 (`workflow.spec.ts`)
- 端到端业务流程
- 错误处理
- 边界情况

## 编写新测试

1. 在 `e2e/tests/` 目录下创建新的 `.spec.ts` 文件
2. 使用现有的辅助函数简化测试代码
3. 遵循 AAA (Arrange-Act-Assert) 模式

示例：

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth-helper';
import { waitForPageLoad } from '../helpers/page-helper';

test.describe('新功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin');
    await page.goto('/new-feature');
    await waitForPageLoad(page);
  });

  test('测试描述', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 调试技巧

1. **使用 UI 模式**：`npm run e2e:ui`
2. **添加断点**：在测试代码中添加 `await page.pause()`
3. **查看追踪**：测试失败时会自动保存追踪到 `test-results/`
4. **截图和视频**：在 `playwright.config.ts` 中配置 `screenshot` 和 `video`

## 常见问题

1. **浏览器找不到**：确保 Firefox 安装在 `/usr/bin/firefox`
2. **服务器未启动**：确保先运行 `php artisan serve`
3. **测试超时**：检查网络连接和服务器响应速度
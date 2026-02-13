# TriForm 测试指南

本文档详细说明 TriForm 3D选修课管理系统中的各类测试，包括 PHP 后端测试、前端组件测试和端到端 (E2E) 测试。

## 测试概览

| 测试类型 | 测试框架 | 测试数量 | 位置 |
|---------|---------|---------|------|
| PHP 单元测试 | Pest 4 | 21 个文件 | `tests/Unit/` |
| PHP 功能测试 | Pest 4 | 21 个文件 | `tests/Feature/` |
| 前端组件测试 | Vitest | 3 个文件 | `resources/js/**/__tests__/` |
| E2E 端到端测试 | Playwright | 73 个测试 | `e2e/tests/` |

**总计：超过 100 个测试用例**

---

## 1. PHP 测试 (Pest 4)

### 1.1 配置

测试配置文件：`phpunit.xml`

```xml
<testsuites>
    <testsuite name="Unit">
        <directory>tests/Unit</directory>
    </testsuite>
    <testsuite name="Feature">
        <directory>tests/Feature</directory>
    </testsuite>
</testsuites>
```

Pest 配置：`tests/Pest.php`
- 所有测试使用 `RefreshDatabase` trait
- 单元测试和功能测试都使用数据库刷新

### 1.2 运行命令

```bash
# 运行所有测试
php artisan test

# 运行特定测试套件
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# 运行特定文件
php artisan test tests/Unit/StudentTest.php

# 带覆盖率报告
php artisan test --coverage

# 紧凑输出
php artisan test --compact
```

### 1.3 单元测试

位置：`tests/Unit/`

#### StudentTest.php - 学生模型测试

| 测试方法 | 描述 |
|---------|------|
| `has correct fillable attributes` | 验证可填充属性 |
| `has correct casts` | 验证类型转换 |
| `has submissions relationship` | 验证提交关联 |
| `grade_text returns correct value` | 验证年级文本属性 |
| `can be created` | 验证创建功能 |

#### LessonTest.php - 课程模型测试

| 测试方法 | 描述 |
|---------|------|
| `has correct fillable attributes` | 验证可填充属性 |
| `has assignments relationship` | 验证作业关联 |
| `can be created` | 验证创建功能 |

#### AssignmentTest.php - 作业模型测试

| 测试方法 | 描述 |
|---------|------|
| `has correct fillable attributes` | 验证可填充属性 |
| `has correct casts` | 验证类型转换 |
| `belongs to lesson` | 验证课程关联 |
| `has submissions relationship` | 验证提交关联 |
| `has upload types relationship` | 验证上传类型关联 |
| `can be created` | 验证创建功能 |

#### SubmissionTest.php - 提交模型测试

| 测试方法 | 描述 |
|---------|------|
| `has correct fillable attributes` | 验证可填充属性 |
| `has correct casts` | 验证类型转换 |
| `belongs to student` | 验证学生关联 |
| `belongs to assignment` | 验证作业关联 |
| `belongs to upload type` | 验证上传类型关联 |
| `can be created` | 验证创建功能 |
| `can calculate total score` | 验证分数计算 |

### 1.4 功能测试

位置：`tests/Feature/`

#### 认证测试

**AuthenticationTest.php**
- `login screen can be rendered` - 登录页面渲染
- `users can authenticate using the login screen` - 用户认证
- `users can not authenticate with invalid password` - 无效密码
- `users can logout` - 用户登出

**RegistrationTest.php**
- `registration screen can be rendered` - 注册页面渲染
- `new users can register` - 新用户注册
- `registration requires valid data` - 数据验证

**PasswordResetTest.php**
- `reset password link screen can be rendered` - 重置链接页面
- `reset password link can be requested` - 请求重置链接
- `password can be reset with valid token` - 有效令牌重置

**EmailVerificationTest.php**
- `email verification screen can be rendered` - 验证页面渲染
- `email can be verified` - 邮箱验证
- `email is not verified with invalid hash` - 无效哈希

**TwoFactorChallengeTest.php**
- `two factor challenge screen can be rendered` - 2FA页面
- `totp can be used as two factor challenge` - TOTP验证

#### 控制器测试

**StudentControllerTest.php**

| 测试方法 | 描述 |
|---------|------|
| `can list students` | 学生列表 |
| `can filter students by year` | 年份筛选 |
| `can create student` | 创建学生 |
| `can update student` | 更新学生 |
| `can delete student` | 删除学生 |
| `validates student data` | 数据验证 |

**LessonControllerTest.php**

| 测试方法 | 描述 |
|---------|------|
| `can list lessons` | 课程列表 |
| `can create lesson` | 创建课程 |
| `can update lesson` | 更新课程 |
| `can delete lesson` | 删除课程 |
| `validates lesson data` | 数据验证 |
| `handles rich text content` | 富文本处理 |

**AssignmentControllerTest.php**

| 测试方法 | 描述 |
|---------|------|
| `can list assignments` | 作业列表 |
| `can create assignment` | 创建作业 |
| `can update assignment` | 更新作业 |
| `can delete assignment` | 删除作业 |
| `validates assignment data` | 数据验证 |
| `associates with lesson` | 课程关联 |

**SubmissionControllerTest.php**

| 测试方法 | 描述 |
|---------|------|
| `can list submissions` | 提交列表 |
| `can create submission` | 创建提交 |
| `can score submission` | 评分功能 |
| `can cancel score` | 取消评分 |
| `can delete submission` | 删除提交 |
| `handles file uploads` | 文件上传 |

#### 设置测试

**ProfileUpdateTest.php**
- `profile page is displayed` - 个人资料页面
- `profile information can be updated` - 更新资料
- `email verification status is unchanged when email is unchanged` - 邮箱验证状态

**PasswordUpdateTest.php**
- `password can be updated` - 更新密码
- `correct password must be provided to update password` - 当前密码验证

**TwoFactorAuthenticationTest.php**
- `two factor authentication can be enabled` - 启用2FA
- `recovery codes can be regenerated` - 重新生成恢复码
- `two factor authentication can be disabled` - 禁用2FA

#### 其他测试

**DashboardTest.php**
- `dashboard page is displayed` - 仪表板显示
- `displays statistics` - 统计显示

**ExampleTest.php**
- `the application returns a successful response` - 应用响应成功

---

## 2. 前端组件测试 (Vitest)

### 2.1 配置

配置文件：`vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./resources/js/test/setup.ts'],
    include: ['resources/js/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
})
```

### 2.2 运行命令

```bash
# 运行所有测试
npm run test:run

# 监视模式
npm run test

# 带覆盖率报告
npm run test:coverage
```

### 2.3 测试文件

#### utils.test.ts

位置：`resources/js/lib/utils.test.ts`

| 测试用例 | 描述 |
|---------|------|
| `merges class names` | 合并类名 |
| `handles conditional classes` | 处理条件类 |
| `handles undefined and null` | 处理空值 |
| `merges tailwind classes correctly` | 合并 Tailwind 类 |
| `handles object syntax` | 对象语法 |
| `handles array syntax` | 数组语法 |

#### button.test.tsx

位置：`resources/js/components/ui/__tests__/button.test.tsx`

| 测试用例 | 描述 |
|---------|------|
| `renders button with text` | 渲染按钮文本 |
| `renders button with different variants` | 不同变体 |
| `renders button with different sizes` | 不同尺寸 |
| `handles click events` | 点击事件 |
| `renders as child component` | 子组件渲染 |
| `applies custom className` | 自定义类名 |
| `renders disabled state` | 禁用状态 |
| `renders loading state` | 加载状态 |

#### badge.test.tsx

位置：`resources/js/components/ui/__tests__/badge.test.tsx`

| 测试用例 | 描述 |
|---------|------|
| `renders badge with text` | 渲染徽章文本 |
| `renders badge with different variants` | 不同变体 |
| `applies custom className` | 自定义类名 |
| `renders as child component` | 子组件渲染 |

---

## 3. E2E 端到端测试 (Playwright)

### 3.1 配置

配置文件：`playwright.config.ts`

- **浏览器**: Firefox (系统已安装 `/usr/bin/firefox`)
- **Base URL**: `http://localhost:8000`
- **视口**: 1280x720

### 3.2 运行命令

```bash
# 运行所有测试
npm run e2e

# UI 模式（可交互调试）
npm run e2e:ui

# 调试模式
npm run e2e:debug

# 查看测试报告
npm run e2e:report

# 运行特定测试
npx playwright test --grep "登录"

#  headed 模式（显示浏览器）
npx playwright test --headed
```

### 3.3 测试文件

#### auth.spec.ts - 认证流程 (10 个测试)

| 测试用例 | 描述 |
|---------|------|
| `登录页面应该显示正确` | 页面元素检查 |
| `使用有效凭据登录成功` | 成功登录流程 |
| `使用无效凭据登录失败` | 失败登录处理 |
| `邮箱格式验证` | 邮箱验证 |
| `必填字段验证` | 必填验证 |
| `密码可见性切换` | 密码显示/隐藏 |
| `登录后访问受保护页面` | 访问控制 |
| `未登录用户被重定向到登录页` | 重定向检查 |
| `用户成功登出` | 登出功能 |

#### dashboard.spec.ts - 仪表板 (10 个测试)

| 测试用例 | 描述 |
|---------|------|
| `页面加载正确显示` | 页面加载 |
| `导航菜单显示` | 导航检查 |
| `导航到学生管理页面` | 导航测试 |
| `导航到课程管理页面` | 导航测试 |
| `导航到作业管理页面` | 导航测试 |
| `导航到提交管理页面` | 导航测试 |
| `导航到作品广场页面` | 导航测试 |
| `统计数据展示` | 统计检查 |
| `最近活动或列表` | 活动列表 |
| `响应式布局` | 响应式测试 |
| `页面加载性能` | 性能测试 |

#### students.spec.ts - 学生管理 (11 个测试)

| 测试用例 | 描述 |
|---------|------|
| `页面加载正确显示` | 页面加载 |
| `年份筛选功能` | 年份筛选 |
| `表格排序功能` | 点击表头排序 |
| `新增学生` | 创建学生 |
| `编辑学生` | 修改学生 |
| `删除学生` | 删除学生 |
| `表单验证` | 验证错误 |
| `表格数据完整性` | 数据检查 |
| `搜索或筛选功能` | 搜索测试 |
| `分页功能` | 分页测试 |

#### lessons.spec.ts - 课程管理 (9 个测试)

| 测试用例 | 描述 |
|---------|------|
| `页面加载正确显示` | 页面加载 |
| `新增课程` | 创建课程 |
| `查看课程详情` | 详情查看 |
| `编辑课程` | 修改课程 |
| `删除课程` | 删除课程 |
| `富文本编辑器功能` | 编辑器测试 |
| `表单验证` | 验证错误 |
| `年份筛选` | 年份筛选 |
| `课程列表数据完整性` | 数据检查 |

#### assignments.spec.ts - 作业管理 (8 个测试)

| 测试用例 | 描述 |
|---------|------|
| `页面加载正确显示` | 页面加载 |
| `新增作业` | 创建作业 |
| `查看作业详情` | 详情查看 |
| `编辑作业` | 修改作业 |
| `删除作业` | 删除作业 |
| `作业表单验证` | 验证错误 |
| `作业列表数据完整性` | 数据检查 |
| `课程筛选` | 课程筛选 |

#### submissions.spec.ts - 作品提交 (13 个测试)

| 测试用例 | 描述 |
|---------|------|
| `提交列表页面加载正确` | 列表页面 |
| `作品广场页面加载正确` | 广场页面 |
| `提交详情页面` | 详情查看 |
| `年份筛选功能` | 年份筛选 |
| `学生筛选联动` | 级联筛选 |
| `课程和作业筛选联动` | 级联筛选 |
| `作品评分功能` | 评分测试 |
| `取消评分功能` | 取消评分 |
| `删除作品提交` | 删除提交 |
| `作品预览功能` | 预览测试 |
| `3D模型预览` | 3D查看器 |
| `图片预览` | 图片查看 |
| `提交数据完整性` | 数据检查 |

#### upload-types.spec.ts - 上传类型 (7 个测试)

| 测试用例 | 描述 |
|---------|------|
| `页面加载正确显示` | 页面加载 |
| `新增上传类型` | 创建类型 |
| `编辑上传类型` | 修改类型 |
| `删除上传类型` | 删除类型 |
| `表单验证` | 验证错误 |
| `扩展名格式验证` | 格式验证 |
| `上传类型列表数据完整性` | 数据检查 |

#### workflow.spec.ts - 完整工作流程 (5 个测试)

| 测试用例 | 描述 |
|---------|------|
| `创建课程 -> 创建作业 -> 查看提交流程` | 完整业务流程 |
| `学生管理完整流程` | 学生CRUD流程 |
| `作品评分工作流程` | 评分业务流程 |
| `作品广场浏览流程` | 浏览业务流程 |
| `多页面导航流程` | 导航流程 |
| `错误处理和边界情况` | 错误处理 |

---

## 4. 持续集成 (CI/CD)

### 4.1 GitHub Actions 工作流

文件：`.github/workflows/e2e.yml`

触发条件：
- Push 到 `main` 或 `develop` 分支
- Pull Request 到 `main` 分支

CI 流程：
1. 启动 PostgreSQL 15 服务容器
2. 安装 PHP 8.2 和 Node.js 20
3. 安装 PHP 和 Node.js 依赖
4. 设置环境变量和数据库
5. 运行数据库迁移和填充
6. 构建前端资源
7. 安装 Playwright Firefox 浏览器
8. 启动 Laravel 服务器
9. 运行 E2E 测试
10. 上传测试报告

### 4.2 本地测试环境设置

```bash
# 1. 安装依赖
composer install
npm install

# 2. 配置环境
cp .env.example .env
php artisan key:generate

# 3. 配置数据库（使用 SQLite 或 PostgreSQL）
# 编辑 .env 文件设置 DB_CONNECTION

# 4. 运行迁移和填充
php artisan migrate
php artisan db:seed

# 5. 构建前端
npm run build

# 6. 运行 PHP 测试
php artisan test

# 7. 运行前端测试
npm run test:run

# 8. 运行 E2E 测试（需要启动服务器）
php artisan serve --port=8000 &
npm run e2e
```

---

## 5. 测试数据

### 5.1 数据库填充器

文件：`database/seeders/DatabaseSeeder.php`

生成的测试数据：

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 学生 | 41 人 | 2025年15人，2026年26人 |
| 课程 | 6 门 | 每年级3门 |
| 作业 | 10 个 | 每课程1-2个 |
| 提交记录 | 101 份 | 带随机评分和反馈 |
| 上传类型 | 5 种 | 图片、文档、视频、3D模型 |

### 5.2 工厂类

- `StudentFactory.php` - 学生工厂
- `LessonFactory.php` - 课程工厂
- `AssignmentFactory.php` - 作业工厂
- `SubmissionFactory.php` - 提交工厂
- `UploadTypeFactory.php` - 上传类型工厂
- `UserFactory.php` - 用户工厂

---

## 6. 编写新测试

### 6.1 PHP 单元测试示例

```php
<?php

use App\Models\Student;

it('can calculate total score', function () {
    $student = Student::factory()->create();

    // 创建提交记录
    $student->submissions()->create([
        'score' => 10,
        'assignment_id' => 1,
    ]);

    $student->submissions()->create([
        'score' => 8,
        'assignment_id' => 2,
    ]);

    // 验证总分计算
    expect($student->totalScore())->toBe(18);
});
```

### 6.2 前端组件测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### 6.3 E2E 测试示例

```typescript
import { test, expect } from '@playwright/test'
import { login } from '../helpers/auth-helper'

test('create new student', async ({ page }) => {
  await login(page, 'admin')
  await page.goto('/students')

  await page.click('button:has-text("新增")')
  await page.fill('input[name="name"]', '测试学生')
  await page.fill('input[name="grade"]', '5')
  await page.click('button[type="submit"]')

  await expect(page.locator('text=测试学生')).toBeVisible()
})
```

---

## 7. 测试最佳实践

### 7.1 命名规范

- **PHP 测试**: `*Test.php` 后缀，使用描述性方法名
- **前端测试**: `*.test.tsx` 后缀，使用 `describe` 和 `it` 块
- **E2E 测试**: `*.spec.ts` 后缀，使用中文描述测试用例

### 7.2 测试隔离

- 每个测试应该独立运行
- 使用数据库事务或刷新确保数据隔离
- 避免测试间的依赖

### 7.3 测试数据

- 使用工厂类创建测试数据
- 避免硬编码 ID
- 使用有意义的测试数据

### 7.4 断言

- 一个测试应该验证一个概念
- 使用描述性的断言消息
- 避免过于复杂的断言

---

## 8. 故障排除

### 8.1 常见问题

**PHP 测试失败**
- 检查数据库连接配置
- 确保迁移已运行
- 检查工厂类定义

**前端测试失败**
- 确保 jsdom 环境正确配置
- 检查组件导入路径
- 验证测试库版本

**E2E 测试失败**
- 确保 Laravel 服务器正在运行
- 检查 Firefox 浏览器路径
- 验证网络连接

### 8.2 调试技巧

```bash
# PHP 测试调试
php artisan test --filter=testName -vvv

# 前端测试调试
npm run test -- --reporter=verbose

# E2E 测试调试
npm run e2e:debug
```

---

## 9. 测试覆盖率

运行覆盖率报告：

```bash
# PHP 覆盖率
php artisan test --coverage --coverage-html=coverage

# 前端覆盖率
npm run test:coverage

# 查看报告
coverage/index.html
```

---

## 10. 相关文档

- [Pest 文档](https://pestphp.com/)
- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Laravel 测试](https://laravel.com/docs/testing)
- [Testing Library](https://testing-library.com/)

---

**文档版本**: 1.0  
**最后更新**: 2026-02-13  
**项目**: TriForm 3D选修课管理系统
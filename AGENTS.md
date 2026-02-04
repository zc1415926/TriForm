<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost 指南

Laravel Boost 指南由 Laravel 维护者专门为此应用程序精心制作。开发时请严格遵循这些指南，以确保获得最佳体验。

## 基础背景

这是一个 **3D 选修课管理系统**，基于 Laravel 12 和 React 19 构建的现代化课程管理平台。系统支持 3D 模型上传和预览、富文本编辑、作品管理和评分等功能。

### 后端 (PHP)
- php - ^8.2
- inertiajs/inertia-laravel (INERTIA) - ^2.0
- laravel/fortify (FORTIFY) - ^1.30
- laravel/framework (LARAVEL) - ^12.0
- laravel/wayfinder (WAYFINDER) - ^0.1.9
- laravel/pint (PINT) - ^1.24
- laravel/pail (PAIL) - ^1.2.2
- laravel/sail (SAIL) - ^1.41
- pestphp/pest (PEST) - ^4.3
- pestphp/pest-plugin-laravel - ^4.0
- phpunit/phpunit (PHPUNIT) - v12

### 前端 (JavaScript/TypeScript)
- react - ^19.2.0
- react-dom - ^19.2.0
- typescript - ^5.7.2
- @inertiajs/react - ^2.3.7
- tailwindcss - ^4.0.0
- @tailwindcss/vite - ^4.1.11
- vite - ^7.0.4
- @headlessui/react - ^2.2.0
- @radix-ui/* (多个 UI 原语)
- lucide-react - ^0.475.0
- babel-plugin-react-compiler - ^1.0.0

### 3D 和富文本
- @babylonjs/core - 3D 模型渲染引擎
- @babylonjs/loaders - 3D 模型加载器
- @tiptap/react - 富文本编辑器
- @tiptap/starter-kit - TipTap 基础套件
- @tiptap/extension-image - TipTap 图片扩展
- @tiptap/extension-history - TipTap 历史记录扩展

### 其他工具
- recharts - 图表库
- input-otp - OTP 输入组件
- concurrently - 并行运行命令

## 技能激活

此项目有特定领域的技能可用。您必须在该领域工作时激活相关技能——不要等到遇到问题才激活。

- `wayfinder-development` — 在前端组件中引用后端路由时激活。用于从 `@/actions/` 或 `@/routes/` 导入、调用 TypeScript 中的 Laravel 路由，或使用 Wayfinder 路由函数时。
- `pest-testing` — 使用 Pest 4 PHP 框架测试应用程序。在编写测试、创建单元或功能测试、添加断言、测试 Livewire 组件、浏览器测试、调试测试失败、使用数据集或模拟时激活；或当用户提到 test、spec、TDD、expects、assertion、coverage 或需要验证功能工作时。
- `developing-with-fortify` — Laravel Fortify 无头身份验证后端开发。在实现身份验证功能（包括登录、注册、密码重置、电子邮件验证、双因素身份验证 (2FA/TOTP)、个人资料更新、无头身份验证、身份验证脚手架或 Laravel 应用程序中的身份验证守卫）时激活。

## 项目架构

### 核心功能模块

1. **学生管理** (Student)
   - 学生信息管理
   - 按年份分组

2. **课程管理** (Lesson)
   - 课程创建和编辑
   - 富文本内容编辑（TipTap）
   - 图片上传和管理

3. **作业管理** (Assignment)
   - 作业创建和分配
   - 关联课程
   - 上传类型配置

4. **作品提交** (Submission)
   - 3D 模型上传（STL 文件）
   - 图片上传和处理
   - 作品预览和查看
   - 评分功能
   - 作品广场展示

5. **上传类型** (UploadType)
   - 支持的文件类型配置

### 数据模型

- `User` - 用户模型（Laravel Fortify）
- `Student` - 学生模型
- `Lesson` - 课程模型
- `Assignment` - 作业模型
- `Submission` - 作品提交模型
- `UploadType` - 上传类型模型

### 数据库

- **默认数据库**: PostgreSQL 15（通过 Docker）
- **开发环境**: 使用 Docker Compose 管理 PostgreSQL 容器
- **配置文件**: `.env` 和 `docker-compose.yml`

## 前端技术栈和架构

### 技术栈
- **框架:** React 19 搭配 TypeScript 和 Inertia v2
- **样式:** Tailwind CSS 4.0，使用 CSS 变量进行主题化
- **UI 组件:** shadcn/ui (Radix UI 原语 + Tailwind CSS)
- **图标:** Lucide React
- **表单:** Headless UI + 自定义表单组件
- **路由:** Laravel Wayfinder 提供类型安全的路由函数
- **构建工具:** Vite 7.0.4
- **优化:** 启用 React Compiler，支持 SSR
- **3D 渲染:** Babylon.js 8.49
- **富文本:** TipTap 3.18

### 目录结构
- `resources/js/pages/` - Inertia 页面组件
  - `assignments/` - 作业管理页面
  - `lessons/` - 课程管理页面
  - `students/` - 学生管理页面
  - `submissions/` - 作品提交页面
  - `upload-types/` - 上传类型页面
  - `settings/` - 设置页面
  - `auth/` - 身份验证页面
- `resources/js/components/` - 共享 React 组件
  - `components/ui/` - shadcn/ui 组件
  - `stl-model-viewer.tsx` - STL 模型查看器
  - `stl-preview-generator.tsx` - STL 预览生成器
- `resources/js/components/app-*.tsx` - 应用程序外壳组件（页眉、侧边栏等）
- `resources/js/lib/` - 实用函数和辅助工具
- `resources/js/hooks/` - 自定义 React hooks
- `resources/js/actions/` - Wayfinder 生成的控制器操作
- `resources/js/routes/` - Wayfinder 生成的命名路由
- `resources/js/types/` - TypeScript 类型定义

### 开发命令
- `npm run dev` - 启动支持 HMR 的 Vite 开发服务器
- `npm run build` - 生产环境构建
- `npm run build:ssr` - 带有 SSR 的生产环境构建
- `npm run lint` - 运行 ESLint 自动修复
- `npm run format` - 使用 Prettier 格式化代码
- `npm run types` - 运行 TypeScript 类型检查
- `composer run dev` - 启动完整的开发堆栈（Laravel 服务器、队列、日志、Vite）
- `composer run dev:ssr` - 启动带有 SSR 的开发堆栈
- `composer run setup` - 项目初始设置

### 代码风格和质量
- **TypeScript:** 启用严格模式，需要显式返回类型
- **ESLint:** 现代 ESLint 9 支持 TypeScript，自动修复 lint
- **Prettier:** 代码格式化，使用 Tailwind 插件
- **React Compiler:** 已启用自动优化
- **Pint:** PHP 代码格式化
- **Imports:** 使用 `@/*` 别名作为 `resources/js/*`

## 约定

- 必须遵循此应用程序中使用的所有现有代码约定。创建或编辑文件时，请检查同级文件以了解正确的结构、方法和命名。
- 使用描述性变量和方法名称。例如，`isRegisteredForDiscounts`，而不是 `discount()`。
- 在编写新组件之前，检查现有组件以供重用。

### React/TypeScript 约定
- 使用函数组件和 hooks（不使用类组件）
- 为所有 props 和状态使用 TypeScript 接口和类型
- 使用 `clsx` 和 `tailwind-merge` 进行条件类合并（`cn()` 实用程序）
- 优先使用 shadcn/ui 组件而不是从头构建
- 使用 Lucide React 作为图标
- 遵循现有的组件命名：组件使用 PascalCase，文件使用 kebab-case
- 使用函数的显式返回类型
- 利用 React Compiler 优化（避免不必要的 `useMemo`/`useCallback`）

### UI/UX 模式
- 使用 Tailwind 配置中的一致间距和颜色
- 为异步操作实现加载状态（骨架屏）
- 添加错误边界以实现强大的错误处理
- 使用对话框/模态框模式进行用户交互
- 实现响应式设计（移动优先方法）
- 遵循 shadcn/ui 组件模式以保持一致性

### 3D 模型处理
- 使用 Babylon.js 进行 STL 模型渲染
- 3D 模型预览尺寸：400px x 300px
- 支持模型旋转、缩放和平移
- 预览图片自动生成和存储

### 图片处理
- 图片上传时自动生成缩略图
- 缩略图最大尺寸：400px x 300px
- 支持 PNG 透明度
- 原始图片和缩略图分开存储
- 支持的格式：jpg, jpeg, png, gif, webp, bmp

## 验证脚本

- 不要创建验证脚本或 tinker，因为测试涵盖了该功能并证明其有效。单元和功能测试更重要。
- 对于前端测试，编写测试以验证组件行为和用户交互。

## 应用程序结构和架构

- 坚持现有的目录结构；未经批准不要创建新的基础文件夹。
- 未经批准，不要更改应用程序的依赖项。
- 前端使用模块化组件架构，以 shadcn/ui 为基础。

## 前端开发

- **热模块替换 (HMR):** Vite 开发服务器支持 HMR 以实现即时更新
- **SSR 支持:** 服务器端渲染已配置，可以通过 `composer run dev:ssr` 启用
- **类型安全:** 所有路由通过 Wayfinder TypeScript 生成实现类型安全
- **如果更改不可见:** 运行 `npm run build` 或 `npm run dev` 重新构建资产
- **全栈开发:** 使用 `composer run dev` 同时启动 Laravel 服务器、队列、日志和 Vite

## Docker 开发环境

### PostgreSQL 容器

项目使用 Docker 运行 PostgreSQL 数据库。配置文件为 `docker-compose.yml`。

#### 启动容器

```bash
sudo docker-compose up -d
```

#### 停止容器

```bash
sudo docker-compose down
```

#### 检查容器状态

```bash
sudo docker ps | grep postgres
```

#### 查看容器日志

```bash
sudo docker logs triform_postgres
```

### Docker 镜像源

国内用户建议配置 Docker 镜像源以提高拉取速度。编辑 `/etc/docker/daemon.json`：

```json
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://docker.m.daocloud.io"
  ]
}
```

重启 Docker 服务：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 文档文件

- 只有在明确要求时才创建文档文件。
- 项目包含 `docker-database-migration-guide.md` - Docker 数据库迁移指南

## 回复

- 解释要简洁——专注于重要内容，而不是解释显而易见的细节。

=== boost rules ===

# Laravel Boost

- Laravel Boost 是一个 MCP 服务器，带有专门为此应用程序设计的强大工具。使用它们。

## Artisan

- 当您需要调用 Artisan 命令以再次检查可用参数时，使用 `list-artisan-commands` 工具。

## URL

- 每当您与用户共享项目 URL 时，使用 `get-absolute-url` 工具以确保您使用正确的方案、域/IP 和端口。

## Tinker / 调试

- 当您需要执行 PHP 来调试代码或直接查询 Eloquent 模型时，使用 `tinker` 工具。
- 当您只需要从数据库读取时，使用 `database-query` 工具。

## 使用 `browser-logs` 工具读取浏览器日志

- 您可以使用 Boost 的 `browser-logs` 工具读取浏览器日志、错误和异常。
- 只有最近的浏览器日志才有用——忽略旧日志。

## 搜索文档（至关重要）

- Boost 带有一个强大的 `search-docs` 工具，在使用 Laravel 或 Laravel 生态系统包之前，您应该先使用它而不是尝试其他方法。该工具自动将已安装软件包及其版本的列表传递给远程 Boost API，因此它仅返回用户 circumstances 的特定版本文档。如果您知道需要特定软件包的文档，应该传递一个软件包数组来过滤。
- 在进行代码更改之前搜索文档，以确保我们采用正确的方法。
- 一次使用多个广泛、简单、基于主题的查询。例如：`['rate limiting', 'routing rate limiting', 'routing']`。最相关的结果将首先返回。
- 不要在查询中添加软件包名称；软件包信息已经共享。例如，使用 `test resource table`，而不是 `filament 4 test resource table`。

### 可用的搜索语法

1. 简单单词搜索和自动词干 - query=authentication - 查找 'authenticate' 和 'auth'。
2. 多个单词（AND 逻辑） - query=rate limit - 查找同时包含 "rate" 和 "limit" 的知识。
3. 引用短语（精确位置） - query="infinite scroll" - 单词必须相邻且顺序一致。
4. 混合查询 - query=middleware "rate limit" - "middleware" 和精确短语 "rate limit"。
5. 多个查询 - queries=["authentication", "middleware"] - 任何这些术语。

=== php rules ===

# PHP

- 始终对控制结构使用花括号，即使是单行主体。

## 构造函数

- 在 `__construct()` 中使用 PHP 8 构造函数属性提升。
    - <code-snippet>public function __construct(public GitHub $github) { }</code-snippet>
- 不允许空参数的 `__construct()` 方法，除非构造函数是私有的。

## 类型声明

- 始终为方法和函数使用显式返回类型声明。
- 为方法参数使用适当的 PHP 类型提示。

<code-snippet name="显式返回类型和方法参数" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## 枚举

- 通常，枚举中的键应该是 TitleCase。例如：`FavoritePerson`、`BestLake`、`Monthly`。

## 注释

- 优先使用 PHPDoc 块而不是内联注释。除非逻辑非常复杂，否则不要在代码本身中使用注释。

## PHPDoc 块

- 适当时添加有用的数组形状类型定义。

=== tests rules ===

# 测试执行

- 每个更改都必须经过编程测试。编写新测试或更新现有测试，然后运行受影响的测试以确保它们通过。
- 运行确保代码质量和速度所需的最少测试量。使用 `php artisan test --compact` 配合特定文件名或过滤器。

### 前端测试
- 组件测试应验证渲染、用户交互和边缘情况
- 在测试中使用 TypeScript 实现类型安全
- 测试表单验证和错误状态
- 测试加载状态和异步操作
- 在适用时验证响应式行为

=== inertia-laravel/core rules ===

# Inertia

- Inertia 创建完全客户端渲染的 SPA，而没有现代 SPA 的复杂性，利用现有的服务器端模式。
- 组件位于 `resources/js/pages/` 中，使用 TypeScript (.tsx)。使用 `Inertia::render()` 进行服务器端路由，而不是 Blade 视图。
- 始终使用 `search-docs` 工具获取特定版本的 Inertia 文档和更新的代码示例。

=== inertia-laravel/v2 rules ===

# Inertia v2

- 使用 v1 和 v2 的所有 Inertia 功能。在更改之前检查文档以确保正确的方法。
- 新功能：延迟属性、无限滚动（合并 props + `WhenVisible`）、滚动上的延迟加载、轮询、预取。
- 使用延迟属性时，添加一个带有脉冲或动画骨架屏的空状态（使用 `components/ui/skeleton.tsx`）。
- 已配置 SSR 支持 - 使用 `composer run dev:ssr` 启用开发 SSR。

=== laravel/core rules ===

# 以 Laravel 的方式做事

- 使用 `php artisan make:` 命令创建新文件（即迁移、控制器、模型等）。您可以使用 `list-artisan-commands` 工具列出可用的 Artisan 命令。
- 如果您正在创建通用 PHP 类，请使用 `php artisan make:class`。
- 将 `--no-interaction` 传递给所有 Artisan 命令以确保它们无需用户输入即可工作。您还应该传递正确的 `--options` 以确保正确的行为。

## 数据库

- 始终使用具有返回类型提示的适当 Eloquent 关系方法。优先使用关系方法而不是原始查询或手动连接。
- 在建议原始数据库查询之前使用 Eloquent 模型和关系。
- 避免使用 `DB::`；优先使用 `Model::query()`。生成利用 Laravel ORM 功能而不是绕过它的代码。
- 生成防止 N+1 查询问题的代码，通过使用预先加载。
- 对非常复杂的数据库操作使用 Laravel 查询构建器。

### 模型创建

- 创建新模型时，也为它们创建有用的工厂和种子。询问用户是否需要其他东西，使用 `list-artisan-commands` 检查 `php artisan make:model` 的可用选项。

### API 和 Eloquent 资源

- 对于 API，默认使用 Eloquent API 资源和 API 版本控制，除非现有的 API 路由不使用，然后您应该遵循现有的应用程序约定。

## 控制器和验证

- 始终创建用于验证的表单请求类，而不是控制器中的内联验证。包括验证规则和自定义错误消息。
- 检查同级表单请求以查看应用程序是否使用基于数组或基于字符串的验证规则。

## 身份验证和授权

- 使用 Laravel 的内置身份验证和授权功能（门、策略、Sanctum 等）。

## URL 生成

- 生成指向其他页面的链接时，优先使用命名路由和 `route()` 函数。

## 队列

- 使用具有 `ShouldQueue` 接口的排队作业进行耗时的操作。

## 配置

- 仅在配置文件中使用环境变量——永远不要在配置文件之外直接使用 `env()` 函数。始终使用 `config('app.name')`，而不是 `env('APP_NAME')`。

## 测试

- 为测试创建模型时，使用模型的工厂。检查工厂是否有可以在手动设置模型之前使用的自定义状态。
- Faker: 使用诸如 `$this->faker->word()` 或 `fake()->randomDigit()` 之类的方法。遵循现有约定，无论是使用 `$this->faker` 还是 `fake()`。
- 创建测试时，利用 `php artisan make:test [options] {name}` 创建功能测试，并通过 `--unit` 创建单元测试。大多数测试应该是功能测试。

## Vite 错误

- 如果您收到 "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" 错误，请运行 `npm run build` 或 `npm run dev`。
- 如果发生 TypeScript 错误，请运行 `npm run types` 检查类型问题。
- 如果发生 ESLint 错误，请运行 `npm run lint` 自动修复 linting 问题。
- 对于生产环境中缺少的 CSS，确保使用 `npm run build` 正确构建 Tailwind CSS。

=== laravel/v12 rules ===

# Laravel 12

- 关键：始终使用 `search-docs` 工具获取特定版本的 Laravel 文档和更新的代码示例。
- 自 Laravel 11 以来，Laravel 具有新的简化文件结构，此项目使用该结构。

## Laravel 12 结构

- 在 Laravel 12 中，中间件不再在 `app/Http/Kernel.php` 中注册。
- 中件使用 `bootstrap/app.php` 中的 `Application::configure()->withMiddleware()` 声明性配置。
- `bootstrap/app.php` 是注册中间件、异常和路由文件的文件。
- `bootstrap/providers.php` 包含应用程序特定的服务提供者。
- `app\Console\Kernel.php` 文件不再存在；使用 `bootstrap/app.php` 或 `routes/console.php` 进行控制台配置。
- `app/Console/Commands/` 中的控制台命令自动可用，不需要手动注册。

## 数据库

- 修改列时，迁移必须包含先前在列上定义的所有属性。否则，它们将被删除和丢失。
- Laravel 12 原生支持限制预先加载的记录，而无需外部包：`$query->latest()->limit(10);`。

### 模型

- 类型转换可以在模型的 `casts()` 方法中设置，而不是 `$casts` 属性。遵循其他模型的现有约定。

=== wayfinder/core rules ===

# Laravel Wayfinder

Wayfinder 为 Laravel 路由生成 TypeScript 函数。从 `@/actions/`（控制器）或 `@/routes/`（命名路由）导入。

- 重要：在前端组件中引用后端路由时激活 `wayfinder-development` 技能。
- 可调用控制器：`import StorePost from '@/actions/.../StorePostController'; StorePost()`。
- 参数绑定：检测路由键（`{post:slug}`）— `show({ slug: "my-post" })`。
- 查询合并：`show(1, { mergeQuery: { page: 2, sort: null } })` 与当前 URL 合并，`null` 删除参数。
- Inertia: 将 `.form()` 与 `<Form>` 组件或 `form.submit(store())` 与 useForm 一起使用。
- 类型安全：所有路由函数都使用 TypeScript 完全类型化——利用它进行编译时错误检查。
- 表单变体：在 Vite 配置中启用——使用 `.form()` 帮助器进行类型安全的表单处理。

=== pint/core rules ===

# Laravel Pint 代码格式化程序

- 在完成更改之前必须运行 `vendor/bin/pint --dirty`，以确保您的代码符合项目的预期样式。
- 不要运行 `vendor/bin/pint --test`，只需运行 `vendor/bin/pint` 来修复任何格式化问题。

=== pest/core rules ===

## Pest

- 此项目使用 Pest 进行测试。创建测试：`php artisan make:test --pest {name}`。
- 运行测试：`php artisan test --compact` 或过滤：`php artisan test --compact --filter=testName`。
- 未经批准不要删除测试。
- 关键：始终使用 `search-docs` 工具获取特定版本的 Pest 文档和更新的代码示例。
- 重要：在使用 Pest 或测试相关任务时每次都激活 `pest-testing`。

=== laravel/fortify rules ===

# Laravel Fortify

- Fortify 是一个无头身份验证后端，为 Laravel 应用程序提供身份验证路由和控制器。
- 重要：始终使用 `search-docs` 工具获取详细的 Laravel Fortify 模式和文档。
- 重要：在使用 Fortify 身份验证功能时激活 `developing-with-fortify` 技能。

=== react/core rules ===

# React 19 搭配 TypeScript

- 适当使用 React 19 功能：Actions、useOptimistic、useFormStatus
- 启用 TypeScript 严格模式 - 始终提供显式类型
- 只有函数组件和 hooks（不使用类组件）
- 启用 React Compiler - 依赖自动优化
- 使用 `@/*` 路径别名作为 `resources/js/*` 的导入

## 组件指南

- 优先使用 shadcn/ui 组件而不是从头构建
- 使用来自 `@/lib/utils` 的 `cn()` 实用程序进行类合并
- 实现适当的加载和错误状态
- 为组件 props 使用 TypeScript 接口
- 保持组件专注和单一职责
- 将可重用逻辑提取到自定义 hooks

## Hooks 使用

- 使用来自 `@inertiajs/react` 的 `useForm` 进行表单处理
- 使用来自 Inertia 的 `usePage` 访问页面 props
- 在 `resources/js/hooks/` 中创建自定义 hooks 用于可重用逻辑
- 避免不必要的 `useMemo`/`useCallback` - React Compiler 处理这个问题

=== shadcn/ui rules ===

# shadcn/ui 组件

- shadcn/ui 是主要的 UI 组件库（Radix UI + Tailwind CSS）
- 组件位于 `resources/js/components/ui/`
- 在创建新组件之前使用现有组件
- 遵循现有的组件模式和命名
- 使用 `lucide-react` 作为图标
- 组件通过 CSS 变量支持主题化

## 可用组件

常用组件包括：button、input、label、dialog、dropdown-menu、select、checkbox、card、alert、badge、avatar、tooltip、skeleton、spinner、sidebar 等。
- 检查 `resources/js/components/ui/` 获取可用组件的完整列表。

## 添加新组件

- 需要时使用 shadcn CLI 添加新组件
- 遵循项目现有的组件结构
- 确保新组件支持主题化系统
- 为所有 props 添加 TypeScript 接口

=== tailwindcss/core rules ===

# Tailwind CSS 4.0

- 使用 Tailwind CSS 4.0 搭配 Vite 集成进行样式设置
- 使用 CSS 变量进行主题化（检查 `resources/css/app.css`）
- 使用 `cn()` 实用程序进行条件类合并
- 遵循现有的颜色和间距约定
- 响应式设计是移动优先的
- 自定义样式应该是最少的——优先使用实用程序类

## 样式模式

- 使用语义颜色标记（例如，`bg-primary`、`text-muted-foreground`）
- 使用 Tailwind 的比例实现一致的间距
- 使用 `@tailwindcss/vite` 插件获得最佳性能
- 利用 Tailwind 的 CSS 变量进行动态主题化

=== typescript/core rules ===

# TypeScript 最佳实践

- 启用严格模式 - 没有隐式 any 类型
- 为函数使用显式返回类型
- 为复杂数据结构定义接口
- 使用类型守卫进行运行时类型检查
- 避免使用 `any` - 当类型真正未知时使用 `unknown`
- 利用实用类型（Partial、Pick、Omit 等）
- 使用枚举表示固定的值集（TitleCase 命名）

## 类型定义

- 全局类型在 `resources/js/types/` 中
- 组件 props 应该使用接口类型化
- 路由类型由 Wayfinder 自动生成
- 对所有新代码使用 TypeScript

=== eslint/prettier rules ===

# 代码质量工具

- 配置了支持 TypeScript 的 ESLint 9
- 运行 `npm run lint` 检查并自动修复 linting 问题
- 配置了 Prettier 以实现一致的格式化
- 运行 `npm run format` 格式化代码
- 运行 `npm run types` 检查 TypeScript 类型
- 两个工具都在开发期间自动运行

## Linting 规则

- 没有未使用的变量或导入
- 适当的缩进和格式化
- 一致的命名约定
- 类型安全执行
- React 最佳实践

</laravel-boost-guidelines>
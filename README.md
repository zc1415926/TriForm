# TriForm - 3D 选修课管理系统

基于 Laravel 12 和 React 19 构建的现代化课程管理平台，支持 3D 模型上传预览、富文本编辑、作品管理和评分等功能。

## 功能特性

### 核心功能
- 🎓 **学生管理** - 学生信息管理，按年份分组
- 📚 **课程管理** - 课程创建和编辑，支持富文本内容
- 📝 **作业管理** - 作业创建和分配，关联课程
- 🎨 **作品提交** - 支持 3D 模型（STL）和图片上传
- 🖼️ **3D 模型预览** - 基于 Babylon.js 的 STL 模型查看器
- ✏️ **富文本编辑** - 基于 TipTap 的课程内容编辑器
- ⭐ **作品评分** - 灵活的作品评分系统
- 🏆 **作品广场** - 展示所有提交的作品
- 👤 **用户认证** - Laravel Fortify 无头身份验证
- 🌙 **深色模式** - 支持明暗主题切换

### 技术亮点
- 🚀 **类型安全** - 全栈 TypeScript，Wayfinder 提供类型安全的路由
- ⚡ **React Compiler** - 自动性能优化
- 🎨 **现代化 UI** - shadcn/ui 组件库
- 🐳 **Docker 支持** - PostgreSQL 容器化部署
- 🔄 **HMR 支持** - 开发时即时更新
- 🌐 **SSR 支持** - 服务器端渲染
- 🎯 **代码质量** - ESLint + Prettier + Laravel Pint

## 技术栈

### 后端
- **框架**: Laravel 12
- **PHP**: ^8.2
- **数据库**: PostgreSQL 15 (Docker)
- **身份验证**: Laravel Fortify
- **测试**: Pest 4

### 前端
- **框架**: React 19
- **语言**: TypeScript 5.7
- **路由**: Inertia.js v2
- **样式**: Tailwind CSS 4.0
- **UI 组件**: shadcn/ui (Radix UI + Tailwind)
- **3D 引擎**: Babylon.js 8.49
- **富文本**: TipTap 3.18
- **构建工具**: Vite 7.0.4

## 安装步骤

### 前置要求
- PHP ^8.2
- Composer
- Node.js ^18
- Docker（用于 PostgreSQL）
- Docker Compose

### 1. 克隆项目

```bash
git clone https://github.com/zc1415926/TriForm.git
cd TriForm
```

### 2. 安装依赖

```bash
composer install
npm install
```

### 3. 配置环境

```bash
cp .env.example .env
php artisan key:generate
```

### 4. 启动数据库

```bash
sudo docker-compose up -d
```

### 5. 运行迁移

```bash
php artisan migrate
```

### 6. 构建前端资源

```bash
npm run build
```

### 7. 启动开发服务器

```bash
composer run dev
```

访问 http://localhost:8000

## 开发命令

### 前端
```bash
npm run dev          # 启动 Vite 开发服务器
npm run build        # 生产环境构建
npm run build:ssr    # SSR 构建
npm run lint         # ESLint 检查和修复
npm run format       # Prettier 格式化
npm run types        # TypeScript 类型检查
```

### 后端
```bash
composer run dev      # 启动完整开发堆栈
composer run dev:ssr  # 启动 SSR 开发堆栈
composer run setup    # 项目初始设置
composer run test     # 运行测试
```

### Docker
```bash
sudo docker-compose up -d    # 启动容器
sudo docker-compose down     # 停止容器
sudo docker logs triform_postgres  # 查看日志
```

## 项目结构

```
TriForm/
├── app/                    # Laravel 应用程序核心
│   ├── Http/Controllers/   # 控制器
│   ├── Models/             # Eloquent 模型
│   └── ...
├── database/               # 数据库文件
│   ├── factories/          # 模型工厂
│   ├── migrations/         # 数据库迁移
│   └── seeders/            # 数据填充
├── resources/
│   ├── css/                # 样式文件
│   ├── js/
│   │   ├── components/     # React 组件
│   │   │   ├── ui/         # shadcn/ui 组件
│   │   │   └── ...         # 自定义组件
│   │   ├── pages/          # Inertia 页面
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── lib/            # 工具函数
│   │   └── types/          # TypeScript 类型
│   └── views/              # Blade 模板
├── routes/                 # 路由文件
├── tests/                  # 测试文件
├── docker-compose.yml      # Docker 配置
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript 配置
```

## 数据库迁移

### 从 SQLite 迁移到 PostgreSQL

项目默认使用 PostgreSQL 数据库（通过 Docker）。详细的迁移指南请参考 [docker-database-migration-guide.md](docker-database-migration-guide.md)。

### Docker 镜像源配置

国内用户建议配置 Docker 镜像源以提高拉取速度：

编辑 `/etc/docker/daemon.json`:

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

## 常见问题

### 1. 数据库连接失败

确保 PostgreSQL 容器正在运行：

```bash
sudo docker ps | grep postgres
```

检查数据库配置：

```bash
php artisan tinker --execute="var_dump(DB::connection()->getDatabaseName());"
```

### 2. 前端资源未更新

清除缓存并重新构建：

```bash
php artisan optimize:clear
npm run build
```

### 3. 环境变量未生效

清除配置缓存：

```bash
php artisan config:clear
```

### 4. Docker 镜像拉取超时

配置国内镜像源（见上文）。

### 5. 权限错误

将用户添加到 docker 组：

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 开发指南

### 代码风格

- **PHP**: 遵循 Laravel Pint 规范
- **TypeScript**: 遵循 ESLint 和 Prettier 规范
- 提交前运行：`composer run lint` 和 `npm run lint`

### 测试

```bash
php artisan test --compact              # 运行所有测试
php artisan test --compact --filter=xxx # 运行特定测试
```

### 添加新功能

1. 创建控制器：`php artisan make:controller XxxController`
2. 创建模型：`php artisan make:model Xxx -mf`（带迁移和工厂）
3. 创建页面：在 `resources/js/pages/` 中创建组件
4. 添加路由：在 `routes/web.php` 中定义

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- GitHub: https://github.com/zc1415926/TriForm

---

**注意**: 本项目使用 Laravel Boost 和 iFlow CLI 进行开发。更多详细信息请参考 [AGENTS.md](AGENTS.md)。
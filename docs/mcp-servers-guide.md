# MCP 服务器配置指南

本文档总结了在 Laravel 项目中配置 MCP (Model Context Protocol) 服务器的经验，包括 Laravel Boost MCP 和 shadcn MCP。

## 目录

- [什么是 MCP](#什么是-mcp)
- [Laravel Boost MCP](#laravel-boost-mcp)
- [shadcn MCP](#shadcn-mcp)
- [iFlow CLI 配置](#iflow-cli-配置)
- [常见问题](#常见问题)

---

## 什么是 MCP

MCP (Model Context Protocol) 是一个开放协议，允许 AI 助手安全地连接外部数据源和工具。通过 MCP，AI 助手可以：

- 访问数据库和文件系统
- 执行命令和查询
- 搜索文档和资源
- 安装和管理组件

---

## Laravel Boost MCP

Laravel Boost 是 Laravel 官方提供的 MCP 服务器，为 AI 助手提供强大的 Laravel 开发工具。

### 安装

```bash
# 1. 安装 Laravel Boost 包
composer require laravel/boost --dev

# 2. 安装 MCP 服务器和代码指南
php artisan boost:install
```

### 配置

在项目根目录创建或编辑 `.mcp.json`：

```json
{
  "mcpServers": {
    "laravel-boost": {
      "command": "php",
      "args": ["artisan", "boost:mcp"]
    }
  }
}
```

### 可用工具（14 个）

| 工具名 | 功能说明 |
|--------|----------|
| `application-info` | 获取应用信息（PHP/Laravel 版本、数据库、已安装包、模型列表） |
| `browser-logs` | 读取浏览器中的日志和错误 |
| `database-connections` | 检查可用的数据库连接 |
| `database-query` | 执行只读 SQL 查询 |
| `database-schema` | 读取数据库架构（表、列、索引、外键） |
| `get-absolute-url` | 将相对路径转换为绝对 URL |
| `get-config` | 获取配置值（点表示法） |
| `last-error` | 获取最后一个后端错误 |
| `list-artisan-commands` | 列出所有 Artisan 命令 |
| `list-available-config-keys` | 列出所有配置键 |
| `list-available-env-vars` | 列出所有环境变量名 |
| `list-routes` | 列出所有路由 |
| `read-log-entries` | 读取应用日志条目 |
| `search-docs` | 搜索 Laravel 生态系统文档（17,000+ 知识库） |
| `tinker` | 在 Laravel 上下文中执行 PHP 代码 |

### 启动方式

```bash
# MCP 服务器通过 stdio 通信，通常由 AI 客户端自动启动
php artisan boost:mcp

# 测试 MCP 服务器（列出工具）
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | php artisan boost:mcp
```

### 常用命令

```bash
# 更新 Boost 资源（指南和技能）
php artisan boost:update

# 添加远程技能
php artisan boost:add-skill
```

### 相关文件

| 文件/目录 | 说明 |
|-----------|------|
| `boost.json` | Boost 配置文件 |
| `AGENTS.md` / `CLAUDE.md` / `IFLOW.md` | AI 指南文件 |
| `.claude/skills/` | Claude Code 技能目录 |
| `.iflow/skills/` | iFlow CLI 技能目录 |

---

## shadcn MCP

shadcn MCP 服务器允许 AI 助手浏览、搜索和安装 shadcn/ui 组件。

### 配置

在 `.mcp.json` 中添加：

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

### 可用工具（7 个）

| 工具名 | 功能说明 |
|--------|----------|
| `get_project_registries` | 获取 `components.json` 中配置的注册表名称 |
| `list_items_in_registries` | 列出注册表中的所有组件 |
| `search_items_in_registries` | 搜索组件（模糊匹配） |
| `view_items_in_registries` | 查看组件详细信息（名称、描述、文件内容） |
| `get_item_examples_from_registries` | 获取组件使用示例和演示代码 |
| `get_add_command_for_items` | 获取安装组件的 CLI 命令 |
| `get_audit_checklist` | 创建新组件后的检查清单 |

### 启动方式

```bash
# 测试 shadcn MCP
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx shadcn@latest mcp
```

### 配置自定义注册表

在 `components.json` 中配置：

```json
{
  "registries": {
    "@acme": "https://registry.acme.com/{name}.json",
    "@internal": {
      "url": "https://internal.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

---

## iFlow CLI 配置

### 完整的 `.mcp.json` 配置

```json
{
  "mcpServers": {
    "laravel-boost": {
      "command": "php",
      "args": ["artisan", "boost:mcp"]
    },
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

### 检查 MCP 状态

```bash
# 列出已配置的 MCP 服务器
iflow mcp list
```

输出示例：
```
已配置的 MCP 服务器：

✓ laravel-boost: php artisan boost:mcp (stdio) - 已连接
✓ shadcn: npx shadcn@latest mcp (stdio) - 已连接
```

### 为 iFlow CLI 添加 Boost Agent

1. 创建 Agent 类 `app/Mcp/Agents/IFlow.php`

2. 在 `app/Providers/AppServiceProvider.php` 中注册：

```php
use App\Mcp\Agents\IFlow;
use Laravel\Boost\Boost;

public function boot(): void
{
    Boost::registerAgent('iflow', IFlow::class);
}
```

3. 更新 `boost.json`：

```json
{
  "agents": [
    "iflow"
  ]
}
```

4. 创建必要的文件：
   - `IFLOW.md` - AI 指南文件
   - `.iflow/skills/` - 技能目录

---

## 常见问题

### MCP 服务器未显示连接

**原因：** 配置更改后需要重启 AI 客户端

**解决方案：**
```bash
# 重启 AI 客户端会话
# 或手动测试 MCP 是否工作
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | php artisan boost:mcp
```

### shadcn MCP 无响应

**解决方案：**
```bash
# 清除 npx 缓存
npx clear-npx-cache

# 重新安装
npx shadcn@latest mcp
```

### Boost 工具无法使用

**检查步骤：**
1. 确认 `laravel/boost` 已安装
2. 确认 `.mcp.json` 配置正确
3. 确认 PHP 可执行
4. 检查项目目录是否正确

### 找不到 components.json

**解决方案：**
```bash
# 初始化 shadcn/ui
npx shadcn@latest init
```

---

## 工具测试结果

以下是在 TriForm 项目中测试所有 MCP 工具的结果（测试时间：2026-02-13）。

### Laravel Boost MCP (15 个工具)

| 工具 | 状态 | 测试结果 |
|------|------|----------|
| `application-info` | ✅ 通过 | PHP 8.4.1, Laravel 12.49.0, PostgreSQL, 20 个已安装包 |
| `database-connections` | ✅ 通过 | 默认连接 pgsql，支持 sqlite/mysql/mariadb/pgsql/sqlsrv |
| `database-schema` | ✅ 通过 | 返回 users 表结构（12 列、2 索引、无外键） |
| `database-query` | ✅ 通过 | `SELECT table_name FROM information_schema.tables` 返回 5 条记录 |
| `get-absolute-url` | ✅ 通过 | `/dashboard` → `http://localhost:8000/dashboard` |
| `get-config` | ✅ 通过 | `app.name` → `3D选修课管理` |
| `list-artisan-commands` | ✅ 通过 | 返回 156 个可用 Artisan 命令 |
| `list-available-config-keys` | ✅ 通过 | 返回 500+ 配置键（如 app.name, database.default 等） |
| `list-available-env-vars` | ✅ 通过 | 返回 47 个环境变量名（APP_DEBUG, DB_HOST 等） |
| `list-routes` | ✅ 通过 | 返回 79 条路由（含 login, dashboard, students 等） |
| `read-log-entries` | ✅ 通过 | 返回最近日志（数据库外键错误、连接错误等） |
| `last-error` | ✅ 通过 | 返回 PostgreSQL 连接拒绝错误 |
| `browser-logs` | ✅ 通过 | 返回浏览器日志（React DevTools 提示、渲染调试信息） |
| `search-docs` | ✅ 通过 | 搜索 "validation, form request" 返回 31 个文档、527 个片段 |
| `tinker` | ✅ 通过 | `return 1 + 1;` → 返回结果 2 |

### shadcn MCP (7 个工具)

| 工具 | 状态 | 测试结果 |
|------|------|----------|
| `get_project_registries` | ✅ 通过 | 发现 @shadcn 注册表 |
| `list_items_in_registries` | ✅ 通过 | @shadcn 共有 403 个组件，返回前 10 个（accordion, alert, button 等） |
| `search_items_in_registries` | ✅ 通过 | 搜索 "button" 匹配 33 个组件（button, kbd-button, button-demo 等） |
| `view_items_in_registries` | ✅ 通过 | button 组件详情：类型 registry:ui，依赖 radix-ui |
| `get_item_examples_from_registries` | ✅ 通过 | 返回 button-demo 和 button-group-demo 完整示例代码 |
| `get_add_command_for_items` | ✅ 通过 | 返回安装命令：`npx shadcn@latest add @shadcn/button @shadcn/card` |
| `get_audit_checklist` | ✅ 通过 | 返回 6 项检查清单（导入正确性、依赖安装、lint/TS 错误等） |

### 测试命令示例

```bash
# 测试 Laravel Boost 工具
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"application-info","arguments":{}}}' | php artisan boost:mcp

# 测试 shadcn 工具
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_items_in_registries","arguments":{"registries":["@shadcn"],"query":"button","limit":5}}}' | npx shadcn@latest mcp
```

**测试结论：** 所有 22 个 MCP 工具均测试通过，两个 MCP 服务器工作正常。

---

## 最佳实践

1. **定期更新** - 运行 `php artisan boost:update` 保持指南最新
2. **版本控制** - 可将 `.mcp.json` 添加到 `.gitignore`，因为它会自动生成
3. **多客户端支持** - 不同 AI 客户端可能使用不同的配置文件位置：
   - iFlow CLI: `.mcp.json`
   - Claude Code: `.mcp.json`
   - Cursor: `.cursor/mcp.json`
   - VS Code: `.vscode/mcp.json`

---

## 参考链接

- [Laravel Boost 文档](https://laravel.com/docs/12.x/boost)
- [shadcn MCP 文档](https://ui.shadcn.com/docs/mcp)
- [MCP 规范](https://modelcontextprotocol.io/)

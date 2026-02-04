# Docker 数据库迁移指南

本文档记录了从 SQLite 迁移到 PostgreSQL 的完整过程和遇到的问题解决方案。

## 背景信息

- **源数据库**: SQLite (`database/database.sqlite`)
- **目标数据库**: PostgreSQL 15
- **容器环境**: Docker
- **操作系统**: Linux 6.14.0-37-generic

## 准备工作

### 1. 安装 Docker

```bash
sudo apt install -y docker.io docker-compose
```

### 2. 配置 Docker 镜像源（国内用户）

由于网络原因，直接拉取 Docker 镜像可能会失败。推荐配置国内镜像源。

#### 编辑 Docker 配置文件

```bash
sudo vim /etc/docker/daemon.json
```

#### 添加镜像源配置

```json
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://docker.m.daocloud.io"
  ]
}
```

#### 重启 Docker 服务

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

#### 验证配置

```bash
sudo docker info | grep "Registry Mirrors"
```

输出应该包含您配置的镜像源地址。

## Docker Compose 配置

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: triform_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: triform
      POSTGRES_USER: triform
      POSTGRES_PASSWORD: triform_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U triform"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

## Laravel 配置

### 更新 .env 文件

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=triform
DB_USERNAME=triform
DB_PASSWORD=triform_password
```

## 启动和配置

### 1. 启动 PostgreSQL 容器

```bash
sudo docker-compose up -d
```

### 2. 检查容器状态

```bash
sudo docker ps | grep postgres
```

### 3. 测试数据库连接

```bash
sudo docker exec triform_postgres pg_isready -U triform
```

输出应该显示：`/var/run/postgresql:5432 - accepting connections`

### 4. 运行数据库迁移

```bash
php artisan migrate
```

## 常见问题和解决方案

### 问题 1: 镜像拉取超时

**错误信息:**
```
Get "https://registry-1.docker.io/v2/": context deadline exceeded
```

**解决方案:**
1. 配置国内镜像源（见上文）
2. 重新尝试拉取镜像

### 问题 2: 权限错误

**错误信息:**
```
PermissionError: [Errno 13] Permission denied
```

**解决方案:**
```bash
sudo usermod -aG docker $USER
# 需要重新登录或执行:
newgrp docker
```

### 问题 3: 环境变量被系统环境覆盖

**错误信息:**
即使 `.env` 文件中设置了 `DB_CONNECTION=pgsql`，但 Laravel 仍然使用 SQLite。

**原因:**
系统环境变量 `DB_CONNECTION=sqlite` 覆盖了 `.env` 文件中的设置。

**解决方案 1（推荐）: 取消系统环境变量**
```bash
unset DB_CONNECTION
```

**解决方案 2: 在命令中显式指定**
```bash
DB_CONNECTION=pgsql php artisan migrate
DB_CONNECTION=pgsql php artisan serve
```

### 问题 4: 缓存导致配置未生效

**现象:**
修改 `.env` 文件后，配置未生效。

**解决方案:**
```bash
php artisan optimize:clear
```

或清除特定缓存：
```bash
php artisan config:clear
php artisan cache:clear
```

### 问题 5: Python 依赖缺失

**错误信息:**
```
ModuleNotFoundError: No module named 'distutils'
```

**解决方案:**
```bash
sudo apt install -y python3-setuptools
```

## 验证迁移成功

### 1. 检查 PostgreSQL 中的表

```bash
sudo docker exec triform_postgres psql -U triform -d triform -c "\dt"
```

应该看到所有迁移的表。

### 2. 验证 Laravel 连接

```bash
php artisan tinker --execute="var_dump(DB::connection()->getDatabaseName());"
```

应该输出：`string(7) "triform"`

### 3. 检查迁移状态

```bash
php artisan migrate:status
```

## 维护命令

### 停止容器

```bash
sudo docker-compose down
```

### 启动容器

```bash
sudo docker-compose up -d
```

### 查看容器日志

```bash
sudo docker logs triform_postgres
```

### 进入容器

```bash
sudo docker exec -it triform_postgres sh
```

### 备份数据库

```bash
sudo docker exec triform_postgres pg_dump -U triform triform > backup.sql
```

### 恢复数据库

```bash
cat backup.sql | sudo docker exec -i triform_postgres psql -U triform -d triform
```

## 性能优化建议

1. **调整 PostgreSQL 配置**: 根据服务器资源调整 `shared_buffers`、`work_mem` 等参数
2. **使用数据卷**: 确保数据持久化，容器重启不丢失数据
3. **定期备份**: 设置自动备份任务
4. **监控资源使用**: 使用 `docker stats` 监控容器资源使用情况

## 国内镜像源推荐

| 镜像源 | 地址 | 特点 |
|--------|------|------|
| 网易云 | https://hub-mirror.c.163.com | 免费公开，无需注册 |
| 中科大 | https://docker.mirrors.ustc.edu.cn | 公益性质，学术机构维护 |
| DaoCloud | https://docker.m.daocloud.io | 老牌容器服务商 |
| 腾讯云 | https://mirror.ccs.tencentyun.com | 云厂商提供 |

## 总结

1. **配置镜像源**: 国内用户必须配置 Docker 镜像源
2. **环境变量**: 检查系统环境变量是否覆盖了 `.env` 文件
3. **清除缓存**: 修改配置后记得清除缓存
4. **权限管理**: 正确配置 Docker 用户权限
5. **健康检查**: 配置健康检查确保数据库服务正常

## 参考资料

- [Docker 官方文档](https://docs.docker.com/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Laravel 数据库配置](https://laravel.com/docs/database)
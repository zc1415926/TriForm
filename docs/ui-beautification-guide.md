# React + Tailwind CSS 页面美化指南

本文档总结了对 TriForm 项目进行页面美化的经验和方法，可作为后续开发的参考标准。

## 1. 设计原则

### 1.1 视觉层次
- **渐变背景**：用于页面标题区域，营造现代感和深度
- **卡片布局**：使用卡片（Card）组件包裹主要内容区域
- **色彩协调**：每个页面使用不同的主色调主题

### 1.2 间距和布局
- 使用 `max-w-7xl mx-auto` 限制最大宽度并居中
- 页面内使用 `space-y-6` 或 `gap-4` 保持元素间距
- 使用 `p-6` 作为标准内边距

## 2. 页面标题区域设计

### 标准模板

```tsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
    {/* 装饰性点阵背景 */}
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
    
    <div className="relative z-10 flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <IconComponent className="w-8 h-8" />
        </div>
        <div>
            <h1 className="text-3xl font-bold">页面标题</h1>
            <p className="text-blue-100">页面副标题说明</p>
        </div>
    </div>
</div>
```

### 推荐渐变配色方案

| 页面类型 | 渐变方向 | 颜色组合 |
|---------|---------|---------|
| 学生管理 | 蓝紫渐变 | `from-blue-600 via-indigo-600 to-purple-700` |
| 课时管理 | 青绿渐变 | `from-emerald-600 via-teal-600 to-cyan-700` |
| 上传类型 | 玫瑰粉渐变 | `from-rose-600 via-pink-600 to-purple-700` |
| 作品提交 | 琥珀橙渐变 | `from-amber-500 via-orange-500 to-red-500` |

## 3. 操作栏设计

### 标准模板

```tsx
<div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex items-center gap-4">
        {/* 筛选器 */}
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">年份筛选</span>
            <Select>
                <SelectTrigger className="w-[140px] rounded-lg border-gray-200">
                    <SelectValue placeholder="全部年份" />
                </SelectTrigger>
                {/* SelectContent */}
            </Select>
        </div>
        
        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-200" />
        
        {/* 其他操作按钮 */}
    </div>
    
    {/* 主要操作按钮 */}
    <Button className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
        <Plus className="mr-2 h-4 w-4" />
        添加
    </Button>
</div>
```

### 按钮样式规范

- **主要按钮**：使用渐变背景 + 阴影 + 悬停效果
- **次要按钮**：`variant="outline"` + 彩色图标
- **图标按钮**：`rounded-lg` + 悬停背景色

## 4. 表格区域设计

### 使用 Card 包裹表格

```tsx
<Card className="overflow-hidden shadow-lg border-0">
    <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 py-4">
        <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-theme-500" />
            <span className="font-semibold text-gray-800">列表标题</span>
            <Badge variant="secondary" className="bg-theme-100 text-theme-700">
                {count} 条
            </Badge>
        </div>
    </CardHeader>
    <CardContent className="p-0">
        <Table>
            <TableHeader>
                <TableRow className="bg-gradient-to-r from-theme-50/50 to-theme-50/50">
                    {/* TableHead */}
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* TableRow with hover:bg-gray-50/50 */}
            </TableBody>
        </Table>
    </CardContent>
</Card>
```

### 表格行悬停效果

```tsx
<TableRow className="hover:bg-gray-50/50 transition-colors">
    <TableCell className="text-gray-600">{data.id}</TableCell>
    <TableCell className="font-medium text-gray-800">{data.name}</TableCell>
    {/* ... */}
</TableRow>
```

### 空状态设计

```tsx
{data.length === 0 && (
    <TableRow>
        <TableCell colSpan={7} className="text-center py-16">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">暂无数据</p>
                <p className="text-gray-400 text-sm mt-1">操作提示文本</p>
            </div>
        </TableCell>
    </TableRow>
)}
```

## 5. 统计卡片设计

### 标准模板

```tsx
<Card className="overflow-hidden border-0 shadow-lg">
    <CardContent className="p-0">
        <div className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-200">
                <Icon className="size-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">统计项名称</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
    </CardContent>
</Card>
```

### 推荐配色

- 蓝色系：`from-blue-400 to-blue-600`
- 绿色系：`from-green-400 to-green-600`
- 琥珀系：`from-amber-400 to-orange-600`
- 紫色系：`from-purple-400 to-purple-600`

## 6. 模态框设计

### 创建/编辑模态框模板

```tsx
<DialogContent className="sm:max-w-[450px] rounded-2xl">
    <DialogHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-500 to-theme-600 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <DialogTitle className="text-xl">模态框标题</DialogTitle>
                <DialogDescription className="text-gray-500">
                    模态框描述
                </DialogDescription>
            </div>
        </div>
    </DialogHeader>
    
    <form onSubmit={handleSubmit} className="space-y-5 pt-4">
        <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">标签</Label>
            <Input
                id="name"
                className="rounded-xl h-11 border-gray-200 focus:border-theme-500 focus:ring-theme-500"
                // ...
            />
            {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                    {errors.name}
                </p>
            )}
        </div>
        
        <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" className="rounded-xl h-11 px-6">
                取消
            </Button>
            <Button className="rounded-xl h-11 px-6 bg-gradient-to-r from-theme-600 to-theme-600">
                确认
            </Button>
        </DialogFooter>
    </form>
</DialogContent>
```

### 删除确认模态框模板

```tsx
<DialogContent className="sm:max-w-[400px] rounded-2xl">
    <DialogHeader className="pb-4">
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl">确认删除</DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
                确定要删除吗？此操作无法撤销。
            </DialogDescription>
        </div>
    </DialogHeader>
    <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="outline" className="flex-1 rounded-xl h-11">
            取消
        </Button>
        <Button className="flex-1 rounded-xl h-11 bg-gradient-to-r from-red-500 to-red-600">
            删除
        </Button>
    </DialogFooter>
</DialogContent>
```

### 导入模态框模板

```tsx
<DialogContent className="sm:max-w-[520px] rounded-2xl">
    <DialogHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
                <DialogTitle className="text-xl">导入</DialogTitle>
                <DialogDescription className="text-gray-500">
                    导入说明文本
                </DialogDescription>
            </div>
        </div>
    </DialogHeader>
    
    <div className="space-y-5 py-5">
        {/* 说明区域 */}
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
            <h4 className="mb-3 font-semibold text-amber-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                导入说明
            </h4>
            <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                    说明项 1
                </li>
                {/* ... */}
            </ul>
        </div>
        
        {/* 文件选择区域 */}
        <div className="space-y-3">
            <Label className="text-gray-700 font-medium">选择文件</Label>
            <Button
                variant="outline"
                className="w-full rounded-xl h-11 border-dashed border-2 hover:border-green-400 hover:bg-green-50/50"
            >
                <FileUp className="mr-2 size-4 text-green-500" />
                选择文件
            </Button>
        </div>
    </div>
</DialogContent>
```

## 7. 成功消息提示设计

```tsx
{success && (
    <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-green-600" />
        </div>
        <span className="text-green-800 font-medium">{success}</span>
    </div>
)}
```

## 8. 状态徽章设计

```tsx
// 启用状态
<Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
    <CheckCircle2 className="mr-1 size-3" />
    已启用
</Badge>

// 禁用状态
<Badge variant="secondary" className="bg-gray-100 text-gray-600">
    已禁用
</Badge>

// 待审核状态
<Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
    待审核
</Badge>

// 扩展名徽章
<Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
    .{extension}
</Badge>
```

## 9. 常用 Tailwind 类参考

### 圆角
- `rounded-xl` - 大圆角（按钮、输入框）
- `rounded-2xl` - 更大圆角（卡片、模态框）
- `rounded-full` - 圆形（徽章、头像）

### 阴影
- `shadow-sm` - 小阴影
- `shadow-lg` - 大阴影
- `shadow-xl` - 超大阴影（标题区域）

### 渐变
- `bg-gradient-to-r` - 从左到右渐变
- `bg-gradient-to-br` - 从左上到右下渐变

### 颜色透明度
- `bg-white/20` - 白色 20% 透明度
- `backdrop-blur-sm` - 背景模糊效果

## 10. 图标使用建议

### 页面标题图标
- 学生管理：`GraduationCap`
- 课时管理：`BookOpen`
- 上传类型：`FileType`
- 作品提交：`Sparkles`

### 操作图标
- 添加：`Plus`
- 编辑：`Pencil`
- 删除：`Trash2`
- 查看：`Eye`
- 导入：`Upload`
- 导出：`Download`
- 复制：`Copy`
- 搜索：`Search`
- 筛选：`Filter`

## 11. 最佳实践

1. **保持一致性**：同一类页面使用相似的设计模式
2. **响应式设计**：使用 `sm:`, `lg:` 前缀适配不同屏幕
3. **可访问性**：确保颜色对比度足够，添加适当的 ARIA 标签
4. **性能**：避免过度使用阴影和渐变，可能影响渲染性能
5. **主题一致性**：整个项目使用统一的圆角、间距和色彩系统

## 12. 文件位置

美化后的页面文件：
- `/resources/js/pages/students/index.tsx` - 学生管理列表
- `/resources/js/pages/students/show.tsx` - 学生详情/查看作品
- `/resources/js/pages/lessons/index.tsx` - 课时管理
- `/resources/js/pages/upload-types/index.tsx` - 上传类型管理
- `/resources/js/pages/submissions/index.tsx` - 作品提交

---

*最后更新：2026年2月14日*

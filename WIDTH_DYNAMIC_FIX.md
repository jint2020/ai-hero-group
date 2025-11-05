# 右侧主功能区动态宽度修复

## 问题描述

在PC端，拖动分隔条调整左侧侧边栏宽度后，右侧主功能区（ApiConfig和ConversationView）的宽度没有跟随变化。

## 根本原因

PC端侧边栏没有设置默认宽度，导致：
1. 侧边栏宽度为0（不可见）
2. Flex布局无法正确计算右侧主内容区的宽度
3. 分隔条虽然存在，但没有实际的分隔内容

## 修复方案

### 1. **设置PC端侧边栏默认宽度**

```typescript
style={{
  // 移动端：使用动态宽度（sidebarOpen为true时）
  // PC端（lg:）：使用存储的宽度
  width: sidebarOpen
    ? `${Math.min(sidebarWidth, window.innerWidth * 0.85)}px`
    : typeof window !== 'undefined' && window.innerWidth >= 1024
      ? `${sidebarWidth}px`  // PC端设置默认宽度
      : undefined
}}
```

**逻辑说明**：
- 移动端且侧边栏打开：使用动态宽度（最大视口85%）
- PC端：始终使用存储的sidebarWidth值
- 移动端且侧边栏关闭：不设置宽度（隐藏状态）

### 2. **优化分隔条参数**

```typescript
<ResizableDivider
  onResize={updateSidebarWidth}
  initialWidth={sidebarWidth}
  minWidth={200}   // 明确设置最小宽度
  maxWidth={600}   // 明确设置最大宽度
/>
```

### 3. **添加主内容区背景**

```typescript
<main className="flex-1 flex flex-col overflow-hidden flex-grow min-w-0 bg-gray-900">
```

为右侧主内容区添加背景色，使其与侧边栏形成视觉对比。

## 布局计算公式

**PC端布局**：
```
总宽度 = 左侧侧边栏宽度 + 分隔条宽度(4px) + 右侧主内容区宽度

其中：
- 左侧侧边栏宽度 = sidebarWidth (默认320px，可拖拽调整)
- 分隔条宽度 = 4px (固定)
- 右侧主内容区宽度 = flex自动计算（总宽度 - 侧边栏宽度 - 4px）
```

**响应式行为**：

| 屏幕宽度 | 侧边栏 | 分隔条 | 主内容区 |
|----------|--------|--------|----------|
| < 1024px | 隐藏（汉堡菜单） | 隐藏 | 全宽 |
| ≥ 1024px | 可见（默认320px） | 可见（4px） | 自动调整 |

## 技术实现细节

### Flex布局自动计算

使用CSS Flexbox实现自动宽度计算：

```css
.container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 320px; /* 可调整 */
}

.divider {
  width: 4px; /* 固定 */
}

.main-content {
  flex: 1; /* 自动占据剩余空间 */
}
```

当用户拖拽分隔条时：
1. `updateSidebarWidth` 更新侧边栏宽度
2. React重新渲染，侧边栏宽度变化
3. Flex布局自动重新计算右侧主内容区宽度
4. 整个布局平滑过渡

## 修复的文件

- ✅ `src/components/Layout.tsx` - 对话视图布局
- ✅ `src/components/SetupView.tsx` - 设置视图布局

## 验证步骤

1. **刷新页面**（确保加载最新代码）
2. **PC端测试**（窗口≥1024px）：
   - [ ] 左侧侧边栏默认宽度为320px
   - [ ] 右侧主内容区占据剩余空间
   - [ ] 分隔条可见且可拖拽
   - [ ] 拖拽分隔条时，右侧主内容区宽度实时变化
   - [ ] 刷新页面后宽度设置保持
3. **移动端测试**（窗口<1024px）：
   - [ ] 侧边栏默认隐藏
   - [ ] 使用汉堡菜单可正常切换侧边栏
   - [ ] 主内容区全宽显示

## 预期效果

**修复前**：
- PC端侧边栏不可见（宽度为0）
- 分隔条无法交互
- 右侧主内容区宽度固定

**修复后**：
- ✅ PC端侧边栏默认可见（320px宽）
- ✅ 分隔条清晰可见，可拖拽交互
- ✅ 右侧主内容区宽度自动跟随分隔条拖动而变化
- ✅ 宽度设置持久化保存
- ✅ 响应式行为正确

## 性能优化

- 使用CSS Flexbox而非JavaScript计算宽度
- 宽度变化通过React状态管理，自动触发重渲染
- 无需手动计算右侧区域宽度
- 硬件加速的CSS变换动画

---

**总结**：通过设置PC端侧边栏默认宽度和优化Flex布局，实现了右侧主功能区宽度的动态跟随效果，提升了用户体验。

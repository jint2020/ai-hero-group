# 项目结构说明

## 目录结构

```
src/
├── components/              # 组件目录
│   ├── shared/             # 公共UI组件
│   │   ├── CharacterCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ActionButton.tsx
│   │   ├── ScrollableContainer.tsx
│   │   ├── LoadingIndicator.tsx
│   │   └── index.ts
│   ├── conversation/       # 对话相关组件
│   │   ├── ConversationOverview.tsx
│   │   ├── MessageList.tsx
│   │   ├── ControlButtons.tsx
│   │   ├── EditModal.tsx
│   │   └── index.ts
│   ├── CharacterSelector.tsx
│   ├── ApiConfig.tsx
│   ├── ConversationView.tsx
│   ├── ControlPanel.tsx
│   ├── ErrorBoundary.tsx
│   └── index.ts           # 组件统一导出
│
├── hooks/                  # 自定义 Hooks
│   ├── useConversation.ts
│   ├── useCharacter.ts
│   ├── useApi.ts
│   ├── useConversationController.ts
│   └── index.ts           # Hooks 统一导出
│
├── services/              # 服务层
│   ├── aiService.ts
│   ├── conversationService.ts
│   ├── storageService.ts
│   └── index.ts           # Services 统一导出
│
├── types/                 # 类型定义
│   ├── index.ts
│   ├── apiProviders.ts
│   └── vite-env.d.ts
│
├── config/               # 配置文件
│   └── defaultConfig.ts
│
├── App.tsx              # 主应用组件
├── main.tsx            # 应用入口
└── App.css            # 样式文件
```

## 核心概念

### 1. 组件分层

**页面组件（Page Components）**
- 位于 `src/components/` 根目录
- 负责页面布局和路由
- 例：`ConversationView`, `ControlPanel`, `CharacterSelector`

**对话组件（Conversation Components）**
- 位于 `src/components/conversation/`
- 负责对话相关的特定功能
- 例：`ConversationOverview`, `MessageList`, `ControlButtons`

**共享组件（Shared Components）**
- 位于 `src/components/shared/`
- 可复用的通用UI组件
- 例：`CharacterCard`, `StatusBadge`, `ActionButton`

### 2. 状态管理

**自定义 Hooks**
- 位于 `src/hooks/`
- 封装状态逻辑和副作用
- 例：
  - `useConversation` - 对话状态
  - `useCharacter` - 角色状态
  - `useApi` - API 配置状态
  - `useConversationController` - 对话流程控制

**服务层（Services）**
- 位于 `src/services/`
- 封装业务逻辑和数据处理
- 例：
  - `aiService` - AI API 调用
  - `conversationService` - 对话业务逻辑
  - `storageService` - 本地存储

### 3. 数据流

```
UI 组件
    ↓ (调用)
自定义 Hooks
    ↓ (使用)
服务层 (Services)
    ↓ (操作)
外部 API / 本地存储
```

## 使用示例

### 导入组件

```typescript
// 从组件统一导出导入
import { ConversationView, ControlPanel, CharacterCard } from './components';

// 从对话组件导入
import { ConversationOverview, MessageList } from './components/conversation';

// 从共享组件导入
import { StatusBadge, ActionButton } from './components/shared';
```

### 导入 Hooks

```typescript
// 从 Hooks 统一导出导入
import { useConversation, useCharacter, useApi } from './hooks';

// 导入控制器
import { useConversationController } from './hooks';
```

### 导入 Services

```typescript
// 从 Services 统一导出导入
import { aiService, conversationService, storageService } from './services';
```

## 开发规范

### 1. 组件设计原则
- 单一职责：每个组件只负责一个功能
- 小而精：单个组件通常 < 200 行
- 纯组件：无副作用，props 输入，UI 输出
- 可复用：相似UI抽成 shared component

### 2. Hook 设计原则
- 状态封装：将相关状态封装在同一个 Hook 中
- 逻辑复用：将业务逻辑抽离为可复用的 Hook
- 职责清晰：每个 Hook 只管理一个领域的狀态

### 3. 服务层设计原则
- 业务封装：将业务逻辑封装在服务层
- 数据处理：负责数据获取、转换和存储
- 无副作用：pure functions，便于测试

## 优势

1. **模块化**：清晰的模块边界，易于维护
2. **可复用**：公共组件和 Hooks 可复用
3. **可测试**：逻辑与 UI 分离，易于单元测试
4. **可读性**：命名清晰，结构明确
5. **可扩展**：新功能可按模块添加

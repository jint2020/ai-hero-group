# 🗂️ 模块化 Store

新的 Zustand Store 架构，提供更好的可维护性、可测试性和性能。

## 📦 架构概览

```
src/stores/
├── uiStore.ts              # UI 状态管理
├── apiStore.ts             # API 配置管理
├── characterStore.ts       # 角色数据管理
├── conversationStore.ts    # 对话流程管理
├── useAppStore.ts          # 组合 Store（向后兼容）
└── index.ts                # 统一导出
```

## 🚀 快速开始

### 方式 1：向后兼容（推荐用于现有代码）

```typescript
import { useAppStore } from '@/stores/useAppStore';

function MyComponent() {
  const { characters, addCharacter, startConversation } = useAppStore();
  // 使用方式完全不变 ✅
}
```

### 方式 2：独立 Store（推荐用于新代码）

```typescript
import { useCharacterStore } from '@/stores';

function MyComponent() {
  const { characters, addCharacter } = useCharacterStore();
}
```

### 方式 3：选择性订阅（最佳性能）

```typescript
import { useCharacterStore } from '@/stores';

function MyComponent() {
  // 只订阅需要的状态，减少重渲染
  const characters = useCharacterStore((state) => state.characters);
  const addCharacter = useCharacterStore((state) => state.addCharacter);
}
```

## 📚 详细文档

- **[迁移指南](STORES_MIGRATION_GUIDE.md)** - 详细使用说明和最佳实践
- **[完整计划](../REFACTOR_PLAN.md)** - 项目重构整体规划
- **[完成总结](../TASK_COMPLETION_SUMMARY.md)** - 任务完成报告

## 🏪 Store 详情

### UI Store
管理界面相关状态。

```typescript
interface UIState {
  currentView: 'setup' | 'conversation';
  setupView: 'api' | 'characters';
  error: string | null;
  isLoading: boolean;
  isProcessing: boolean;
}
```

### API Store
管理 API 配置和密钥。

```typescript
interface APIState {
  apiKeys: Record<string, string>;
  defaultModels: Record<string, string>;
  dynamicModels: Record<string, string[]>;
  isFetchingModels: Record<string, boolean>;
  modelFetchError: Record<string, string | null>;
}
```

### Character Store
管理角色数据和操作。

```typescript
interface CharacterState {
  characters: AICharacter[];
  addCharacter: (...) => Promise<void>;
  removeCharacter: (id: string) => void;
  // ... 更多方法
}
```

### Conversation Store
管理对话流程和历史。

```typescript
interface ConversationState {
  currentConversation: Conversation | null;
  allConversations: Conversation[];
  startConversation: (topic: string) => Promise<void>;
  processNextTurn: (conversation: Conversation) => Promise<void>;
  // ... 更多方法
}
```

## 🧪 测试

运行验证脚本：

```bash
node src/stores/verifyStores.ts
```

查看单元测试示例：

```
src/stores/__tests__/useAppStore.test.ts
```

## ⚡ 性能优化

### 1. 选择性订阅
```typescript
// ❌ 错误：订阅整个 Store
const all = useAppStore();

// ✅ 正确：只订阅需要的状态
const currentView = useUIStore((state) => state.currentView);
```

### 2. 使用独立 Store
```typescript
// 对于只使用角色的组件
const { characters } = useCharacterStore();

// 而不是
const { characters, currentView, error } = useAppStore();
```

### 3. 函数记忆化
```typescript
const handleAdd = useCallback(async (config) => {
  await addCharacter(config);
}, [addCharacter]);
```

## 🔧 开发工具

### Redux DevTools
所有 Store 已集成 Redux DevTools，可在浏览器扩展中查看状态变化。

### TypeScript
完整的类型定义，支持：
- 状态类型检查
- 操作参数验证
- 自动补全

### 持久化
以下状态自动持久化到 localStorage：
- `apiKeys`
- `characters`
- `defaultModels`
- `dynamicModels`

## 📖 使用示例

查看完整示例：

```
src/examples/StoreUsageExample.tsx
```

包含：
- 基础用法
- 性能优化技巧
- 自定义 Hook
- 复杂场景

## 🤝 贡献

### 报告问题
如有问题，请：
1. 查看相关文档
2. 搜索现有 Issue
3. 提交新 Issue 附复现步骤

### 提交改进
欢迎提交：
- Bug 修复
- 性能优化
- 文档改进
- 新功能

## 📄 许可证

MIT

## 🙏 致谢

- [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理
- [React](https://react.dev/) - 用户界面库
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

---

**Happy Coding! 🎉**

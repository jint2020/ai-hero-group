# 🗂️ Store 拆分迁移指南

## 📋 概述

本指南说明如何从旧的单一 `useAppStore` 迁移到新的模块化 Store 架构。

## 🏗️ 新的 Store 架构

### 目录结构
```
src/stores/
├── uiStore.ts              # UI 状态管理
├── apiStore.ts             # API 配置管理
├── characterStore.ts       # 角色管理
├── conversationStore.ts    # 对话管理
├── useAppStore.ts          # 组合 Store（保持向后兼容）
└── index.ts                # 统一导出
```

### Store 分层说明

#### 1. UI Store (`uiStore.ts`)
管理所有与用户界面相关的状态：
```typescript
interface UIState {
  currentView: 'setup' | 'conversation';
  setupView: 'api' | 'characters';
  error: string | null;
  isLoading: boolean;
  isProcessing: boolean;
}
```

#### 2. API Store (`apiStore.ts`)
管理 API 配置相关状态：
```typescript
interface APIState {
  apiKeys: Record<string, string>;
  defaultModels: Record<string, string>;
  dynamicModels: Record<string, string[]>;
  isFetchingModels: Record<string, boolean>;
  modelFetchError: Record<string, string | null>;
}
```

#### 3. Character Store (`characterStore.ts`)
管理角色相关状态：
```typescript
interface CharacterState {
  characters: AICharacter[];
  // 角色操作方法
}
```

#### 4. Conversation Store (`conversationStore.ts`)
管理对话相关状态：
```typescript
interface ConversationState {
  currentConversation: Conversation | null;
  allConversations: Conversation[];
  // 对话操作方法
}
```

## 🔄 迁移方式

### 方式 1：继续使用 useAppStore（推荐用于渐进式迁移）

新的 `useAppStore` 保持与旧版相同的 API，完全向后兼容：

```typescript
// ✅ 推荐：保持现有代码不变
import { useAppStore } from '@/stores/useAppStore';

function MyComponent() {
  const {
    currentView,           // UI状态
    characters,            // 角色状态
    apiKeys,               // API状态
    currentConversation,   // 对话状态
    setCurrentView,        // UI方法
    addCharacter,          // 角色方法
    startConversation,     // 对话方法
  } = useAppStore();

  // 使用方式完全不变
  return <div>{/* ... */}</div>;
}
```

### 方式 2：使用独立的 Store（推荐用于新代码）

对于新组件，可以直接使用独立的 Store：

```typescript
import { useUIStore } from '@/stores/uiStore';
import { useCharacterStore } from '@/stores/characterStore';

function MyComponent() {
  // 只使用需要的 Store，避免不必要的重新渲染
  const currentView = useUIStore((state) => state.currentView);
  const characters = useCharacterStore((state) => state.characters);

  return <div>{/* ... */}</div>;
}
```

## 📝 使用示例

### 示例 1：API 配置组件
```typescript
import { useAPIStore } from '@/stores/apiStore';

function ApiConfig() {
  const { apiKeys, defaultModels, setApiKeys, setDefaultModel } = useAPIStore();

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys({ ...apiKeys, [provider]: value });
  };

  return <div>{/* ... */}</div>;
}
```

### 示例 2：角色选择组件
```typescript
import { useCharacterStore } from '@/stores/characterStore';

function CharacterSelector() {
  const { characters, addCharacter, removeCharacter } = useCharacterStore();

  return (
    <div>
      {characters.map(char => (
        <CharacterCard
          key={char.id}
          character={char}
          onRemove={() => removeCharacter(char.id)}
        />
      ))}
    </div>
  );
}
```

### 示例 3：对话控制组件
```typescript
import { useConversationStore } from '@/stores/conversationStore';
import { useCharacterStore } from '@/stores/characterStore';

function ConversationControls() {
  const { currentConversation, toggleConversation } = useConversationStore();
  const { characters } = useCharacterStore();

  const handleStart = async (topic: string) => {
    try {
      await startConversation(topic, characters);
    } catch (error) {
      console.error(error);
    }
  };

  return <div>{/* ... */}</div>;
}
```

## 🔍 Store 间通信

在某些场景下，一个 Store 可能需要访问另一个 Store 的状态。以下是最佳实践：

### 方法 1：通过组件参数传递
```typescript
// 在组件中组合多个 Store
function MyComponent() {
  const { currentView } = useUIStore();
  const { characters } = useCharacterStore();

  // 将状态作为 props 传递给子组件
  return <ChildComponent view={currentView} characters={characters} />;
}
```

### 方法 2：使用 Store Action 的组合
```typescript
// 在 startConversation 中访问其他 Store
const startConversation = async (topic: string) => {
  const characters = useCharacterStore.getState().characters;

  if (characters.length === 0) {
    throw new Error('请先选择角色');
  }

  // ... 其余逻辑
};
```

## 📊 性能优化

### 1. 选择性订阅
只订阅需要的状态，避免不必要的重新渲染：

```typescript
// ❌ 错误：订阅整个 Store
const allState = useAppStore();

// ✅ 正确：只订阅需要的状态
const currentView = useAppStore((state) => state.currentView);
const characters = useAppStore((state) => state.characters);
```

### 2. 使用独立 Store
对于复杂的页面，使用独立的 Store 可以减少重渲染：

```typescript
// 复杂页面使用多个独立 Store
function ComplexPage() {
  const uiState = useUIStore((state) => ({
    currentView: state.currentView,
    error: state.error,
  }));

  const charState = useCharacterStore((state) => ({
    characters: state.characters,
    addCharacter: state.addCharacter,
  }));

  return <div>{/* ... */}</div>;
}
```

## 🧪 测试 Store

### 测试单个 Store
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCharacterStore } from '@/stores/characterStore';

describe('useCharacterStore', () => {
  it('should add character', async () => {
    const { result } = renderHook(() => useCharacterStore());

    await act(async () => {
      await result.current.addCharacter(0, 'siliconflow', 'qwen', 'test-key');
    });

    expect(result.current.characters).toHaveLength(1);
  });
});
```

### 测试 Store 组合
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/stores/useAppStore';

describe('useAppStore', () => {
  it('should start conversation', async () => {
    const { result } = renderHook(() => useAppStore());

    await act(async () => {
      await result.current.addCharacter(0, 'siliconflow', 'qwen', 'test-key');
      await result.current.startConversation('测试话题');
    });

    expect(result.current.currentView).toBe('conversation');
    expect(result.current.currentConversation).toBeDefined();
  });
});
```

## ⚠️ 注意事项

### 1. 状态持久化
只有 `apiStore` 和 `characterStore` 的状态会被持久化：
```typescript
// 在 useAppStore.ts 中配置
partialize: (state) => ({
  apiKeys: state.apiKeys,
  characters: state.characters,
  defaultModels: state.defaultModels,
  dynamicModels: state.dynamicModels,
})
```

### 2. DevTools
所有 Store 都已集成 Redux DevTools：
```typescript
// 在浏览器中打开 Redux DevTools 扩展查看状态变化
```

### 3. 类型安全
所有状态和操作都是类型安全的，TypeScript 会检查：
- ✅ 状态类型
- ✅ 操作参数
- ✅ 返回值

### 4. 向后兼容
新的 `useAppStore` 与旧版完全兼容，现有代码无需修改。

## 🎯 最佳实践

### 1. 组件级别
```typescript
// ✅ 推荐：使用解构获取多个相关状态
const { currentView, setupView, error } = useUIStore();

// ✅ 推荐：使用函数式更新避免闭包问题
set((state) => ({ ...state, value: newValue }));
```

### 2. Store 级别
```typescript
// ✅ 推荐：使用 devtools 进行调试
export const createUIStore = devtools(createUIStore);

// ✅ 推荐：使用 persist 保存必要状态
export const createAPIStore = persist(createAPIStore, {
  name: 'api-storage',
  partialize: (state) => ({ apiKeys: state.apiKeys }),
});
```

### 3. 错误处理
```typescript
// ✅ 推荐：在 Store 中进行错误处理
try {
  await addCharacter(...);
} catch (error) {
  set({ error: error.message });
}
```

## 🚀 后续计划

### 阶段 1：当前已完成 ✅
- [x] 拆分 Store 为 4 个模块
- [x] 保持向后兼容性
- [x] 配置持久化
- [x] 配置 DevTools

### 阶段 2：即将进行
- [ ] 添加单元测试
- [ ] 添加 Store 间订阅机制
- [ ] 添加中间件（如 immer）

### 阶段 3：长期规划
- [ ] 引入插件架构
- [ ] 支持状态快照和时间旅行
- [ ] 添加状态可视化工具

## 📚 参考资料

- [Zustand 官方文档](https://github.com/pmndrs/zustand)
- [状态管理最佳实践](https://react.dev/learn/managing-state)
- [TypeScript 高级类型](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

## 🤝 贡献

如果在使用过程中遇到问题或有改进建议，请：
1. 提交 Issue 描述问题
2. 查看现有 Issue 是否已有解决方案
3. 提交 PR 贡献代码

---

**迁移完成后，您的应用将拥有更清晰的架构、更易于维护的代码和更好的开发体验！** 🎉

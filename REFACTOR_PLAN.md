# 🚀 项目重构改进计划

## 📊 项目当前状态

### 总体评分
- **易于协作**: 7.5/10
- **长期演进**: 8/10
- **健壮性**: 7/10
- **综合评分**: 7.5/10

### 核心问题分析

#### 1. 高优先级问题 🔴

##### 问题 1: Store 过大难以维护
**现状分析** (`src/store/useAppStore.ts:1`)
- 文件大小: 700+ 行
- 状态类型: 混合 UI状态 + 业务状态 + 数据状态
- Action 方法: 40+ 个
- 问题: 难以追踪状态变化，新人难以理解

##### 问题 2: 组件过大职责不单一
**现状分析** (`src/components/ApiConfig.tsx:1`)
- 文件大小: 644 行
- 职责数量: UI渲染 + 状态管理 + API调用 + 表单处理
- 状态管理: 8+ 个 useState
- 问题: 违反单一职责原则，难以测试和复用

##### 问题 3: 错误处理不统一
**现状分析**
- 部分使用 `alert()`: `ApiConfig.tsx:82, 144, 153, 570`
- 部分依赖全局状态: `useAppStore.ts`
- 部分自行处理: 组件内部 try-catch
- 问题: 用户体验不一致，难以追踪错误源

##### 问题 4: 缺少测试覆盖
**现状分析**
- 测试文件: 0 个
- 测试覆盖率: 0%
- 问题: 重构风险高，质量无保障

#### 2. 中优先级问题 🟡

##### 问题 5: TypeScript 配置不够严格
**现状分析** (`tsconfig.json`)
```json
{
  "strict": false,  // 未开启严格模式
  "noUnusedLocals": false,
  "noUnusedParameters": false
}
```

##### 问题 6: 样式系统缺乏统一规范
**现状分析** (`src/index.css`)
- 文件大小: 500+ 行
- 缺少设计 token
- 缺少 Design System 文档

##### 问题 7: 性能优化空间
- 大组件未使用 `React.memo`
- 缺少虚拟滚动 (大列表)
- 图片和资源未优化

#### 3. 低优先级问题 🟢

##### 问题 8: 开发体验待提升
- 无 Storybook 文档
- 无 Git Hooks
- 无热重载增强

##### 问题 9: 可访问性支持不足
- 缺少 a11y 测试
- 组件文档未标注 ARIA 属性

---

## 🎯 改进路线图

### 第一阶段: 架构重构（Week 1-2）
**目标**: 解决核心架构问题，为后续改进打基础

### 第二阶段: 代码质量提升（Week 3-4）
**目标**: 提升代码健壮性和可维护性

### 第三阶段: 开发体验优化（Week 5-6）
**目标**: 提升团队协作效率

### 第四阶段: 长期演进准备（Week 7-8）
**目标**: 建立可持续演进的基础

---

## 📋 详细实施计划

## 第一阶段: 架构重构（Week 1-2）

### 第 1 天: Store 模块化拆分

#### 任务 1.1: 拆分 Zustand Store
**目标**: 将单一 Store 拆分为多个模块化 Store

**实施步骤**:
```typescript
// 1. 创建多个小 Store
src/stores/
├── uiStore.ts          // UI状态: currentView, setupView, sidebarWidth
├── apiStore.ts         // API相关: apiKeys, providers, defaultModels
├── characterStore.ts   // 角色管理: characters, selectedCharacters
└── conversationStore.ts // 对话管理: conversations, currentConversation

// 2. 使用 Zustand slice 模式
const createUIStore = create<UIState>((set) => ({
  // ... implementation
}))

const createAPIStore = create<APIState>((set, get) => ({
  // ... implementation
}))

// 3. 组合 Store
export const useAppStore = () => ({
  ...createUIStore(),
  ...createAPIStore(),
})
```

**验收标准**:
- ✅ 原 Store 文件拆分为 4 个独立文件
- ✅ 每个 Store < 200 行
- ✅ 功能测试通过
- ✅ 类型检查通过

**影响范围**:
- 所有使用 `useAppStore` 的组件需要更新导入
- 状态持久化配置需要调整

---

### 第 2-3 天: 组件拆分 - ApiConfig

#### 任务 2.1: 拆分 ApiConfig 组件
**目标**: 将 644 行的 ApiConfig 拆分为多个职责单一的组件

**拆分策略**:
```
ApiConfig/
├── index.tsx              // 主组件，协调子组件
├── ApiKeyInput.tsx        // API密钥输入框
├── ModelSelector.tsx      // 模型选择器
├── ConnectionTest.tsx     // 连接测试功能
├── ProviderCard.tsx       // 提供商卡片
└── CustomProviderForm.tsx // 自定义API表单
```

**实施步骤**:
```typescript
// 1. 创建子组件
// src/components/ApiConfig/ApiKeyInput.tsx
interface ApiKeyInputProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
  showKey: boolean;
  onToggleShow: () => void;
}

// 2. 创建自定义 Hook 提取逻辑
// src/hooks/useApiConfig.ts
export const useApiConfig = (provider: string) => {
  // 提取模型获取、连接测试等逻辑
  const [keys, setKeys] = useState({});
  const testConnection = async () => { /* ... */ };
  return { keys, setKeys, testConnection };
}

// 3. 重构主组件
// src/components/ApiConfig/index.tsx
const ApiConfig: React.FC = () => {
  return (
    <div>
      {providers.map(provider => (
        <ProviderCard key={provider.id}>
          <ApiKeyInput ... />
          <ModelSelector ... />
          <ConnectionTest ... />
        </ProviderCard>
      ))}
    </div>
  )
}
```

**验收标准**:
- ✅ 主组件 < 150 行
- ✅ 子组件每个 < 100 行
- ✅ 自定义 Hook 提取状态逻辑
- ✅ 功能保持一致

---

#### 任务 2.2: 统一错误处理方案

**目标**: 建立统一的错误处理和提示机制

**实施步骤**:
```typescript
// 1. 创建错误类型定义
// src/types/error.ts
export enum ErrorCode {
  API_KEY_INVALID = 'API_KEY_INVALID',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  MODEL_FETCH_FAILED = 'MODEL_FETCH_FAILED',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

// 2. 创建错误处理 Hook
// src/hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const showError = (error: AppError) => {
    // 统一错误提示逻辑
    toast.error(error.message)
  }

  return { showError }
}

// 3. 替换所有 alert()
# 批量搜索替换
alert() → useErrorHandler().showError()
```

**验收标准**:
- ✅ 所有 `alert()` 替换为统一错误处理
- ✅ 错误类型定义完整
- ✅ 错误提示使用 Toast 组件
- ✅ 错误日志记录到控制台

---

### 第 4-5 天: 其他大组件拆分

#### 任务 3.1: 拆分 SetupView 组件
**现状**: SetupView 包含过多逻辑

**拆分策略**:
```
SetupView/
├── index.tsx              // 主布局组件
├── SetupProgress.tsx      // 步骤指示器
├── ApiConfigSection.tsx   // API配置区域
└── CharacterSelection.tsx // 角色选择区域
```

#### 任务 3.2: 拆分 Sidebar 组件
**现状**: 多个版本的 Sidebar 逻辑重复

**拆分策略**:
```
Sidebar/
├── index.tsx              // 主组件
├── SidebarHeader.tsx      // 头部
├── SidebarContent.tsx     // 内容区
└── SidebarFooter.tsx      // 底部
```

**验收标准**:
- ✅ 所有组件 < 200 行
- ✅ 逻辑职责单一
- ✅ 可复用性提升

---

### 第 6-7 天: 测试框架搭建

#### 任务 4.1: 引入测试工具
**目标**: 建立测试基础设施

**实施步骤**:
```bash
# 1. 安装测试依赖
pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# 2. 配置 Jest
# jest.config.ts
export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
  },
}

# 3. 创建测试工具
# jest.setup.ts
import '@testing-library/jest-dom'
```

**验收标准**:
- ✅ 测试配置完成
- ✅ 可以运行 `pnpm test`

#### 任务 4.2: 编写核心组件测试
**目标**: 为拆分的组件编写单元测试

**测试范围**:
- ✅ ApiConfig 组件测试
- ✅ Store 测试（每个 Store 的 action 和状态）
- ✅ 工具函数测试（services）

**示例测试**:
```typescript
// src/components/ApiConfig/__tests__/ApiKeyInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ApiKeyInput } from '../ApiKeyInput'

describe('ApiKeyInput', () => {
  it('should call onChange when input changes', () => {
    const onChange = jest.fn()
    render(<ApiKeyInput ... onChange={onChange} />)

    fireEvent.change(screen.getByPlaceholderText(/api密钥/i), {
      target: { value: 'test-key' }
    })

    expect(onChange).toHaveBeenCalledWith('test-key')
  })
})
```

**验收标准**:
- ✅ 核心组件测试覆盖率 > 60%
- ✅ 所有测试通过

---

## 第二阶段: 代码质量提升（Week 3-4）

### 第 8-9 天: TypeScript 严格模式

#### 任务 5.1: 开启 strict 模式
**目标**: 提升类型安全性

**实施步骤**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}

# 逐个文件修复类型错误
```

**验收标准**:
- ✅ 无类型错误
- ✅ 所有 `any` 类型替换为具体类型

---

### 第 10-11 天: 设计 Token 系统

#### 任务 6.1: 建立设计系统
**目标**: 统一样式管理，支持主题切换

**实施步骤**:
```css
/* src/styles/tokens/colors.css */
:root {
  /* 主色调 */
  --color-primary: 43 93 58;
  --color-secondary: 74 144 226;

  /* 霓虹色系 */
  --color-neon-cyan: 0 255 255;
  --color-neon-pink: 255 0 128;
  --color-neon-green: 57 255 20;
}

/* src/styles/tokens/spacing.css */
:root {
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
}

/* src/styles/tokens/typography.css */
:root {
  --font-family-mono: 'SF Mono', monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
}
```

**验收标准**:
- ✅ 样式文件拆分完成
- ✅ 使用 CSS 变量替代硬编码
- ✅ 支持主题切换

---

### 第 12-14 天: 性能优化

#### 任务 7.1: React.memo 和 useMemo
**目标**: 优化渲染性能

**实施步骤**:
```typescript
// 1. 为大组件添加 memo
const ApiConfig = React.memo<ApiConfigProps>(({ apiKeys, onApiKeysChange }) => {
  // ...
})

// 2. 使用 useMemo 缓存计算
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data)
}, [data])

// 3. 使用 useCallback 缓存函数
const handleSubmit = useCallback((data: FormData) => {
  // handle submit
}, [])
```

**验收标准**:
- ✅ 所有大组件使用 React.memo
- ✅ 性能测试通过

#### 任务 7.2: 虚拟滚动
**目标**: 优化长列表性能

**实施步骤**:
```bash
# 安装 react-window
pnpm add react-window react-window-infinite-loader
```

**验收标准**:
- ✅ 虚拟滚动用于模型列表 (>50 items)
- ✅ 滚动性能提升

---

## 第三阶段: 开发体验优化（Week 5-6）

### 第 15-17 天: Storybook 文档

#### 任务 8.1: 搭建 Storybook
**目标**: 建立组件文档系统

**实施步骤**:
```bash
# 1. 安装 Storybook
pnpm add -D @storybook/react @storybook/vite

# 2. 初始化 Storybook
npx storybook@latest init

# 3. 为每个组件创建 Story
// src/components/ApiConfig/ApiKeyInput.stories.tsx
export default {
  title: 'Components/ApiConfig/ApiKeyInput',
  component: ApiKeyInput,
}

export const Default = () => <ApiKeyInput ... />
export const WithValue = () => <ApiKeyInput value="test" ... />
```

**验收标准**:
- ✅ 核心组件都有 Story 文件
- ✅ 可以在 Storybook 中预览组件
- ✅ 组件 API 文档完整

---

### 第 18-21 天: Git Hooks 和 CI/CD

#### 任务 9.1: 引入 Husky
**目标**: 代码质量检查自动化

**实施步骤**:
```bash
# 1. 安装 Husky
pnpm add -D husky

# 2. 初始化 Husky
npx husky install

# 3. 添加 Git Hooks
npx husky add .husky/pre-commit "pnpm lint-staged"
npx husky add .husky/commit-msg "pnpm commitlint"

# 4. 配置 lint-staged
// package.json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix", "jest --bail"],
    "src/**/*.{css,scss}": "stylelint --fix"
  }
}
```

**验收标准**:
- ✅ 提交前自动 lint 和测试
- ✅ 提交信息格式检查

#### 任务 9.2: GitHub Actions CI
**目标**: 自动化构建和测试

**实施步骤**:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

**验收标准**:
- ✅ CI 自动运行 lint/test/build
- ✅ PR 自动检查

---

## 第四阶段: 长期演进准备（Week 7-8）

### 第 22-24 天: 国际化支持

#### 任务 10.1: 引入 react-i18next
**目标**: 为未来国际化做准备

**实施步骤**:
```bash
pnpm add react-i18next i18next i18next-browser-languagedetector
```

**验收标准**:
- ✅ 所有文本抽取为 i18n key
- ✅ 支持中英文切换
- ✅ 为添加更多语言预留扩展点

---

### 第 25-28 天: 插件架构设计

#### 任务 11.1: 设计插件系统
**目标**: 支持功能扩展

**实施步骤**:
```typescript
// src/plugins/types.ts
interface Plugin {
  id: string;
  name: string;
  version: string;
  init: (context: PluginContext) => void;
  destroy?: () => void;
}

interface PluginContext {
  registerComponent: (name: string, component: React.ComponentType) => void;
  registerService: (name: string, service: any) => void;
  getState: <T>(store: string) => T;
}

// src/plugins/PluginManager.tsx
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  registerPlugin(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
  }

  initializePlugins() {
    this.plugins.forEach(plugin => {
      plugin.init(this.context);
    });
  }
}
```

**验收标准**:
- ✅ 插件接口定义完整
- ✅ 核心插件加载机制
- ✅ 文档和示例

---

## 📊 验收检查清单

### 第一阶段验收
- [ ] Store 拆分为 4 个模块
- [ ] ApiConfig 组件拆分为 5+ 个子组件
- [ ] 所有 `alert()` 替换为统一错误处理
- [ ] 核心组件测试覆盖率 > 60%
- [ ] TypeScript 严格模式开启

### 第二阶段验收
- [ ] 无类型错误
- [ ] 设计 Token 系统完整
- [ ] 样式文件拆分
- [ ] React.memo 应用于所有大组件
- [ ] 虚拟滚动用于长列表

### 第三阶段验收
- [ ] Storybook 文档完整
- [ ] 所有组件有 Story
- [ ] Husky hooks 配置完成
- [ ] GitHub Actions CI 运行正常

### 第四阶段验收
- [ ] 国际化支持完整
- [ ] 插件架构设计文档
- [ ] 示例插件可运行

---

## 🎯 成功指标

### 量化指标
- **代码行数**: 单个文件 < 200 行
- **测试覆盖率**: > 70%
- **TypeScript 严格模式**: 0 错误
- **构建时间**: < 60 秒
- **Bundle 大小**: < 500KB (gzipped)

### 质量指标
- **代码审查时间**: 减少 50%
- **新成员上手时间**: 从 2 天降至 0.5 天
- **Bug 数量**: 减少 40%
- **功能开发速度**: 提升 30%

---

## ⚠️ 风险与应对

### 风险 1: 拆分 Store 导致状态同步问题
**应对方案**:
- 使用 Zustand middleware 管理状态依赖
- 建立状态变化追踪机制
- 编写集成测试确保状态一致

### 风险 2: 组件拆分破坏现有功能
**应对方案**:
- 逐步拆分，每步都进行功能测试
- 保持 API 兼容性
- 建立快照测试

### 风险 3: 测试编写耗时过长
**应对方案**:
- 优先编写核心逻辑测试
- 使用测试驱动开发 (TDD)
- 利用 GitHub Copilot 等工具辅助

### 风险 4: 团队成员需要时间适应
**应对方案**:
- 组织内部技术分享
- 编写迁移指南
- 一对一辅导

---

## 💡 额外建议

### 工具推荐
1. **代码审查**: 使用 GitHub CODEOWNERS
2. **性能监控**: 集成 Web Vitals
3. **错误追踪**: 集成 Sentry
4. **文档生成**: 使用 TypeDoc

### 未来规划
1. **微前端架构**: 支持多团队协作
2. **SSR/SSG**: 提升 SEO 和首屏性能
3. **移动端 App**: 使用 React Native
4. **桌面端**: 使用 Electron

---

## 📚 参考资源

- [React 最佳实践](https://react.dev/learn)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Storybook 指南](https://storybook.js.org/docs/react/get-started/introduction)
- [TypeScript 严格模式](https://typescript-eslint.io/rules/)

---

## 📅 时间线总览

```
Week 1-2: 架构重构
  ├─ Day 1: Store 拆分
  ├─ Day 2-3: ApiConfig 拆分
  ├─ Day 4-5: 其他组件拆分
  └─ Day 6-7: 测试框架搭建

Week 3-4: 代码质量提升
  ├─ Day 8-9: TypeScript 严格模式
  ├─ Day 10-11: 设计 Token 系统
  └─ Day 12-14: 性能优化

Week 5-6: 开发体验优化
  ├─ Day 15-17: Storybook 文档
  └─ Day 18-21: Git Hooks 和 CI/CD

Week 7-8: 长期演进准备
  ├─ Day 22-24: 国际化支持
  └─ Day 25-28: 插件架构设计
```

---

## 🎉 预期成果

完成改进后，预期项目将达到：

- **易于协作**: 9/10 (清晰的架构 + 完善的文档)
- **长期演进**: 9/10 (可扩展的插件架构 + 现代化技术栈)
- **健壮性**: 9/0 (严格的类型检查 + 全面的测试)
- **综合评分**: **9/10** (生产级别的项目质量)

---

## 🤝 团队协作建议

### Code Review 规范
1. 所有 PR 必须经过至少 2 人审查
2. 审查重点: 架构设计、性能、可测试性
3. 使用自动化工具检查: ESLint, Prettier, TypeScript

### 提交规范
```
feat: 新功能
fix: 修复
refactor: 重构
docs: 文档更新
test: 测试相关
chore: 构建/工具相关
```

### 沟通机制
- 每日站会同步进度
- 周五技术分享会
- 建立技术文档 Wiki

---

**准备好开始了吗？让我们一起打造一个世界级的 React 应用！** 🚀

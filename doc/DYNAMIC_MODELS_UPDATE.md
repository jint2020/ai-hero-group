# 动态模型获取功能更新

## 更新概述

本次更新为 AI Conference 系统添加了动态获取模型列表的功能，用户现在可以从 SiliconFlow 和 OpenRouter API 获取最新的可用模型，并设置默认模型。

## 🆕 新增功能

### 1. 智能模型测试

**功能描述**:
- 测试连接时使用用户选择的默认模型，而不是硬编码的第一个模型
- 确保测试的模型确实是用户想要使用的
- 防止因默认模型列表的第一个模型不可用而导致的测试失败

**文件位置**: `src/components/ApiConfig.tsx`

**实现**:
```typescript
// 使用用户设置的默认模型进行测试
const testModel = defaultModels[provider];
if (!testModel) {
  alert('请先选择默认模型');
  return;
}
```

### 2. SiliconFlow 动态模型获取

**功能描述**:
- 用户输入 API 密钥后，可以点击 🔄 按钮从 SiliconFlow API 获取最新的模型列表
- 自动过滤掉不可用的模型（如 omni 系列）
- 支持缓存机制，避免重复请求

**使用场景**:
- 首次配置时获取最新模型列表
- 定期刷新模型列表以获取新增模型
- 查看当前可用的所有模型

### 3. OpenRouter 动态模型获取

**功能描述**:
- 用户输入 API 密钥后，可以点击 🔄 按钮从 OpenRouter API 获取最新的模型列表
- 自动过滤非活跃模型（只保留有上下文长度和价格信息的模型）
- 支持缓存机制，避免重复请求

**API 端点**: `https://openrouter.ai/api/v1/models`

**过滤条件**:
- 模型必须有上下文长度信息 (`context_length`)
- 模型必须有定价信息 (`pricing`)
- 定价信息中的提示价格不能为 null (`pricing.prompt !== null`)

**使用场景**:
- 首次配置时获取最新模型列表
- 定期刷新模型列表以获取新增模型
- 查看当前 OpenRouter 支持的所有可用模型

### 4. 模型缓存系统

**缓存策略**:
- 缓存时间: 24 小时
- 自动过期检查
- 支持手动清除缓存

**文件位置**: `src/services/storageService.ts`

**新增方法**:
```typescript
getCachedModels(provider: string)  // 获取缓存的模型列表
cacheModels(provider, models)       // 缓存模型列表
clearModelCache(provider?)          // 清除缓存
```

### 5. 默认模型管理

**功能描述**:
- 用户可以为每个 API 供应商设置默认模型
- 默认模型会优先显示在选择器中
- 设置后下次使用会自动应用

**默认模型设置**:
```typescript
siliconflow: 'deepseek-chat'
openrouter: 'openai/gpt-4o-mini'
deepseek: 'deepseek-chat'
```

**文件位置**: `src/services/storageService.ts`

**新增方法**:
```typescript
getDefaultModel(provider)  // 获取默认模型
saveDefaultModel(provider, model)  // 保存默认模型
loadDefaultModel(provider)  // 加载默认模型
```

### 6. 增强的 API 配置界面

**UI 改进**:
- 新增默认模型下拉选择器
- 实时显示已设置的默认模型
- SiliconFlow 按钮显示 🔄（可动态获取）
- 其他供应商显示 📋（使用默认列表）

**新增状态管理**:
```typescript
dynamicModels      // 动态获取的模型列表
isFetchingModels   // 是否正在获取模型
modelFetchError    // 获取模型时的错误信息
defaultModels      // 默认模型配置
```

## 📁 文件修改记录

### 1. `src/services/aiService.ts`

**新增方法**:
```typescript
// 动态获取 SiliconFlow 模型列表
async fetchSiliconFlowModels(apiKey: string): Promise<string[]>

// 动态获取 OpenRouter 模型列表
async fetchOpenRouterModels(apiKey: string): Promise<string[]>
```

**功能**:
- SiliconFlow: 调用 models API: `GET https://api.siliconflow.cn/v1/models`
- OpenRouter: 调用 models API: `GET https://openrouter.ai/api/v1/models`
- 使用 Bearer Token 认证
- 过滤和排序模型列表
- 错误处理和降级策略

### 2. `src/services/storageService.ts`

**新增功能**:
- 模型缓存机制（Map + localStorage）
- 默认模型管理

**新增接口**:
```typescript
interface ModelCache {
  models: string[];
  lastFetched: number;
  provider: string;
}
```

**新增方法**:
- `getCachedModels(provider: string)`
- `cacheModels(provider: string, models: string[])`
- `clearModelCache(provider?: string)`
- `getDefaultModel(provider: string)`
- `saveDefaultModel(provider: string, model: string)`
- `loadDefaultModel(provider: string)`

### 3. `src/components/ApiConfig.tsx`

**新增状态**:
```typescript
const [dynamicModels, setDynamicModels] = useState<Record<string, string[]>>({});
const [isFetchingModels, setIsFetchingModels] = useState<Record<string, boolean>>({});
const [modelFetchError, setModelFetchError] = useState<Record<string, string | null>>({});
const [defaultModels, setDefaultModels] = useState<Record<string, string>>({});
```

**新增方法**:
```typescript
getModelList(provider: string)  // 获取模型列表（优先使用动态）
fetchModels(provider)           // 动态获取模型
handleSetDefaultModel(provider, model)  // 设置默认模型
```

**UI 改进**:
- 默认模型下拉选择器
- 模型获取按钮和加载状态
- 默认模型徽标（✓）
- 错误信息展示
- 提示信息

## 🔄 工作流程

### SiliconFlow / OpenRouter 用户流程

1. **输入 API 密钥**
   ```
   [输入框] API密钥  [👁️]
   ```

2. **点击 🔄 获取模型列表**
   ```
   [选择器] 默认模型 ▼  [🔄]
   ```
   - 检查缓存
   - 如果有缓存 → 使用缓存
   - 如果无缓存 → 调用 API

3. **选择默认模型**
   ```
   ✓ 已设置默认模型: deepseek-chat
   ```

4. **查看可用模型**
   ```
   可用模型 (18个)
   deepseek-chat ✓
   deepseek-coder
   Qwen/Qwen2.5-72B-Instruct
   ...
   ```

**支持的供应商**:
- ✅ SiliconFlow - 点击 🔄 从 API 获取
- ✅ OpenRouter - 点击 🔄 从 API 获取
- 📋 DeepSeek - 使用预定义列表

### DeepSeek 用户流程

1. **输入 API 密钥**
2. **选择默认模型（使用预定义列表）**
3. **查看可用模型（静态列表）**

## 🛡️ 错误处理

### 网络错误
- 显示错误信息
- 使用默认模型列表作为降级方案
- 记录错误日志

### API 密钥错误
- 获取密钥前检查是否为空
- 提示用户先输入密钥

### 缓存错误
- 自动清除过期缓存
- 回退到默认模型列表

## ⚙️ 配置选项

### 缓存设置
```typescript
private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时
```

### 默认模型设置
```typescript
const defaultModels = {
  siliconflow: 'deepseek-chat',
  openrouter: 'openai/gpt-4o-mini',
  deepseek: 'deepseek-chat',
  custom: ''
};
```

## 📊 性能优化

### 缓存策略
- 24 小时缓存有效期
- 减少 API 调用次数
- 提升用户体验

### 按需加载
- 只在用户点击时获取模型
- 避免不必要的网络请求

### 状态管理
- 局部状态更新
- 减少组件重新渲染

## 🔐 安全考虑

### API 密钥保护
- 使用 Bearer Token 认证
- 不在代码中硬编码密钥
- 支持环境变量配置

### 错误信息
- 不暴露敏感信息
- 提供有意义的错误提示
- 记录详细日志用于调试

## 🧪 测试建议

### SiliconFlow 测试
1. 输入有效的 SiliconFlow API 密钥
2. 点击 🔄 按钮
3. 验证模型列表加载成功
4. 设置默认模型
5. 检查缓存功能（刷新页面）

### OpenRouter 测试
1. 输入有效的 OpenRouter API 密钥
2. 点击 🔄 按钮
3. 验证模型列表加载成功（应该看到多个模型，包括 GPT-4、Claude、Llama 等）
4. 设置默认模型
5. 检查缓存功能（刷新页面）

**预期模型示例**:
```
可用模型 (200+个)
openai/gpt-4o ✓
anthropic/claude-3.5-sonnet
meta-llama/llama-3.1-70b-instruct
google/gemini-pro
...
```

### 错误场景测试
1. API 密钥为空时点击获取模型
2. 使用无效 API 密钥
3. 网络断开时获取模型

## 🚀 未来计划

### 扩展其他供应商
- [x] OpenRouter 动态模型获取 ✅ 已完成
- [ ] DeepSeek 动态模型获取
- [ ] Anthropic 模型获取

### 增强功能
- [ ] 模型搜索和过滤
- [ ] 模型性能对比
- [ ] 模型使用统计
- [ ] 模型收藏夹

### 优化体验
- [ ] 批量设置默认模型
- [ ] 模型列表自动刷新
- [ ] 智能推荐模型
- [ ] 多语言支持

## 📝 使用指南

### 首次设置 SiliconFlow

1. **获取 API 密钥**
   - 访问 https://cloud.siliconflow.cn/
   - 注册账号并获取 API 密钥

2. **配置密钥**
   ```
   [输入框] sk-your-api-key-here  [👁️]
   ```

3. **获取模型列表**
   ```
   [选择器] ▼  [🔄]
   ```

4. **选择默认模型**
   ```
   [下拉选择] deepseek-chat  ✓ 已设置
   ```

5. **验证配置**
   ```
   可用模型 (18个)
   deepseek-chat ✓
   ...
   ```

### 首次设置 OpenRouter

1. **获取 API 密钥**
   - 访问 https://openrouter.ai/
   - 注册账号并获取 API 密钥（格式: `sk-or-...`）

2. **配置密钥**
   ```
   [输入框] sk-or-your-api-key-here  [👁️]
   ```

3. **获取模型列表**
   ```
   [选择器] ▼  [🔄]
   ```
   - 系统会从 `https://openrouter.ai/api/v1/models` 获取最新模型
   - 自动过滤出活跃模型（200+ 个模型）

4. **选择默认模型**
   ```
   [下拉选择] openai/gpt-4o-mini  ✓ 已设置
   ```

5. **验证配置**
   ```
   可用模型 (200+个)
   openai/gpt-4o ✓
   anthropic/claude-3.5-sonnet
   meta-llama/llama-3.1-70b-instruct
   ...
   ```

### 后续使用

1. 打开设置页面，查看已配置的默认模型
2. 如果需要更新模型列表，点击 🔄 按钮
3. 可以在创建角色时直接使用默认模型

### 缓存说明

**SiliconFlow** 和 **OpenRouter** 都支持模型列表缓存：
- 缓存时间：24 小时
- 刷新页面后会优先使用缓存
- 需要最新模型时，点击 🔄 按钮重新获取

## 🐛 已知问题

### 暂未发现问题

如果您在使用过程中遇到问题，请：

1. 检查浏览器控制台错误信息
2. 确认 API 密钥有效
3. 检查网络连接
4. 尝试清除缓存
5. 联系技术支持

## 📚 相关文档

- [SiliconFlow API 文档](https://docs.siliconflow.cn/)
- [API 配置指南](./API_CONFIGURATION.md)
- [功能实现总结](./FEATURE_SUMMARY.md)

---

**更新日期**: 2025年 1月
**版本**: v1.2
**状态**: ✅ 已完成

# API 配置指南

## 概述

AI Conference 系统现在支持开箱即用的 API 供应商配置。您无需手动输入完整的 API 供应商信息和模型列表，系统已经为您准备了默认配置。

## 默认 API 供应商

系统预配置了以下三个主流 API 供应商：

### 1. SiliconFlow 🌟
- **注册地址**: https://cloud.siliconflow.cn/
- **特点**: 国产大模型服务商，价格优惠，支持免费试用额度
- **可用模型**: 8个（包括 DeepSeek、Qwen2.5、Llama 等）
  - deepseek-chat
  - deepseek-coder
  - Qwen/Qwen2.5-72B-Instruct
  - Qwen/Qwen2.5-32B-Instruct
  - Qwen/Qwen2.5-14B-Instruct
  - Qwen/Qwen2.5-7B-Instruct
  - meta-llama/Meta-Llama-3.1-70B-Instruct
  - meta-llama/Meta-Llama-3.1-8B-Instruct

### 2. OpenRouter
- **注册地址**: https://openrouter.ai/
- **特点**: AI 模型聚合平台，模型丰富，生态完善
- **可用模型**: 8个（包括 GPT-4o、Claude-3、Llama 等）
  - openai/gpt-4o
  - openai/gpt-4o-mini
  - anthropic/claude-3.5-sonnet
  - anthropic/claude-3-haiku
  - meta-llama/llama-3.1-70b-instruct
  - meta-llama/llama-3.1-8b-instruct
  - qwen/qwen-2.5-72b-instruct
  - qwen/qwen-2.5-32b-instruct

### 3. DeepSeek
- **注册地址**: https://platform.deepseek.com/
- **特点**: 专业代码和对话模型，编程能力强
- **可用模型**: 2个
  - deepseek-chat
  - deepseek-coder

## 配置步骤

### 第一步：获取 API 密钥

1. 选择您要使用的 API 供应商
2. 访问对应的官网注册账号
3. 获取您的 API 密钥
4. （可选）充值或查看免费试用额度

### 第二步：在应用中配置

1. 点击侧边栏的 "⚙️ 设置" 按钮
2. 在 "API配置" 区域找到对应的供应商
3. 将您的 API 密钥粘贴到输入框中
4. 点击 "测试连接" 验证密钥有效性
5. 点击 "新对话" 开始配置 AI 角色

## 配置文件说明

### 默认配置 (defaultConfig.ts)

系统使用 `src/config/defaultConfig.ts` 文件管理默认配置：

```typescript
export const DEFAULT_API_KEYS: Record<string, string> = {
  siliconflow: '', // 需要用户提供
  openrouter: '',  // 需要用户提供
  deepseek: '',    // 需要用户提供
  custom: ''       // 可选
};

export const DEFAULT_USER_CONFIG = {
  apiKeys: DEFAULT_API_KEYS,
  selectedCharacters: [],
  theme: 'arcade'
};
```

### 存储管理 (storageService.ts)

使用 `storageService` 管理 API 密钥：

```typescript
// 获取 API 密钥
const apiKey = storageService.getApiKey('siliconflow');

// 保存 API 密钥
storageService.saveApiKey('siliconflow', 'your-api-key');

// 检查所有必需密钥
const isReady = storageService.hasAllRequiredKeys(characters);

// 重置为默认配置
storageService.resetToDefault();
```

### 环境变量 (.env.example)

可以使用环境变量管理敏感信息：

```bash
# 复制 .env.example 为 .env.local 并填入真实密钥
cp .env.example .env.local

# 编辑 .env.local
VITE_SILICONFLOW_API_KEY=your_siliconflow_key
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_DEEPSEEK_API_KEY=your_deepseek_key
```

## 自定义 API 供应商

如果您有自己的 API 服务（兼容 OpenAI 格式），可以添加自定义 API 供应商：

1. 在设置页面找到 "自定义API提供商" 区域
2. 点击 "添加自定义API"
3. 填写以下信息：
   - 提供商名称
   - Base URL（包含协议，如：https://api.example.com/v1）
   - 支持的模型（逗号分隔）
   - API Key
4. 保存配置

**注意**: 自定义 API 必须兼容 OpenAI 的 ChatCompletions API 格式。

## 安全建议

1. **不要提交真实密钥到代码仓库**
   - 使用 `.env.local` 文件（已添加到 `.gitignore`）
   - 或使用环境变量管理

2. **定期轮换 API 密钥**
   - 建议每 3-6 个月更换一次 API 密钥
   - 及时撤销泄露的密钥

3. **监控 API 使用情况**
   - 定期检查 API 使用统计
   - 设置使用限额和告警

4. **使用最小权限原则**
   - 只为必要的模型授权
   - 避免给 API 密钥过高的权限

## 常见问题

### Q: 为什么需要 API 密钥？
A: API 密钥用于验证您的身份并计费。每个 AI 模型的调用都会消耗一定的费用。

### Q: 如何获取免费试用额度？
A:
- SiliconFlow: 新用户通常有免费试用额度
- OpenRouter: 部分模型提供免费额度
- DeepSeek: 新用户有免费试用额度

### Q: API 密钥安全吗？
A: API 密钥仅存储在您的浏览器本地（localStorage）中，不会发送到我们的服务器。但请注意不要在公共设备上使用或分享您的密钥。

### Q: 可以使用多个 API 供应商吗？
A: 是的，您可以同时配置多个 API 供应商，在创建角色时选择不同的提供商。

### Q: 如何重置所有配置？
A: 在控制台中调用 `storageService.resetToDefault()` 或手动清除浏览器本地存储。

## 费用参考

根据 2025年 1月的市场价格（仅供参考）：

| 供应商 | 模型 | 价格（每1M tokens） | 特点 |
|--------|------|---------------------|------|
| SiliconFlow | deepseek-chat | ¥1 | 价格最优惠 |
| SiliconFlow | Qwen2.5-72B | ¥6 | 国产生态 |
| OpenRouter | gpt-4o-mini | $0.15 | OpenAI官方 |
| OpenRouter | claude-3-haiku | $0.25 | Anthropic官方 |
| DeepSeek | deepseek-coder | ¥2 | 专业代码 |

*注：价格可能随时变动，请以官方最新价格为准*

## 技术支持

如果您在配置过程中遇到问题：

1. 查看控制台错误信息
2. 确认 API 密钥正确且未过期
3. 检查网络连接和 API 服务状态
4. 尝试使用其他模型或供应商

---

**更新日期**: 2025年 1月
**版本**: v1.0

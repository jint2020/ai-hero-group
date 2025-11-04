# AI群英会 - AI Conference

一个充满90年代街机像素风格的多人AI对话应用，让多个AI角色围绕话题进行深入讨论。

## ✨ 特性

- 🎮 **复古街机风格** - 90年代像素艺术风格UI界面
- 🤖 **多AI角色对话** - 支持最多3个AI角色同时参与讨论
- 🔧 **多种API支持** - SiliconFlow、OpenRouter、DeepSeek、自定义API
- 🎭 **角色个性定制** - 预设5种角色或创建自定义角色
- 💬 **流式对话** - 实时显示AI生成内容
- 📜 **对话历史管理** - 保存、加载、删除历史对话
- ⏯️ **精确控制** - 可暂停/继续、逐轮控制、自动停止
- 🎨 **独特角色设计** - 每个角色都有专属头像、颜色和性格
- 📊 **实时状态显示** - 角色状态、轮次、消息计数一目了然
- 🚀 **无需后端** - 纯前端应用，数据本地存储

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
pnpm dev
```

### 构建生产版本

```bash
npm run build
# 或
pnpm build
```

## 📖 使用指南

### 1. 配置API密钥

在设置页面配置你的API密钥：

- **SiliconFlow**: 需要API密钥，模型包括 DeepSeek、Qwen、Llama 等
- **OpenRouter**: 需要API密钥，支持 GPT-4、Claude、Llama 等
- **DeepSeek**: 需要API密钥，专注代码和对话模型
- **自定义API**: 支持配置自己的API服务器

### 2. 选择AI角色

#### 预设角色（5种）

1. **🧙‍♂️ 智者** - 睿智深沉，富有哲理
2. **🤖 幽默者** - 幽默风趣，轻松创意
3. **🧠 分析师** - 理性逻辑，数据驱动
4. **🎨 创造者** - 创新想象，充满激情
5. **👁️ 评论家** - 批判锐利，深度洞察

#### 自定义角色

可以创建具有以下特性的角色：
- 自定义名称和头像
- 独特性格描述
- 系统提示词
- 个性化颜色

### 3. 开始对话

1. 输入讨论主题
2. 点击"开始群英会"
3. AI角色将轮流发言

### 4. 控制对话

#### 自动模式
- **一轮内自动连续**: 所有角色自动依次发言
- **一轮结束暂停**: 一轮结束后自动停止，等待手动触发

#### 手动控制
- **暂停/继续**: 控制对话进行状态
- **下一轮**: 手动触发下一轮对话
- **重置**: 清空对话历史重新开始

## 🏗️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **样式**: TailwindCSS
- **状态管理**: React Hooks
- **数据存储**: LocalStorage
- **API调用**: Fetch API
- **UI设计**: 自定义90年代街机像素风格

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── ApiConfig.tsx   # API配置组件
│   ├── CharacterSelector.tsx  # 角色选择组件
│   ├── ConversationView.tsx   # 对话视图组件
│   ├── ControlPanel.tsx       # 控制面板组件
│   └── ErrorBoundary.tsx      # 错误边界组件
├── services/           # 业务逻辑服务
│   ├── aiService.ts    # AI API调用服务
│   ├── conversationService.ts  # 对话管理服务
│   └── storageService.ts  # 本地存储服务
├── types/              # TypeScript类型定义
│   └── index.ts        # 公共类型
├── App.tsx             # 主应用组件
└── main.tsx            # 应用入口
```

## 🎯 对话机制

### 发言顺序

- AI角色按照设定顺序轮流发言
- 每轮所有角色都会发言一次
- 发言顺序固定或可调整

### 轮次管理

- **轮次计数**: 每完成一轮发言轮次+1
- **最大轮数**: 默认10轮，可防止无限对话
- **状态保存**: 每轮结束后自动保存状态

### 上下文传递

- 每次发言都包含完整对话历史
- 系统提示词确保角色一致性
- 主题信息持续贯穿对话

## 🔧 API配置详解

### SiliconFlow

```typescript
{
  provider: 'siliconflow',
  baseUrl: 'https://api.siliconflow.cn/v1',
  models: [
    'deepseek-chat',
    'deepseek-coder',
    'Qwen/Qwen2.5-72B-Instruct',
    // ... 更多模型
  ]
}
```

### OpenRouter

```typescript
{
  provider: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  models: [
    'openai/gpt-4o',
    'anthropic/claude-3.5-sonnet',
    // ... 更多模型
  ]
}
```

### 自定义API

支持配置自己的OpenAI兼容API服务器：
- 自定义Base URL
- 自定义模型列表
- 自定义认证方式

## 💾 数据存储

- **用户配置**: API密钥、角色配置存储在localStorage
- **对话历史**: 所有对话记录自动保存
- **导出/导入**: 支持数据备份和恢复

## 🎨 UI设计

### 色彩方案

- 主色调: 青蓝色 (#00ffff)
- 辅助色: 绿色、黄色、粉色
- 背景: 深灰色 (#1f2937)

### 像素风格元素

- 扫描线效果
- 像素边框
- 复古字体
- 发光效果

## 🐛 已知问题

- 大型对话可能影响性能
- 浏览器存储空间限制
- 网络延迟影响实时体验

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📞 联系我们

如有问题或建议，请提交 [Issue](../../issues)

---

**享受与AI群英会的对话吧！** 🎉

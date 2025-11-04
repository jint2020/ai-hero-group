# AI Conference - Multi-AI Character Discussion Platform

A retro 90s arcade pixel-style multi-AI character discussion application that enables multiple AI personas to engage in in-depth conversations on various topics.

## ✨ Features

- 🎮 **Retro Arcade Style** - 90s pixel art style UI
- 🤖 **Multi-AI Dialogue** - Support up to 3 AI characters simultaneously
- 🔧 **Multiple API Providers** - SiliconFlow, OpenRouter, DeepSeek, Custom APIs
- 🎭 **Customizable Characters** - 5 preset roles or create custom characters
- 💬 **Streaming Conversation** - Real-time AI response display
- 📜 **History Management** - Save, load, and delete conversation history
- ⏯️ **Precise Control** - Pause/continue, round-by-round control, auto-stop
- 🎨 **Unique Character Design** - Exclusive avatars, colors, and personalities
- 📊 **Real-time Status** - Character status, round count, message tracking
- 🚀 **No Backend Required** - Pure frontend app with local storage

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Development Mode

```bash
npm run dev
# or
pnpm dev
```

### Build for Production

```bash
npm run build
# or
pnpm build
```

## 📖 User Guide

### 1. Configure API Keys

Configure your API keys in the settings page:

- **SiliconFlow**: Requires API key, models include DeepSeek, Qwen, Llama, etc.
- **OpenRouter**: Requires API key, supports GPT-4, Claude, Llama, etc.
- **DeepSeek**: Requires API key, specialized in code and dialogue models
- **Custom API**: Support for your own API server configuration

### 2. Select AI Characters

#### Preset Characters (5 types)

1. **🧙‍♂️ The Sage** - Wise, profound, philosophical
2. **🤖 The Humorous** - Witty, relaxed, creative
3. **🧠 The Analyst** - Rational, logical, data-driven
4. **🎨 The Creator** - Innovative, imaginative, passionate
5. **👁️ The Critic** - Critical, sharp, insightful

#### Custom Characters

Create characters with:
- Custom name and avatar
- Unique personality description
- System prompt
- Personalized color scheme

### 3. Start Conversation

1. Enter discussion topic
2. Click "Start Conference"
3. AI characters will speak in turn

### 4. Control Conversation

#### Automatic Mode
- **Continuous within round**: All characters automatically speak in sequence
- **Pause after round**: Auto-stops after each round, waiting for manual trigger

#### Manual Control
- **Pause/Continue**: Control conversation state
- **Next Round**: Manually trigger the next round
- **Reset**: Clear conversation history and restart

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS
- **State Management**: React Hooks
- **Data Storage**: LocalStorage
- **API Calls**: Fetch API
- **UI Design**: Custom 90s arcade pixel style

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ApiConfig.tsx   # API configuration component
│   ├── CharacterSelector.tsx  # Character selector component
│   ├── ConversationView.tsx   # Conversation view component
│   ├── ControlPanel.tsx       # Control panel component
│   └── ErrorBoundary.tsx      # Error boundary component
├── services/           # Business logic services
│   ├── aiService.ts    # AI API service
│   ├── conversationService.ts  # Conversation management service
│   └── storageService.ts  # Local storage service
├── types/              # TypeScript type definitions
│   └── index.ts        # Common types
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

## 🎯 Conversation Mechanism

### Speaking Order

- AI characters speak in predefined rotation
- Each character speaks once per round
- Fixed or adjustable speaking order

### Round Management

- **Round Counter**: Increases by 1 after each complete round
- **Max Rounds**: Default 10 rounds to prevent infinite conversations
- **State Saving**: Automatically saves state after each round

### Context Passing

- Each response includes complete conversation history
- System prompts ensure character consistency
- Topic information persists throughout the conversation

## 🔧 API Configuration Details

### SiliconFlow

```typescript
{
  provider: 'siliconflow',
  baseUrl: 'https://api.siliconflow.cn/v1',
  models: [
    'deepseek-chat',
    'deepseek-coder',
    'Qwen/Qwen2.5-72B-Instruct',
    // ... more models
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
    // ... more models
  ]
}
```

### Custom API

Supports configuring your own OpenAI-compatible API server:
- Custom Base URL
- Custom model list
- Custom authentication

## 💾 Data Storage

- **User Configuration**: API keys and character configs stored in localStorage
- **Conversation History**: All conversations automatically saved
- **Export/Import**: Support for data backup and restore

## 🎨 UI Design

### Color Scheme

- Primary: Cyan blue (#00ffff)
- Accent: Green, Yellow, Pink
- Background: Dark gray (#1f2937)

### Pixel Style Elements

- Scanline effects
- Pixel borders
- Retro fonts
- Glow effects

## 🐛 Known Issues

- Large conversations may affect performance
- Browser storage space limitations
- Network latency affects real-time experience

## 🤝 Contributing

Issues and Pull Requests are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📞 Contact

For issues or suggestions, please open an [Issue](../../issues)

---

**Enjoy the AI Conference!** 🎉

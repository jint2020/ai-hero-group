// AI角色类型定义
export interface AICharacter {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  systemPrompt: string;
  color: string;
  status: 'idle' | 'thinking' | 'speaking' | 'error';
  apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom';
  model: string;
  apiKey: string;
  customBaseUrl?: string; // 自定义base URL
}

// API提供商配置
export interface APIProvider {
  name: string;
  baseUrl: string;
  models: string[];
  requiresKey: boolean;
}

// 自定义API提供商配置
export interface CustomAPIProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  models: string[];
}

// 对话消息类型
export interface Message {
  id: string;
  characterId: string;
  content: string;
  timestamp: number;
  type: 'user' | 'ai';
}

// 对话会话类型
export interface Conversation {
  id: string;
  topic: string;
  messages: Message[];
  characters: AICharacter[];
  isActive: boolean;
  currentSpeakerIndex: number;
  round: number;
  createdAt: number;
  currentSpeakingMessage?: Message;
}

// 自定义角色配置类型
export interface CustomCharacterConfig {
  name: string;
  avatar: string;
  personality: string;
  systemPrompt: string;
  color: string;
}

// 预设角色
export const PRESET_CHARACTERS: Omit<AICharacter, 'id' | 'apiProvider' | 'model' | 'apiKey' | 'status'>[] = [
  {
    name: '智者',
    avatar: '🧙‍♂️',
    personality: '睿智、深沉、富有哲理',
    color: '#00ffff',
    systemPrompt: '你是一位睿智的长者，说话深思熟虑，经常引用古典智慧和哲学思考。回答问题时总是从多个角度分析，给人以启发。'
  },
  {
    name: '幽默者',
    avatar: '🤖',
    personality: '幽默、轻松、富有创意',
    color: '#ff0080',
    systemPrompt: '你是一个幽默风趣的AI，喜欢用轻松幽默的方式表达观点，经常使用双关语和有趣的比喻，让对话变得生动有趣。'
  },
  {
    name: '分析师',
    avatar: '🧠',
    personality: '理性、逻辑、数据驱动',
    color: '#39ff14',
    systemPrompt: '你是一个理性的分析师，擅长用数据和逻辑来分析问题。回答问题时条理清晰，善于归纳总结，提供客观的见解。'
  },
  {
    name: '创造者',
    avatar: '🎨',
    personality: '创新、想象力、充满激情',
    color: '#ffff00',
    systemPrompt: '你是一个富有创造力的艺术家，思维跳跃，充满想象力。喜欢从独特的角度思考问题，提出新颖的想法和解决方案。'
  },
  {
    name: '评论家',
    avatar: '👁️',
    personality: '批判、深度、锐利',
    color: '#ff6600',
    systemPrompt: '你是一个敏锐的评论家，善于发现问题的本质，提出尖锐而深刻的观点。不满足于表面现象，总要深挖背后的原因。'
  }
];

// API提供商配置
export const API_PROVIDERS: Record<string, APIProvider> = {
  siliconflow: {
    name: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: [
      'deepseek-chat',
      'deepseek-coder',
      'Qwen/Qwen2.5-72B-Instruct',
      'Qwen/Qwen2.5-32B-Instruct',
      'Qwen/Qwen2.5-14B-Instruct',
      'Qwen/Qwen2.5-7B-Instruct',
      'meta-llama/Meta-Llama-3.1-70B-Instruct',
      'meta-llama/Meta-Llama-3.1-8B-Instruct'
    ],
    requiresKey: true
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'meta-llama/llama-3.1-70b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
      'qwen/qwen-2.5-72b-instruct',
      'qwen/qwen-2.5-32b-instruct'
    ],
    requiresKey: true
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      'deepseek-chat',
      'deepseek-coder'
    ],
    requiresKey: true
  }
};
// 默认API配置
// 注意：这些是示例配置，仅供演示使用
// 生产环境中请使用环境变量或安全的密钥管理服务

export const DEFAULT_API_KEYS: Record<string, string> = {
  siliconflow: '', // SiliconFlow API密钥（需要用户提供）
  openrouter: '',  // OpenRouter API密钥（需要用户提供）
  deepseek: '',    // DeepSeek API密钥（需要用户提供）
  custom: ''       // 自定义API密钥（需要用户提供）
};

// 默认用户配置
export const DEFAULT_USER_CONFIG = {
  apiKeys: DEFAULT_API_KEYS,
  selectedCharacters: [],
  theme: 'arcade'
};

// 默认设置
export const DEFAULT_SETTINGS = {
  // 是否在首次启动时显示欢迎提示
  showWelcomeTip: true,
  // 是否自动保存配置
  autoSave: true,
  // 默认API提供商
  defaultProvider: 'siliconflow' as const,
  // 默认模型
  defaultModel: 'deepseek-chat'
};

// 预定义的快速开始配置（可选的演示密钥，仅供参考）
export const DEMO_CONFIG = {
  enabled: false, // 演示模式默认关闭
  siliconflow: {
    note: '您可以在 https://cloud.siliconflow.cn/ 获取免费API密钥',
    freeCredits: '新用户通常有免费试用额度'
  },
  openrouter: {
    note: '您可以在 https://openrouter.ai/ 获取API密钥',
    freeCredits: '部分模型提供免费额度'
  },
  deepseek: {
    note: '您可以在 https://platform.deepseek.com/ 获取API密钥',
    freeCredits: '新用户有免费试用额度'
  }
};

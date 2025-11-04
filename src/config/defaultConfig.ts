// 默认API配置
// 读取环境变量（.env文件中的 VITE_* 变量）
// 注意：这些是示例配置，仅供演示使用
// 生产环境中请使用环境变量或安全的密钥管理服务

export const DEFAULT_API_KEYS: Record<string, string> = {
  siliconflow: import.meta.env.VITE_SILICONFLOW_API_KEY || '',
  openrouter: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  deepseek: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  custom: import.meta.env.VITE_CUSTOM_API_KEY || ''
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
  // 默认API提供商（从环境变量读取或使用默认值）
  defaultProvider: (import.meta.env.VITE_DEFAULT_PROVIDER as 'siliconflow' | 'openrouter' | 'deepseek') || 'siliconflow',
  // 默认模型（从环境变量读取或使用默认值）
  defaultModel: import.meta.env.VITE_DEFAULT_MODEL || 'deepseek-chat',
  // 默认主题（从环境变量读取或使用默认值）
  theme: import.meta.env.VITE_DEFAULT_THEME || 'arcade',
  // 调试模式（从环境变量读取或使用默认值）
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true'
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

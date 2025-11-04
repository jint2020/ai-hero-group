import { AICharacter, Conversation } from '../types';
import { DEFAULT_USER_CONFIG } from '../config/defaultConfig';

// 模型缓存信息
interface ModelCache {
  models: string[];
  lastFetched: number;
  provider: string;
}

export class StorageService {
  private static instance: StorageService;
  private modelCache: Map<string, ModelCache> = new Map();
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时缓存过期

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // 保存用户配置
  saveUserConfig(config: {
    apiKeys: Record<string, string>;
    selectedCharacters: AICharacter[];
    theme: string;
  }): void {
    try {
      localStorage.setItem('ai-conference-config', JSON.stringify(config));
    } catch (error) {
      console.error('保存用户配置失败:', error);
    }
  }

  // 加载用户配置
  loadUserConfig(): {
    apiKeys: Record<string, string>;
    selectedCharacters: AICharacter[];
    theme: string;
  } | null {
    try {
      const config = localStorage.getItem('ai-conference-config');
      if (config) {
        const parsedConfig = JSON.parse(config);

        // 合并默认配置，确保新版本应用时能获得所有默认字段
        return {
          apiKeys: { ...DEFAULT_USER_CONFIG.apiKeys, ...parsedConfig.apiKeys },
          selectedCharacters: parsedConfig.selectedCharacters || DEFAULT_USER_CONFIG.selectedCharacters,
          theme: parsedConfig.theme || DEFAULT_USER_CONFIG.theme
        };
      } else {
        // 首次使用，返回默认配置
        console.log('首次使用，加载默认配置');
        return DEFAULT_USER_CONFIG;
      }
    } catch (error) {
      console.error('加载用户配置失败:', error);
      // 如果加载失败，返回默认配置
      return DEFAULT_USER_CONFIG;
    }
  }

  // 保存对话历史
  saveConversation(conversation: Conversation): void {
    try {
      const conversations = this.getAllConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.push(conversation);
      }
      
      localStorage.setItem('ai-conference-conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('保存对话失败:', error);
    }
  }

  // 获取所有对话
  getAllConversations(): Conversation[] {
    try {
      const conversations = localStorage.getItem('ai-conference-conversations');
      if (conversations) {
        return JSON.parse(conversations);
      }
    } catch (error) {
      console.error('加载对话历史失败:', error);
    }
    return [];
  }

  // 获取特定对话
  getConversation(id: string): Conversation | null {
    const conversations = this.getAllConversations();
    return conversations.find(c => c.id === id) || null;
  }

  // 删除对话
  deleteConversation(id: string): void {
    try {
      const conversations = this.getAllConversations();
      const filteredConversations = conversations.filter(c => c.id !== id);
      localStorage.setItem('ai-conference-conversations', JSON.stringify(filteredConversations));
    } catch (error) {
      console.error('删除对话失败:', error);
    }
  }

  // 保存当前活跃对话ID
  setActiveConversation(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem('ai-conference-active', id);
      } else {
        localStorage.removeItem('ai-conference-active');
      }
    } catch (error) {
      console.error('保存活跃对话ID失败:', error);
    }
  }

  // 获取当前活跃对话ID
  getActiveConversation(): string | null {
    try {
      return localStorage.getItem('ai-conference-active');
    } catch (error) {
      console.error('获取活跃对话ID失败:', error);
      return null;
    }
  }

  // 清除所有数据
  clearAllData(): void {
    try {
      localStorage.removeItem('ai-conference-config');
      localStorage.removeItem('ai-conference-conversations');
      localStorage.removeItem('ai-conference-active');
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }

  // 导出数据
  exportData(): string {
    try {
      const data = {
        config: this.loadUserConfig(),
        conversations: this.getAllConversations(),
        exportTime: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('导出数据失败:', error);
      return '{}';
    }
  }

  // 导入数据
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.config) {
        this.saveUserConfig(data.config);
      }
      
      if (data.conversations && Array.isArray(data.conversations)) {
        localStorage.setItem('ai-conference-conversations', JSON.stringify(data.conversations));
      }
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  // 获取存储使用情况
  getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // 估算localStorage总容量为5MB
      const total = 5 * 1024 * 1024;
      const percentage = Math.round((used / total) * 100);

      return { used, total, percentage };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  // 保存单个API密钥
  saveApiKey(provider: string, apiKey: string): void {
    try {
      const config = this.loadUserConfig();
      if (config) {
        config.apiKeys[provider] = apiKey;
        this.saveUserConfig(config);
      }
    } catch (error) {
      console.error(`保存${provider} API密钥失败:`, error);
    }
  }

  // 获取单个API密钥
  getApiKey(provider: string): string {
    try {
      const config = this.loadUserConfig();
      return config?.apiKeys[provider] || '';
    } catch (error) {
      console.error(`获取${provider} API密钥失败:`, error);
      return '';
    }
  }

  // 检查是否已配置所有必需的API密钥
  hasAllRequiredKeys(characters: AICharacter[]): boolean {
    try {
      const config = this.loadUserConfig();
      if (!config) return false;

      const requiredKeys = new Set<string>();
      characters.forEach(character => {
        if (character.apiKey) {
          requiredKeys.add(character.apiProvider);
        }
      });

      // 检查所有需要的提供商是否都已配置API密钥
      for (const provider of requiredKeys) {
        if (!config.apiKeys[provider]) {
          return false;
        }
      }
      return requiredKeys.size > 0;
    } catch (error) {
      console.error('检查API密钥失败:', error);
      return false;
    }
  }

  // 重置为默认配置
  resetToDefault(): void {
    try {
      this.saveUserConfig(DEFAULT_USER_CONFIG);
      console.log('已重置为默认配置');
    } catch (error) {
      console.error('重置配置失败:', error);
    }
  }

  // 获取缓存的模型列表
  getCachedModels(provider: string): string[] | null {
    try {
      const cache = this.modelCache.get(provider);
      if (!cache) return null;

      // 检查缓存是否过期
      if (Date.now() - cache.lastFetched > this.CACHE_EXPIRY) {
        this.modelCache.delete(provider);
        return null;
      }

      return cache.models;
    } catch (error) {
      console.error(`获取${provider}模型缓存失败:`, error);
      return null;
    }
  }

  // 缓存模型列表
  cacheModels(provider: string, models: string[]): void {
    try {
      this.modelCache.set(provider, {
        models,
        lastFetched: Date.now(),
        provider
      });
      console.log(`已缓存${provider}的${models.length}个模型`);
    } catch (error) {
      console.error(`缓存${provider}模型失败:`, error);
    }
  }

  // 清除模型缓存
  clearModelCache(provider?: string): void {
    try {
      if (provider) {
        this.modelCache.delete(provider);
        console.log(`已清除${provider}的模型缓存`);
      } else {
        this.modelCache.clear();
        console.log('已清除所有模型缓存');
      }
    } catch (error) {
      console.error('清除模型缓存失败:', error);
    }
  }

  // 获取默认模型
  getDefaultModel(provider: string): string {
    const defaultModels: Record<string, string> = {
      siliconflow: 'deepseek-chat',
      openrouter: 'openai/gpt-4o-mini',
      deepseek: 'deepseek-chat',
      custom: ''
    };
    return defaultModels[provider] || '';
  }

  // 保存默认模型
  saveDefaultModel(provider: string, model: string): void {
    try {
      const config = this.loadUserConfig();
      if (config) {
        // 保存到 localStorage
        localStorage.setItem(`ai-conference-default-model-${provider}`, model);
        console.log(`已保存${provider}的默认模型: ${model}`);
      }
    } catch (error) {
      console.error(`保存${provider}默认模型失败:`, error);
    }
  }

  // 加载默认模型
  loadDefaultModel(provider: string): string {
    try {
      return localStorage.getItem(`ai-conference-default-model-${provider}`) || this.getDefaultModel(provider);
    } catch (error) {
      console.error(`加载${provider}默认模型失败:`, error);
      return this.getDefaultModel(provider);
    }
  }
}

export const storageService = StorageService.getInstance();
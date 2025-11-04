import { AICharacter, Conversation } from '../types';

export class StorageService {
  private static instance: StorageService;

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
        return JSON.parse(config);
      }
    } catch (error) {
      console.error('加载用户配置失败:', error);
    }
    return null;
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
}

export const storageService = StorageService.getInstance();
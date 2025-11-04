import { Conversation, Message, AICharacter } from '../types';

export class ConversationService {
  private static instance: ConversationService;

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  // 创建新对话
  createConversation(topic: string, characters: AICharacter[]): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
      topic,
      messages: [],
      characters,
      isActive: false,
      currentSpeakerIndex: 0,
      round: 0,
      createdAt: Date.now()
    };
    
    return conversation;
  }

  // 添加消息到对话
  addMessage(conversation: Conversation, characterId: string, content: string): Conversation {
    const message: Message = {
      id: this.generateId(),
      characterId,
      content,
      timestamp: Date.now(),
      type: 'ai'
    };

    return {
      ...conversation,
      messages: [...conversation.messages, message]
    };
  }

  // 获取下一个发言者
  getNextSpeaker(conversation: Conversation): AICharacter | null {
    if (conversation.characters.length === 0) return null;
    
    const nextIndex = (conversation.currentSpeakerIndex + 1) % conversation.characters.length;
    return conversation.characters[nextIndex];
  }

  // 更新当前发言者索引
  updateSpeakerIndex(conversation: Conversation): Conversation {
    const nextIndex = (conversation.currentSpeakerIndex + 1) % conversation.characters.length;
    
    return {
      ...conversation,
      currentSpeakerIndex: nextIndex
    };
  }

  // 开始对话
  startConversation(conversation: Conversation): Conversation {
    return {
      ...conversation,
      isActive: true,
      currentSpeakerIndex: -1 // 从第一个开始
    };
  }

  // 暂停对话
  pauseConversation(conversation: Conversation): Conversation {
    return {
      ...conversation,
      isActive: false
    };
  }

  // 重置对话
  resetConversation(conversation: Conversation): Conversation {
    return {
      ...conversation,
      messages: [],
      isActive: false,
      currentSpeakerIndex: 0,
      round: 0
    };
  }

  // 增加轮次
  incrementRound(conversation: Conversation): Conversation {
    return {
      ...conversation,
      round: conversation.round + 1
    };
  }

  // 获取对话历史（格式化用于AI）
  getConversationHistory(conversation: Conversation): Array<{ role: string; content: string }> {
    return conversation.messages.map(msg => {
      const character = conversation.characters.find(c => c.id === msg.characterId);
      return {
        role: 'user',
        content: `${character?.name || '未知角色'}: ${msg.content}`
      };
    });
  }

  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 验证对话状态
  validateConversation(conversation: Conversation): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!conversation.topic || conversation.topic.trim().length === 0) {
      errors.push('对话主题不能为空');
    }

    if (conversation.characters.length === 0) {
      errors.push('至少需要选择一个AI角色');
    }

    if (conversation.characters.length > 3) {
      errors.push('最多只能选择3个AI角色');
    }

    // 检查每个角色的API配置
    conversation.characters.forEach((character, index) => {
      if (!character.apiKey || character.apiKey.trim().length === 0) {
        errors.push(`角色 ${character.name} 的API密钥不能为空`);
      }
      if (!character.model || character.model.trim().length === 0) {
        errors.push(`角色 ${character.name} 的模型不能为空`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const conversationService = ConversationService.getInstance();
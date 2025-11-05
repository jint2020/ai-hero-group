import { StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Conversation } from '../types';
import { aiService } from '../services/aiService';
import { conversationService } from '../services/conversationService';
import { storageService } from '../services/storageService';

/**
 * Conversation Store - 管理所有与对话相关的状态
 * 包括：当前对话、历史对话、对话操作
 */
export interface ConversationState {
  // 对话状态
  currentConversation: Conversation | null;
  allConversations: Conversation[];

  // 内部状态（需要从外部设置）
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;

  // Actions - 对话管理
  startConversation: (topic: string) => Promise<void>;
  processNextTurn: (conversation: Conversation) => Promise<void>;
  toggleConversation: () => void;
  resetConversation: () => void;
  goBackToSetup: () => void;
  loadConversation: (conversation: Conversation) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  loadConversations: () => void;

  // Internal actions
  _handleConversationError: (error: unknown) => void;
  _updateCharacterStatus: (characterId: string, status: 'idle' | 'thinking' | 'speaking' | 'error') => void;
}

/**
 * 创建 Conversation Store 的 Creator 函数
 */
export const createConversationStore: StateCreator<
  ConversationState,
  [],
  [],
  ConversationState
> = (set, get) => ({
  // 初始状态
  currentConversation: null,
  allConversations: [],
  isLoading: false,
  isProcessing: false,
  error: null,

  // Actions - 对话管理
  startConversation: async (topic) => {
    // 在独立 Store 中，characters 需要从外部传递
    // 在 useAppStore 中，characters 会从状态中自动获取
    const state = get() as any;
    const characters = state.characters || [];
    if (characters.length === 0) {
      throw new Error('请先选择至少一个AI角色');
    }

    // 验证对话
    const validation = conversationService.validateConversation({
      id: '',
      topic,
      messages: [],
      characters,
      isActive: false,
      currentSpeakerIndex: 0,
      round: 0,
      createdAt: Date.now()
    });

    if (!validation.isValid) {
      throw new Error(validation.errors.join('\n'));
    }

    set({ isLoading: true });

    try {
      // 测试所有API连接
      for (const character of characters) {
        const isConnected = await aiService.testConnection(
          character.apiProvider,
          character.apiKey,
          character.model,
          character.customBaseUrl
        );

        if (!isConnected) {
          throw new Error(`角色 ${character.name} 的API连接失败，请检查配置`);
        }
      }

      // 创建对话
      const conversation = conversationService.createConversation(topic, characters);
      const startedConversation = conversationService.startConversation(conversation);

      set({
        currentConversation: startedConversation,
      });

      // 开始第一轮对话
      setTimeout(() => {
        get().processNextTurn(startedConversation);
      }, 1000);
    } catch (error) {
      console.error('开始对话失败:', error);
      get()._handleConversationError(error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  processNextTurn: async (conversation) => {
    if (!conversation.isActive || get().isProcessing) return;

    // 限制最大轮数
    if (conversation.round >= 10) {
      console.log('已达到最大轮数限制，对话结束');
      set((state) => ({
        currentConversation: state.currentConversation
          ? { ...state.currentConversation, isActive: false }
          : null,
      }));
      return;
    }

    try {
      const nextSpeaker = conversationService.getNextSpeaker(conversation);

      if (!nextSpeaker) {
        console.log('没有可用的发言者');
        return;
      }

      // 更新角色状态为思考中
      get()._updateCharacterStatus(nextSpeaker.id, 'thinking');

      // 获取对话历史
      const history = conversationService.getConversationHistory(conversation);

      // 添加当前主题作为上下文
      const contextMessages = [
        { role: 'user', content: `当前讨论主题: ${conversation.topic}` },
        ...history
      ];

      // 创建临时消息对象
      const tempMessage = {
        id: Date.now().toString(),
        characterId: nextSpeaker.id,
        content: '',
        timestamp: Date.now(),
        type: 'ai' as const
      };

      let streamingContent = '';
      const tempConversation = {
        ...conversation,
        currentSpeakingMessage: tempMessage
      };
      set({ currentConversation: tempConversation });

      // 更新角色状态为说话中
      get()._updateCharacterStatus(nextSpeaker.id, 'speaking');

      // 流式调用AI
      await aiService.callAIStream(
        nextSpeaker.apiProvider,
        nextSpeaker.apiKey,
        nextSpeaker.model,
        contextMessages,
        nextSpeaker.systemPrompt,
        (chunk: string) => {
          streamingContent += chunk;

          const updatedTempMessage = {
            ...tempMessage,
            content: streamingContent
          };

          const updatedTempConversation = {
            ...tempConversation,
            currentSpeakingMessage: updatedTempMessage
          };
          set({ currentConversation: updatedTempConversation });
        },
        nextSpeaker.customBaseUrl,
        nextSpeaker.model ? [nextSpeaker.model] : undefined
      );

      // 流式结束，添加完整消息
      const updatedConversation = conversationService.addMessage(
        conversation,
        nextSpeaker.id,
        streamingContent
      );

      // 清除当前说话消息
      const finalConversation = {
        ...updatedConversation,
        currentSpeakingMessage: undefined
      };

      // 更新发言者索引
      const conversationWithIndex = conversationService.updateSpeakerIndex(finalConversation);

      // 检查是否完成一轮
      const isRoundComplete = conversationWithIndex.currentSpeakerIndex === 0;

      // 如果完成一轮，增加轮次
      let finalConv = conversationWithIndex;
      if (isRoundComplete) {
        finalConv = {
          ...conversationWithIndex,
          round: conversationWithIndex.round + 1
        };
      }

      set({ currentConversation: finalConv });

      // 保存对话
      storageService.saveConversation(finalConv);
      get().loadConversations();

      // 更新角色状态为闲置，继续下一轮
      get()._updateCharacterStatus(nextSpeaker.id, 'idle');

      // 继续下一轮发言
      if (!isRoundComplete && finalConv.isActive && finalConv.round < 10) {
        setTimeout(() => {
          get().processNextTurn(finalConv);
        }, 1500);
      }
    } catch (error) {
      console.error('处理对话轮次失败:', error);
      get()._handleConversationError(error);
      get()._updateCharacterStatus('', 'error');
    }
  },

  toggleConversation: () => {
    const { currentConversation } = get();
    if (!currentConversation) return;

    const isCurrentlyActive = currentConversation.isActive;

    const updatedConversation = isCurrentlyActive
      ? conversationService.pauseConversation(currentConversation)
      : conversationService.startConversation(currentConversation);

    set({ currentConversation: updatedConversation });

    // 只有在当前不活跃且不在处理中时才继续
    if (!isCurrentlyActive) {
      setTimeout(() => {
        get().processNextTurn(updatedConversation);
      }, 500);
    }
  },

  resetConversation: () => {
    const { currentConversation } = get();
    if (!currentConversation) return;

    const resetConv = conversationService.resetConversation(currentConversation);
    set({
      currentConversation: resetConv,
    });
  },

  goBackToSetup: () => {
    set({
      currentConversation: null,
    });
  },

  loadConversation: (conversation) => {
    set({
      currentConversation: conversation,
    });
  },

  deleteConversation: (id, e) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条对话记录吗？')) {
      storageService.deleteConversation(id);
      get().loadConversations();

      // 如果删除的是当前对话，返回设置页面
      if (get().currentConversation?.id === id) {
        get().goBackToSetup();
      }
    }
  },

  loadConversations: () => {
    const conversations = storageService.getAllConversations();
    set({ allConversations: conversations });
  },

  // Internal actions
  _handleConversationError: (error) => {
    set({
      error: error instanceof Error ? error.message : '操作失败'
    });
  },

  _updateCharacterStatus: (characterId, status) => {
    // 这个方法需要从 characterStore 访问 characters
    // 在实际使用中，我们会通过组合的 store 来访问
    // 这里暂时不实现，由组合 store 处理
  },
});

/**
 * 带 devtools 的 Conversation Store Creator
 */
export const createConversationStoreWithDevtools = devtools(createConversationStore, {
  name: 'conversation-store',
});

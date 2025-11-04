import { useCallback, useEffect } from 'react';
import { Conversation, AICharacter, Message } from '../types';
import { aiService } from '../services/aiService';
import { conversationService } from '../services/conversationService';
import { storageService } from '../services/storageService';
import { useConversation } from './useConversation';
import { useCharacter } from './useCharacter';

export const useConversationController = () => {
  const {
    conversation,
    isProcessing,
    error,
    createConversation: createConv,
    startConversation: startConv,
    pauseConversation: pauseConv,
    resetConversation: resetConv,
    processNextTurn: processNextTurnFromHook,
    updateConversation,
    setError
  } = useConversation();

  const {
    characters,
    addCharacter,
    removeCharacter,
    updateCharacter,
    updateCharacterStatus,
    getCharacterById,
    clearCharacters,
    setCharactersList,
    validateCharacters,
    createPresetCharacter,
    createCustomCharacter
  } = useCharacter();

  // 创建并开始对话
  const startConversation = useCallback(async (topic: string) => {
    // 验证角色配置
    const validation = validateCharacters();
    if (!validation.isValid) {
      setError(validation.errors.join('\n'));
      return false;
    }

    // 测试所有API连接
    try {
      for (const character of characters) {
        const isConnected = await aiService.testConnection(
          character.apiProvider,
          character.apiKey,
          character.model,
          character.customBaseUrl
        );

        if (!isConnected) {
          setError(`角色 ${character.name} 的API连接失败，请检查配置`);
          return false;
        }
      }

      // 创建并开始对话
      const conversation = createConv(topic, characters);
      const startedConversation = startConv(conversation);

      // 保存配置
      storageService.saveUserConfig({
        apiKeys: storageService.loadUserConfig()?.apiKeys || {},
        selectedCharacters: characters,
        theme: 'arcade'
      });

      // 开始第一轮对话
      setTimeout(() => {
        processNextTurn(startedConversation);
      }, 1000);

      return true;
    } catch (error) {
      console.error('开始对话失败:', error);
      setError(error instanceof Error ? error.message : '开始对话失败');
      return false;
    }
  }, [characters, validateCharacters, createConv, startConv, setError]);

  // 处理下一轮对话（带角色状态更新）
  const processNextTurn = useCallback(async (conversation: Conversation) => {
    if (!conversation.isActive || isProcessing) return;

    // 限制最大轮数
    if (conversation.round >= 10) {
      console.log('已达到最大轮数限制，对话结束');
      return;
    }

    const nextSpeaker = conversationService.getNextSpeaker(conversation);
    if (!nextSpeaker) {
      return;
    }

    // 更新角色状态为思考中
    updateCharacterStatus(nextSpeaker.id, 'thinking');

    try {
      await processNextTurnFromHook(conversation);

      // 短暂延迟后更新状态为闲置
      setTimeout(() => {
        updateCharacterStatus(nextSpeaker.id, 'idle');
      }, 1000);
    } catch (error) {
      console.error('处理对话轮次失败:', error);
      updateCharacterStatus(nextSpeaker.id, 'error');
      throw error;
    }
  }, [isProcessing, processNextTurnFromHook, updateCharacterStatus]);

  // 暂停/继续对话
  const toggleConversation = useCallback(() => {
    if (!conversation) return;

    const isCurrentlyActive = conversation.isActive;

    const updatedConversation = isCurrentlyActive
      ? pauseConv(conversation)
      : startConv(conversation);

    // 只有在当前不活跃且不在处理中时才继续
    if (!isCurrentlyActive && !isProcessing) {
      setTimeout(() => {
        processNextTurn(updatedConversation);
      }, 500);
    }
  }, [conversation, isProcessing, pauseConv, startConv, processNextTurn]);

  // 重置对话
  const resetConversation = useCallback(() => {
    if (!conversation) return;

    resetConv(conversation);
    // 重置所有角色状态
    characters.forEach(c => {
      updateCharacterStatus(c.id, 'idle');
    });
    setError(null);
  }, [conversation, resetConv, characters, updateCharacterStatus, setError]);

  // 加载对话历史
  const loadConversation = useCallback((conversationData: Conversation) => {
    // 更新对话数据
    updateConversation(conversationData);

    // 加载对话中的角色数据
    if (conversationData.characters && conversationData.characters.length > 0) {
      setCharactersList(conversationData.characters);
    }
  }, [updateConversation, setCharactersList]);

  // 添加预设角色
  const addPresetCharacter = useCallback((
    presetIndex: number,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek',
    model: string,
    apiKey: string
  ) => {
    const newCharacter = createPresetCharacter(presetIndex, apiProvider, model, apiKey);
    addCharacter(newCharacter);
  }, [createPresetCharacter, addCharacter]);

  // 添加自定义角色
  const addCustomCharacterFn = useCallback((
    config: any,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek',
    model: string,
    apiKey: string
  ) => {
    const newCharacter = createCustomCharacter(config, apiProvider, model, apiKey);
    addCharacter(newCharacter);
  }, [createCustomCharacter, addCharacter]);

  // 更新角色API配置
  const updateCharacterApi = useCallback((
    characterId: string,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek',
    model: string,
    apiKey: string
  ) => {
    updateCharacter(characterId, { apiProvider, model, apiKey });
  }, [updateCharacter]);

  // 删除对话
  const deleteConversation = useCallback((id: string) => {
    storageService.deleteConversation(id);
  }, []);

  // 获取所有对话历史
  const getAllConversations = useCallback(() => {
    return storageService.getAllConversations();
  }, []);

  return {
    // 状态
    conversation,
    characters,
    isProcessing,
    error,

    // 对话操作
    startConversation,
    toggleConversation,
    resetConversation,
    processNextTurn,
    loadConversation,
    deleteConversation,
    getAllConversations,

    // 角色操作
    addPresetCharacter,
    addCustomCharacter: addCustomCharacterFn,
    removeCharacter,
    updateCharacter,
    updateCharacterApi,
    updateCharacterStatus,
    getCharacterById,
    clearCharacters,
    validateCharacters,

    // 错误处理
    setError
  };
};

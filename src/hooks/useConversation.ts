import { useState, useCallback } from 'react';
import { Conversation, Message } from '../types';
import { conversationService } from '../services/conversationService';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';

export const useConversation = () => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 创建新对话
  const createConversation = useCallback((topic: string, characters: any[]) => {
    const newConversation = conversationService.createConversation(topic, characters);
    setConversation(newConversation);
    return newConversation;
  }, []);

  // 开始对话
  const startConversation = useCallback((conversation: Conversation) => {
    const started = conversationService.startConversation(conversation);
    setConversation(started);
    storageService.saveConversation(started);
    // 设置为活跃对话
    storageService.setActiveConversation(started.id);
    return started;
  }, []);

  // 暂停对话
  const pauseConversation = useCallback((conversation: Conversation) => {
    const paused = conversationService.pauseConversation(conversation);
    setConversation(paused);
    storageService.saveConversation(paused);
    return paused;
  }, []);

  // 重置对话
  const resetConversation = useCallback((conversation: Conversation) => {
    const reset = conversationService.resetConversation(conversation);
    setConversation(reset);
    storageService.saveConversation(reset);
    return reset;
  }, []);

  // 处理下一轮对话
  const processNextTurn = useCallback(async (conversation: Conversation) => {
    if (!conversation || !conversation.isActive || isProcessing) return;

    // 限制最大轮数
    if (conversation.round >= 10) {
      console.log('已达到最大轮数限制，对话结束');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const nextSpeaker = conversationService.getNextSpeaker(conversation);
      if (!nextSpeaker) {
        setIsProcessing(false);
        return;
      }

      // 获取对话历史
      const history = conversationService.getConversationHistory(conversation);
      const contextMessages = [
        { role: 'user', content: `当前讨论主题: ${conversation.topic}` },
        ...history
      ];

      // 创建临时消息
      const tempMessage: Message = {
        id: Date.now().toString(),
        characterId: nextSpeaker.id,
        content: '',
        timestamp: Date.now(),
        type: 'ai'
      };

      let streamingContent = '';
      const tempConversation = {
        ...conversation,
        currentSpeakingMessage: tempMessage
      };
      setConversation(tempConversation);

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
          setConversation(updatedTempConversation);
        },
        nextSpeaker.customBaseUrl,
        nextSpeaker.model ? [nextSpeaker.model] : undefined
      );

      // 添加完整消息
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

      setConversation(finalConv);
      storageService.saveConversation(finalConv);
      // 确保活跃对话ID正确
      storageService.setActiveConversation(finalConv.id);
      setIsProcessing(false);

      // 如果一轮未完成，继续下一轮
      if (!isRoundComplete && finalConv.isActive && finalConv.round < 10) {
        setTimeout(() => {
          processNextTurn(finalConv);
        }, 1500);
      }
    } catch (error) {
      console.error('处理对话轮次失败:', error);
      setError(error instanceof Error ? error.message : '处理对话失败');
      setIsProcessing(false);

      // 清除当前说话消息
      setConversation(prev => prev ? {
        ...prev,
        currentSpeakingMessage: undefined
      } : null);
    }
  }, [isProcessing]);

  // 更新对话
  const updateConversation = useCallback((updates: Partial<Conversation> | Conversation) => {
    const updated = conversation
      ? { ...conversation, ...updates }
      : updates as Conversation;
    setConversation(updated);
    storageService.saveConversation(updated);
  }, [conversation]);

  // 设置错误
  const setConversationError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  return {
    conversation,
    isProcessing,
    error,
    createConversation,
    startConversation,
    pauseConversation,
    resetConversation,
    processNextTurn,
    updateConversation,
    setError: setConversationError
  };
};


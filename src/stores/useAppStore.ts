import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { UIState } from './uiStore';
import type { APIState } from './apiStore';
import type { CharacterState } from './characterStore';
import type { ConversationState } from './conversationStore';
import { aiService } from '../services/aiService';
import { conversationService } from '../services/conversationService';
import { storageService } from '../services/storageService';

// 组合所有状态类型
export type AppState = UIState & APIState & CharacterState & ConversationState;

// 组合所有动作类型
export type AppActions = UIState & APIState & CharacterState & ConversationState;

// 创建组合 Store
export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        // ==================== UI 状态 ====================
        currentView: 'setup',
        setupView: 'api',
        error: null,
        isLoading: false,
        isProcessing: false,

        setCurrentView: (view) => set({ currentView: view }),
        setSetupView: (view) => set({ setupView: view }),
        setError: (error) => set({ error }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setIsProcessing: (processing) => set({ isProcessing: processing }),

        // ==================== API 状态 ====================
        apiKeys: {},
        defaultModels: {},
        dynamicModels: {},
        isFetchingModels: {},
        modelFetchError: {},

        setApiKeys: (keys) => set({ apiKeys: keys }),
        setDefaultModel: (provider, model) =>
          set((state) => ({
            ...state,
            defaultModels: { ...state.defaultModels, [provider]: model }
          })),
        setDynamicModels: (provider, models) =>
          set((state) => ({
            ...state,
            dynamicModels: { ...state.dynamicModels, [provider]: models }
          })),
        setIsFetchingModels: (provider, fetching) =>
          set((state) => ({
            ...state,
            isFetchingModels: { ...state.isFetchingModels, [provider]: fetching }
          })),
        setModelFetchError: (provider, error) =>
          set((state) => ({
            ...state,
            modelFetchError: { ...state.modelFetchError, [provider]: error }
          })),
        clearModelFetchError: (provider) =>
          set((state) => ({
            ...state,
            modelFetchError: { ...state.modelFetchError, [provider]: null }
          })),

        // ==================== 角色状态 ====================
        characters: [],

        addCharacter: async (presetIndex, apiProvider, model, apiKey, customBaseUrl) => {
          const state = get();
          const { characters } = state;

          if (characters.length >= 3) {
            set((s) => ({ ...s, error: '最多只能选择3个AI角色' }));
            return;
          }

          const { PRESET_CHARACTERS } = await import('../types');
          const preset = PRESET_CHARACTERS[presetIndex];
          const newCharacter: any = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            ...preset,
            apiProvider,
            model,
            apiKey,
            customBaseUrl,
            status: 'idle'
          };

          set((s) => ({
            ...s,
            characters: [...characters, newCharacter],
          }));
        },

        addCustomCharacter: async (config, apiProvider, model, apiKey, customBaseUrl) => {
          const state = get();
          const { characters } = state;

          if (characters.length >= 3) {
            set((s) => ({ ...s, error: '最多只能选择3个AI角色' }));
            return;
          }

          const newCharacter: any = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            ...config,
            apiProvider,
            model,
            apiKey,
            customBaseUrl,
            status: 'idle'
          };

          set((s) => ({
            ...s,
            characters: [...characters, newCharacter],
          }));
        },

        updateCharacter: async (characterId, config, apiProvider, model, apiKey) => {
          set((state) => ({
            ...state,
            characters: state.characters.map((c) =>
              c.id === characterId
                ? { ...c, ...config, apiProvider, model, apiKey }
                : c
            )
          }));
        },

        updateCharacterApi: (characterId, apiProvider, model, apiKey) => {
          set((state) => ({
            ...state,
            characters: state.characters.map((c) =>
              c.id === characterId
                ? { ...c, apiProvider, model, apiKey }
                : c
            )
          }));
        },

        updateCharacterProp: (characterId, updates) => {
          set((state) => ({
            ...state,
            characters: state.characters.map((c) =>
              c.id === characterId ? { ...c, ...updates } : c
            )
          }));
        },

        removeCharacter: (characterId) => {
          set((state) => ({
            ...state,
            characters: state.characters.filter((c) => c.id !== characterId)
          }));
        },

        clearCharacters: () => {
          set((state) => ({ ...state, characters: [] }));
        },

        loadUserConfig: () => {
          const config = storageService.loadUserConfig();
          if (config) {
            set((state) => ({
              ...state,
              apiKeys: config.apiKeys || {},
              characters: config.selectedCharacters || []
            }));
          }
        },

        saveUserConfig: () => {
          const state = get();
          storageService.saveUserConfig({
            apiKeys: state.apiKeys,
            selectedCharacters: state.characters,
            theme: 'arcade'
          });
        },

        // ==================== 对话状态 ====================
        currentConversation: null,
        allConversations: [],

        _handleConversationError: (error) => {
          set((state) => ({
            ...state,
            error: error instanceof Error ? error.message : '操作失败'
          }));
        },

        _updateCharacterStatus: (characterId, status) => {
          // 这个方法在实际使用时会被覆盖
          set((state) => ({
            ...state,
            characters: state.characters.map((c) =>
              c.id === characterId ? { ...c, status } : c
            )
          }));
        },

        startConversation: async (topic) => {
          const state = get();
          const { characters } = state;

          if (characters.length === 0) {
            set((s) => ({ ...s, error: '请先选择至少一个AI角色' }));
            return;
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
            set((s) => ({ ...s, error: validation.errors.join('\n') }));
            return;
          }

          set((s) => ({ ...s, isLoading: true, error: null }));

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

            set((s) => ({
              ...s,
              currentConversation: startedConversation,
              currentView: 'conversation'
            }));

            // 保存配置
            get().saveUserConfig();

            // 开始第一轮对话
            setTimeout(() => {
              get().processNextTurn(startedConversation);
            }, 1000);
          } catch (error) {
            console.error('开始对话失败:', error);
            set((s) => ({
              ...s,
              error: error instanceof Error ? error.message : '开始对话失败'
            }));
          } finally {
            set((s) => ({ ...s, isLoading: false }));
          }
        },

        processNextTurn: async (conversation) => {
          const state = get();
          if (!conversation.isActive || state.isProcessing) return;

          // 限制最大轮数
          if (conversation.round >= 10) {
            console.log('已达到最大轮数限制，对话结束');
            set((s) => ({
              ...s,
              currentConversation: s.currentConversation
                ? { ...s.currentConversation, isActive: false }
                : null,
              isProcessing: false
            }));
            return;
          }

          set((s) => ({ ...s, isProcessing: true }));

          try {
            const nextSpeaker = conversationService.getNextSpeaker(conversation);

            if (!nextSpeaker) {
              console.log('没有可用的发言者');
              set((s) => ({ ...s, isProcessing: false }));
              return;
            }

            // 更新角色状态
            set((s) => ({
              ...s,
              characters: s.characters.map((c) =>
                c.id === nextSpeaker.id
                  ? { ...c, status: 'thinking' as const }
                  : c
              )
            }));

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
            set((s) => ({ ...s, currentConversation: tempConversation }));

            // 更新角色状态为说话中
            set((s) => ({
              ...s,
              characters: s.characters.map((c) =>
                c.id === nextSpeaker.id
                  ? { ...c, status: 'speaking' as const }
                  : c
              )
            }));

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
                set((s) => ({ ...s, currentConversation: updatedTempConversation }));
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

            set((s) => ({ ...s, currentConversation: finalConv }));

            // 保存对话
            storageService.saveConversation(finalConv);
            get().loadConversations();

            // 更新角色状态为闲置
            setTimeout(() => {
              set((s) => ({
                ...s,
                characters: s.characters.map((c) =>
                  c.id === nextSpeaker.id
                    ? { ...c, status: 'idle' as const }
                    : c
                ),
                isProcessing: false
              }));

              // 继续下一轮发言
              if (!isRoundComplete && finalConv.isActive && finalConv.round < 10) {
                setTimeout(() => {
                  get().processNextTurn(finalConv);
                }, 1500);
              }
            }, 1000);
          } catch (error) {
            console.error('处理对话轮次失败:', error);

            // 更新角色状态为错误
            set((s) => ({
              ...s,
              characters: s.characters.map((c) =>
                c.status === 'thinking'
                  ? { ...c, status: 'error' as const }
                  : c
              )
            }));

            // 清除当前说话消息
            set((s) => ({
              ...s,
              currentConversation: s.currentConversation
                ? {
                    ...s.currentConversation,
                    currentSpeakingMessage: undefined
                  }
                : null
            }));

            set((s) => ({
              ...s,
              error: error instanceof Error ? error.message : '处理对话失败',
              isProcessing: false
            }));
          }
        },

        toggleConversation: () => {
          const state = get();
          const { currentConversation } = state;
          if (!currentConversation) return;

          const isCurrentlyActive = currentConversation.isActive;

          const updatedConversation = isCurrentlyActive
            ? conversationService.pauseConversation(currentConversation)
            : conversationService.startConversation(currentConversation);

          set((s) => ({ ...s, currentConversation: updatedConversation }));

          // 只有在当前不活跃且不在处理中时才继续
          if (!isCurrentlyActive && !state.isProcessing) {
            setTimeout(() => {
              get().processNextTurn(updatedConversation);
            }, 500);
          }
        },

        resetConversation: () => {
          const state = get();
          const { currentConversation } = state;
          if (!currentConversation) return;

          const resetConv = conversationService.resetConversation(currentConversation);
          set((s) => ({
            ...s,
            currentConversation: resetConv,
            characters: get().characters.map((c) => ({ ...c, status: 'idle' as const })),
            error: null
          }));
        },

        goBackToSetup: () => {
          set((s) => ({
            ...s,
            currentView: 'setup',
            setupView: 'api',
            currentConversation: null,
            characters: [],
            error: null
          }));
        },

        loadConversation: (conversation) => {
          // 使用对话对象中的角色数据，而不是从用户配置中加载
          const conversationCharacters = conversation.characters || [];

          set((s) => ({
            ...s,
            currentConversation: conversation,
            currentView: 'conversation',
            characters: conversationCharacters.map((c: any) => ({ ...c, status: 'idle' as const }))
          }));
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
          set((s) => ({ ...s, allConversations: conversations }));
        },
      }),
      {
        name: 'ai-conference-storage',
        partialize: (state) => ({
          apiKeys: state.apiKeys,
          characters: state.characters,
          defaultModels: state.defaultModels,
          dynamicModels: state.dynamicModels,
        }),
      }
    ),
    { name: 'app-store' }
  )
);

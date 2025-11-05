import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AICharacter, Conversation, CustomCharacterConfig } from '../types';
import { aiService } from '../services/aiService';
import { conversationService } from '../services/conversationService';
import { storageService } from '../services/storageService';

interface AppState {
  // UI状态
  currentView: 'setup' | 'conversation';
  setupView: 'api' | 'characters';
  error: string | null;

  // 业务状态
  characters: AICharacter[];
  currentConversation: Conversation | null;
  allConversations: Conversation[];
  apiKeys: Record<string, string>;

  // 加载状态
  isLoading: boolean;
  isProcessing: boolean;

  // Actions - UI相关
  setCurrentView: (view: 'setup' | 'conversation') => void;
  setSetupView: (view: 'api' | 'characters') => void;
  setError: (error: string | null) => void;

  // Actions - 数据加载
  loadUserConfig: () => void;
  loadConversations: () => void;
  saveUserConfig: () => void;

  // Actions - 角色管理
  addCharacter: (
    presetIndex: number,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string,
    customBaseUrl?: string
  ) => Promise<void>;
  addCustomCharacter: (
    config: CustomCharacterConfig,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string,
    customBaseUrl?: string
  ) => Promise<void>;
  updateCharacter: (
    characterId: string,
    config: CustomCharacterConfig,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string
  ) => Promise<void>;
  updateCharacterApi: (
    characterId: string,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string
  ) => void;
  updateCharacterProp: (characterId: string, updates: Partial<AICharacter>) => void;
  removeCharacter: (characterId: string) => void;

  // Actions - API配置
  setApiKeys: (keys: Record<string, string>) => void;

  // Actions - 对话管理
  startConversation: (topic: string) => Promise<void>;
  processNextTurn: (conversation: Conversation) => Promise<void>;
  toggleConversation: () => void;
  resetConversation: () => void;
  goBackToSetup: () => void;
  loadConversation: (conversation: Conversation) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        currentView: 'setup',
        setupView: 'api',
        error: null,
        characters: [],
        currentConversation: null,
        allConversations: [],
        apiKeys: {},
        isLoading: false,
        isProcessing: false,

        // Actions - UI相关
        setCurrentView: (view) => set({ currentView: view }),
        setSetupView: (view) => set({ setupView: view }),
        setError: (error) => set({ error }),

        // Actions - 数据加载
        loadUserConfig: () => {
          const config = storageService.loadUserConfig();
          if (config) {
            set({
              apiKeys: config.apiKeys || {},
              characters: config.selectedCharacters || []
            });
          }
        },

        loadConversations: () => {
          const conversations = storageService.getAllConversations();
          set({ allConversations: conversations });
        },

        saveUserConfig: () => {
          const state = get();
          storageService.saveUserConfig({
            apiKeys: state.apiKeys,
            selectedCharacters: state.characters,
            theme: 'arcade'
          });
        },

        // Actions - 角色管理
        addCharacter: async (presetIndex, apiProvider, model, apiKey, customBaseUrl) => {
          const { characters } = get();

          if (characters.length >= 3) {
            set({ error: '最多只能选择3个AI角色' });
            return;
          }

          const { PRESET_CHARACTERS } = await import('../types');
          const preset = PRESET_CHARACTERS[presetIndex];
          const newCharacter: AICharacter = {
            id: Date.now().toString() + Math.random().toString(36).substr(2),
            ...preset,
            apiProvider,
            model,
            apiKey,
            customBaseUrl,
            status: 'idle'
          };

          set({
            characters: [...characters, newCharacter],
            error: null
          });
        },

        addCustomCharacter: async (config, apiProvider, model, apiKey, customBaseUrl) => {
          const { characters } = get();

          if (characters.length >= 3) {
            set({ error: '最多只能选择3个AI角色' });
            return;
          }

          const newCharacter: AICharacter = {
            id: Date.now().toString() + Math.random().toString(36).substr(2),
            ...config,
            apiProvider,
            model,
            apiKey,
            customBaseUrl,
            status: 'idle'
          };

          set({
            characters: [...characters, newCharacter],
            error: null
          });
        },

        updateCharacter: async (characterId, config, apiProvider, model, apiKey) => {
          set((state) => ({
            characters: state.characters.map((c) =>
              c.id === characterId
                ? { ...c, ...config, apiProvider, model, apiKey }
                : c
            )
          }));
        },

        updateCharacterApi: (characterId, apiProvider, model, apiKey) => {
          set((state) => ({
            characters: state.characters.map((c) =>
              c.id === characterId
                ? { ...c, apiProvider, model, apiKey }
                : c
            )
          }));
        },

        updateCharacterProp: (characterId, updates) => {
          set((state) => ({
            characters: state.characters.map((c) =>
              c.id === characterId ? { ...c, ...updates } : c
            )
          }));
        },

        removeCharacter: (characterId) => {
          set((state) => ({
            characters: state.characters.filter((c) => c.id !== characterId)
          }));
        },

        // Actions - API配置
        setApiKeys: (keys) => set({ apiKeys: keys }),

        // Actions - 对话管理
        startConversation: async (topic) => {
          const { characters, saveUserConfig } = get();

          if (characters.length === 0) {
            set({ error: '请先选择至少一个AI角色' });
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
            set({ error: validation.errors.join('\n') });
            return;
          }

          set({ isLoading: true, error: null });

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
              currentView: 'conversation'
            });

            // 保存配置
            saveUserConfig();

            // 开始第一轮对话
            setTimeout(() => {
              get().processNextTurn(startedConversation);
            }, 1000);
          } catch (error) {
            console.error('开始对话失败:', error);
            set({
              error: error instanceof Error ? error.message : '开始对话失败'
            });
          } finally {
            set({ isLoading: false });
          }
        },

        processNextTurn: async (conversation) => {
          const { isProcessing } = get();
          if (!conversation.isActive || isProcessing) return;

          // 限制最大轮数
          if (conversation.round >= 10) {
            console.log('已达到最大轮数限制，对话结束');
            set((state) => ({
              currentConversation: state.currentConversation
                ? { ...state.currentConversation, isActive: false }
                : null,
              isProcessing: false
            }));
            return;
          }

          set({ isProcessing: true });

          try {
            const nextSpeaker = conversationService.getNextSpeaker(conversation);

            if (!nextSpeaker) {
              console.log('没有可用的发言者');
              set({ isProcessing: false });
              return;
            }

            // 更新角色状态
            set((state) => ({
              characters: state.characters.map((c) =>
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
            set({ currentConversation: tempConversation });

            // 更新角色状态为说话中
            set((state) => ({
              characters: state.characters.map((c) =>
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

            // 更新角色状态为闲置
            setTimeout(() => {
              set((state) => ({
                characters: state.characters.map((c) =>
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
            set((state) => ({
              characters: state.characters.map((c) =>
                c.status === 'thinking'
                  ? { ...c, status: 'error' as const }
                  : c
              )
            }));

            // 清除当前说话消息
            set((state) => ({
              currentConversation: state.currentConversation
                ? {
                    ...state.currentConversation,
                    currentSpeakingMessage: undefined
                  }
                : null
            }));

            set({
              error: error instanceof Error ? error.message : '处理对话失败',
              isProcessing: false
            });
          }
        },

        toggleConversation: () => {
          const { currentConversation, isProcessing } = get();
          if (!currentConversation) return;

          const isCurrentlyActive = currentConversation.isActive;

          const updatedConversation = isCurrentlyActive
            ? conversationService.pauseConversation(currentConversation)
            : conversationService.startConversation(currentConversation);

          set({ currentConversation: updatedConversation });

          // 只有在当前不活跃且不在处理中时才继续
          if (!isCurrentlyActive && !isProcessing) {
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
            characters: get().characters.map((c) => ({ ...c, status: 'idle' as const })),
            error: null
          });
        },

        goBackToSetup: () => {
          set({
            currentView: 'setup',
            setupView: 'api',
            currentConversation: null,
            characters: [],
            error: null
          });
        },

        loadConversation: (conversation) => {
          set({
            currentConversation: conversation,
            currentView: 'conversation'
          });

          // 重新加载角色数据
          const config = storageService.loadUserConfig();
          if (config?.selectedCharacters) {
            set({
              characters: config.selectedCharacters.map((c) => ({ ...c, status: 'idle' as const }))
            });
          }
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
        }
      }),
      {
        name: 'ai-conference-storage',
        partialize: (state) => ({
          apiKeys: state.apiKeys,
          characters: state.characters
        })
      }
    ),
    { name: 'app-store' }
  )
);

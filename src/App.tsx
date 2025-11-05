import React, { useState, useEffect, useCallback } from 'react';
import { AICharacter, Conversation, Message, PRESET_CHARACTERS, CustomCharacterConfig } from './types';
import { aiService } from './services/aiService';
import { conversationService } from './services/conversationService';
import { storageService } from './services/storageService';
import CharacterSelector from './components/CharacterSelector';
import ApiConfig from './components/ApiConfig';
import ConversationView from './components/ConversationView';
import ControlPanel from './components/ControlPanel';
import './App.css';

function App() {
  // 状态管理
  const [currentView, setCurrentView] = useState<'setup' | 'conversation'>('setup');
  const [setupView, setSetupView] = useState<'api' | 'characters'>('api');
  const [characters, setCharacters] = useState<AICharacter[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);

  // 初始化加载
  useEffect(() => {
    loadUserConfig();
    loadConversations();
  }, []);

  // 加载所有对话历史
  const loadConversations = () => {
    const conversations = storageService.getAllConversations();
    setAllConversations(conversations);
  };

  // 加载用户配置
  const loadUserConfig = () => {
    const config = storageService.loadUserConfig();
    if (config) {
      setApiKeys(config.apiKeys || {});
      if (config.selectedCharacters && config.selectedCharacters.length > 0) {
        setCharacters(config.selectedCharacters);
      }
    }
  };

  // 保存用户配置
  const saveUserConfig = useCallback(() => {
    storageService.saveUserConfig({
      apiKeys,
      selectedCharacters: characters,
      theme: 'arcade'
    });
  }, [apiKeys, characters]);

  // 创建角色
  const createCharacter = (presetIndex: number, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom', model: string, apiKey: string, customBaseUrl?: string): AICharacter => {
    const preset = PRESET_CHARACTERS[presetIndex];
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      ...preset,
      apiProvider,
      model,
      apiKey,
      customBaseUrl,
      status: 'idle'
    };
  };

  // 创建自定义角色
  const createCustomCharacter = (config: CustomCharacterConfig, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom', model: string, apiKey: string, customBaseUrl?: string): AICharacter => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      ...config,
      apiProvider,
      model,
      apiKey,
      customBaseUrl,
      status: 'idle'
    };
  };

  // 添加角色
  const addCharacter = (presetIndex: number, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string) => {
    if (characters.length >= 3) {
      setError('最多只能选择3个AI角色');
      return;
    }

    const newCharacter = createCharacter(presetIndex, apiProvider, model, apiKey);
    setCharacters(prev => [...prev, newCharacter]);
    setError(null);
  };

  // 添加自定义角色
  const addCustomCharacter = (config: CustomCharacterConfig, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string) => {
    if (characters.length >= 3) {
      setError('最多只能选择3个AI角色');
      return;
    }

    const newCharacter = createCustomCharacter(config, apiProvider, model, apiKey);
    setCharacters(prev => [...prev, newCharacter]);
    setError(null);
  };

  // 更新自定义角色
  const updateCharacter = (characterId: string, config: CustomCharacterConfig, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string) => {
    setCharacters(prev => prev.map(c =>
      c.id === characterId
        ? { ...c, ...config, apiProvider, model, apiKey }
        : c
    ));
  };

  // 移除角色
  const removeCharacter = (characterId: string) => {
    setCharacters(prev => prev.filter(c => c.id !== characterId));
  };

  // 更新角色API配置
  const updateCharacterApi = (characterId: string, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string) => {
    setCharacters(prev => prev.map(c =>
      c.id === characterId
        ? { ...c, apiProvider, model, apiKey }
        : c
    ));
  };

  // 更新单个角色的属性
  const updateCharacterProp = (characterId: string, updates: Partial<AICharacter>) => {
    setCharacters(prev => prev.map(c =>
      c.id === characterId
        ? { ...c, ...updates }
        : c
    ));
  };

  // 开始对话
  const startConversation = async (topic: string) => {
    if (characters.length === 0) {
      setError('请先选择至少一个AI角色');
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
      setError(validation.errors.join('\n'));
      return;
    }

    setIsLoading(true);
    setError(null);

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
      
      setCurrentConversation(startedConversation);
      setCurrentView('conversation');
      
      // 保存配置
      saveUserConfig();
      
      // 开始第一轮对话
      setTimeout(() => {
        processNextTurn(startedConversation);
      }, 1000);
      
    } catch (error) {
      console.error('开始对话失败:', error);
      setError(error instanceof Error ? error.message : '开始对话失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理下一轮对话
  const processNextTurn = async (conversation: Conversation) => {
    if (!conversation.isActive || isProcessing) return;

    // 限制最大轮数，防止无限对话
    if (conversation.round >= 10) {
      console.log('已达到最大轮数限制，对话结束');
      setCurrentConversation(prev => prev ? { ...prev, isActive: false } : null);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      const nextSpeaker = conversationService.getNextSpeaker(conversation);

      if (!nextSpeaker) {
        console.log('没有可用的发言者');
        setIsProcessing(false);
        return;
      }

      // 更新角色状态为思考中
      setCharacters(prev => prev.map(c =>
        c.id === nextSpeaker.id
          ? { ...c, status: 'thinking' as const }
          : c
      ));

      // 获取对话历史
      const history = conversationService.getConversationHistory(conversation);

      // 添加当前主题作为上下文
      const contextMessages = [
        { role: 'user', content: `当前讨论主题: ${conversation.topic}` },
        ...history
      ];

      // 创建临时消息对象（用于流式更新）
      const tempMessage: Message = {
        id: Date.now().toString(),
        characterId: nextSpeaker.id,
        content: '',
        timestamp: Date.now(),
        type: 'ai'
      };

      // 初始化当前说话消息
      let streamingContent = '';
      const tempConversation = {
        ...conversation,
        currentSpeakingMessage: tempMessage
      };
      setCurrentConversation(tempConversation);

      // 更新角色状态为说话中
      setCharacters(prev => prev.map(c =>
        c.id === nextSpeaker.id
          ? { ...c, status: 'speaking' as const }
          : c
      ));

      // 流式调用AI
      await aiService.callAIStream(
        nextSpeaker.apiProvider,
        nextSpeaker.apiKey,
        nextSpeaker.model,
        contextMessages,
        nextSpeaker.systemPrompt,
        (chunk: string) => {
          streamingContent += chunk;

          // 更新临时消息
          const updatedTempMessage = {
            ...tempMessage,
            content: streamingContent
          };

          const updatedTempConversation = {
            ...tempConversation,
            currentSpeakingMessage: updatedTempMessage
          };
          setCurrentConversation(updatedTempConversation);
        },
        nextSpeaker.customBaseUrl,
        nextSpeaker.model ? [nextSpeaker.model] : undefined
      );

      // 流式结束，添加完整消息到对话
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

      // 检查是否完成一轮（所有角色都发言完毕）
      const isRoundComplete = conversationWithIndex.currentSpeakerIndex === 0;

      // 如果完成一轮，增加轮次
      let finalConv = conversationWithIndex;
      if (isRoundComplete) {
        finalConv = {
          ...conversationWithIndex,
          round: conversationWithIndex.round + 1
        };
      }

      setCurrentConversation(finalConv);

      // 保存对话
      storageService.saveConversation(finalConv);
      loadConversations();

      // 短暂延迟后更新状态为闲置
      setTimeout(() => {
        setCharacters(prev => prev.map(c =>
          c.id === nextSpeaker.id
            ? { ...c, status: 'idle' as const }
            : c
        ));
        setIsProcessing(false);

        // 如果一轮未完成，继续下一轮发言（自动进行）
        if (!isRoundComplete && finalConv.isActive && finalConv.round < 10) {
          setTimeout(() => {
            processNextTurn(finalConv);
          }, 1500);
        }
        // 如果一轮完成，停止，等待用户手动触发
      }, 1000);

    } catch (error) {
      console.error('处理对话轮次失败:', error);

      // 更新角色状态为错误
      setCharacters(prev => prev.map(c =>
        c.status === 'thinking'
          ? { ...c, status: 'error' as const }
          : c
      ));

      // 清除当前说话消息
      setCurrentConversation(prev => prev ? {
        ...prev,
        currentSpeakingMessage: undefined
      } : null);

      setError(error instanceof Error ? error.message : '处理对话失败');
      setIsProcessing(false);
    }
  };

  // 暂停/继续对话
  const toggleConversation = () => {
    if (!currentConversation) return;

    const isCurrentlyActive = currentConversation.isActive;

    const updatedConversation = isCurrentlyActive
      ? conversationService.pauseConversation(currentConversation)
      : conversationService.startConversation(currentConversation);

    setCurrentConversation(updatedConversation);

    // 只有在当前不活跃且不在处理中时才继续
    if (!isCurrentlyActive && !isProcessing) {
      setTimeout(() => {
        processNextTurn(updatedConversation);
      }, 500);
    }
  };

  // 重置对话
  const resetConversation = () => {
    if (!currentConversation) return;

    const resetConv = conversationService.resetConversation(currentConversation);
    setCurrentConversation(resetConv);
    setCharacters(prev => prev.map(c => ({ ...c, status: 'idle' as const })));
    setError(null);
  };

  // 返回设置页面
  const goBackToSetup = () => {
    setCurrentView('setup');
    setSetupView('api');
    setCurrentConversation(null);
    setCharacters([]);
    setError(null);
  };

  // 加载历史对话
  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setCurrentView('conversation');

    // 重新加载角色数据（从保存的配置）
    const config = storageService.loadUserConfig();
    if (config?.selectedCharacters) {
      setCharacters(config.selectedCharacters.map(c => ({ ...c, status: 'idle' as const })));
    }
  };

  // 删除历史对话
  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条对话记录吗？')) {
      storageService.deleteConversation(id);
      loadConversations();

      // 如果删除的是当前对话，返回设置页面
      if (currentConversation?.id === id) {
        goBackToSetup();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      {/* 扫描线效果 */}
      <div className="scanline"></div>

      <div className="flex h-screen">
        {/* 左侧侧边栏 */}
        <aside className="w-1/3 bg-gray-800 border-r-2 border-cyan-400 flex flex-col">
          {/* 侧边栏标题 */}
          <div className="bg-gray-900 border-b border-gray-600 p-4">
            <h1 className="text-xl font-bold text-neon-cyan flicker">
              群英会
            </h1>
            <div className="text-neon-pink text-xs mt-1">
              之
            </div>
            <div className="text-neon-green text-xs mt-1">
              我的对手竟然是AI
            </div>
          </div>

          {/* 对话记录列表 */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-300 mb-2">对话记录</h3>
              {allConversations.length > 0 ? (
                <div className="space-y-2">
                  {allConversations
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => loadConversation(conversation)}
                        className={`bg-gray-700 border p-3 rounded text-sm cursor-pointer transition-colors ${
                          currentConversation?.id === conversation.id
                            ? 'border-neon-cyan bg-gray-600'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="font-mono text-neon-cyan truncate mb-1">
                          {conversation.topic}
                        </div>
                        <div className="text-xs text-gray-400 flex justify-between items-center">
                          <span>
                            第 {conversation.round} 轮 • {conversation.messages.length} 条消息
                          </span>
                          <button
                            onClick={(e) => deleteConversation(conversation.id, e)}
                            className="text-red-400 hover:text-red-300 ml-2"
                            title="删除对话"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(conversation.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-500 text-xs text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  暂无对话记录
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏按钮组 */}
          <div className="p-4 border-t border-gray-600 space-y-3">
            <button
              onClick={() => {
                setSetupView('api');
                goBackToSetup();
              }}
              className="pixel-button yellow w-full"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>⚙️</span>
                <span>设置</span>
              </div>
            </button>
            <button
              onClick={() => {
                if (currentConversation) {
                  resetConversation();
                }
                setCurrentView('setup');
                setSetupView('characters');
                setCurrentConversation(null);
                setCharacters([]);
                setError(null);
              }}
              className="pixel-button green w-full"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>💬</span>
                <span>新对话</span>
              </div>
            </button>
          </div>
        </aside>

        {/* 右侧主内容区 */}
        <main className="flex-1 flex flex-col">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-900 border-b-2 border-red-400 text-red-100 p-3">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span className="font-mono text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* 对话内容区 */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentView === 'setup' ? (
              <div className="max-w-4xl mx-auto space-y-8">
                {/* API配置 - 只在 api 视图显示 */}
                {setupView === 'api' && (
                  <ApiConfig
                    apiKeys={apiKeys}
                    onApiKeysChange={setApiKeys}
                  />
                )}

                {/* 角色选择和控制面板 - 只在 characters 视图显示 */}
                {setupView === 'characters' && (
                  <>
                    <CharacterSelector
                      characters={characters}
                      apiKeys={apiKeys}
                      onAddCharacter={addCharacter}
                      onAddCustomCharacter={addCustomCharacter}
                      onRemoveCharacter={removeCharacter}
                      onUpdateCharacterApi={updateCharacterApi}
                      onUpdateCharacter={updateCharacter}
                    />
                    <ControlPanel
                      characters={characters}
                      onStartConversation={startConversation}
                      isLoading={isLoading}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="max-w-5xl mx-auto">
                <ConversationView
                  conversation={currentConversation}
                  characters={characters}
                  onToggleConversation={toggleConversation}
                  onResetConversation={resetConversation}
                  onProcessNextTurn={() => currentConversation && processNextTurn(currentConversation)}
                  onUpdateCharacter={updateCharacterProp}
                  isProcessing={isProcessing}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

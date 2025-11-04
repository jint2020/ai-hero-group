import React, { useState, useEffect, useCallback } from 'react';
import { AICharacter, Conversation, Message, PRESET_CHARACTERS } from './types';
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
  const [characters, setCharacters] = useState<AICharacter[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // 初始化加载
  useEffect(() => {
    loadUserConfig();
  }, []);

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
  const createCharacter = (presetIndex: number, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string): AICharacter => {
    const preset = PRESET_CHARACTERS[presetIndex];
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      ...preset,
      apiProvider,
      model,
      apiKey,
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
          character.model
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

      // 调用AI
      const response = await aiService.callAI(
        nextSpeaker.apiProvider,
        nextSpeaker.apiKey,
        nextSpeaker.model,
        contextMessages,
        nextSpeaker.systemPrompt
      );

      // 更新角色状态为说话中
      setCharacters(prev => prev.map(c => 
        c.id === nextSpeaker.id 
          ? { ...c, status: 'speaking' as const }
          : c
      ));

      // 添加消息到对话
      const updatedConversation = conversationService.addMessage(
        conversation,
        nextSpeaker.id,
        response
      );

      // 更新发言者索引
      const finalConversation = conversationService.updateSpeakerIndex(updatedConversation);
      
      // 如果完成一轮，增加轮次
      if (finalConversation.currentSpeakerIndex === 0) {
        finalConversation.round += 1;
      }

      setCurrentConversation(finalConversation);
      
      // 保存对话
      storageService.saveConversation(finalConversation);

      // 短暂延迟后更新状态为活跃
      setTimeout(() => {
        setCharacters(prev => prev.map(c => 
          c.id === nextSpeaker.id 
            ? { ...c, status: 'idle' as const }
            : c
        ));
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      console.error('处理对话轮次失败:', error);
      
      // 更新角色状态为错误
      setCharacters(prev => prev.map(c => 
        c.status === 'thinking' 
          ? { ...c, status: 'error' as const }
          : c
      ));
      
      setError(error instanceof Error ? error.message : '处理对话失败');
      setIsProcessing(false);
    }
  };

  // 暂停/继续对话
  const toggleConversation = () => {
    if (!currentConversation) return;

    const updatedConversation = currentConversation.isActive
      ? conversationService.pauseConversation(currentConversation)
      : conversationService.startConversation(currentConversation);

    setCurrentConversation(updatedConversation);
    
    if (!currentConversation.isActive) {
      // 继续对话
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
    setCurrentConversation(null);
    setCharacters([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      {/* 扫描线效果 */}
      <div className="scanline"></div>
      
      {/* 标题栏 */}
      <header className="bg-gray-800 border-b-2 border-cyan-400 p-4 shadow-lg shadow-cyan-400/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neon-cyan flicker">
            群英会之我的兄弟叫AI
          </h1>
          <div className="flex items-center space-x-4">
            {currentView === 'conversation' && (
              <button
                onClick={goBackToSetup}
                className="pixel-button"
              >
                返回设置
              </button>
            )}
            <div className="text-neon-green text-sm">
              90年代街机像素风
            </div>
          </div>
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-900 border-2 border-red-400 text-red-100 p-4 m-4 rounded neon-border pink">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span className="font-mono text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto p-4">
        {currentView === 'setup' ? (
          <div className="space-y-8">
            {/* API配置 */}
            <ApiConfig 
              apiKeys={apiKeys}
              onApiKeysChange={setApiKeys}
            />
            
            {/* 角色选择 */}
            <CharacterSelector
              characters={characters}
              apiKeys={apiKeys}
              onAddCharacter={addCharacter}
              onRemoveCharacter={removeCharacter}
              onUpdateCharacterApi={updateCharacterApi}
            />
            
            {/* 控制面板 */}
            <ControlPanel
              characters={characters}
              onStartConversation={startConversation}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <ConversationView
            conversation={currentConversation}
            characters={characters}
            onToggleConversation={toggleConversation}
            onResetConversation={resetConversation}
            onProcessNextTurn={() => currentConversation && processNextTurn(currentConversation)}
            isProcessing={isProcessing}
          />
        )}
      </main>
    </div>
  );
}

export default App;

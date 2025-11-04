import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { CharacterCard } from './components/shared';
import CharacterSelector from './components/CharacterSelector';
import ApiConfig from './components/ApiConfig';
import ConversationView from './components/ConversationView';
import ControlPanel from './components/ControlPanel';
import { useApi } from './hooks/useApi';
import { useConversationController } from './hooks/useConversationController';
import './App.css';

function App() {
  // 视图状态
  const [currentView, setCurrentView] = useState<'setup' | 'conversation'>('setup');
  const [setupView, setSetupView] = useState<'api' | 'characters'>('api');
  const [isLoading, setIsLoading] = useState(false);

  // 使用自定义Hooks
  const {
    apiKeys,
    updateApiKey,
    defaultModels,
    setDefaultModel,
    fetchModels,
    testConnection,
    testResults
  } = useApi();

  const {
    conversation,
    characters,
    isProcessing,
    error,
    startConversation,
    toggleConversation,
    resetConversation,
    processNextTurn,
    loadConversation,
    deleteConversation,
    getAllConversations,
    addPresetCharacter,
    addCustomCharacter,
    removeCharacter,
    updateCharacter,
    updateCharacterApi,
    setError
  } = useConversationController();

  // 加载对话历史
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // 初始化加载
  useEffect(() => {
    const conversations = getAllConversations();
    setAllConversations(conversations);
  }, [getAllConversations]);

  // 获取测试结果图标
  const getTestResultIcon = (provider: string) => {
    const result = testResults[provider];
    switch (result) {
      case 'testing':
        return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>;
      case 'success':
        return <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-green-800 rounded-full"></div>
        </div>;
      case 'error':
        return <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-red-800 rounded-full"></div>
        </div>;
      default:
        return null;
    }
  };

  // 开始对话
  const handleStartConversation = async (topic: string) => {
    setIsLoading(true);
    setError(null);

    const success = await startConversation(topic);

    if (success) {
      setCurrentView('conversation');
      const conversations = getAllConversations();
      setAllConversations(conversations);
      // 设置活跃对话ID
      const latestConversation = conversations.find(c => c.topic === topic);
      if (latestConversation) {
        setActiveConversationId(latestConversation.id);
        storageService.setActiveConversation(latestConversation.id);
      }
    }

    setIsLoading(false);
  };

  // 更新单个 API 密钥的包装函数
  const updateApiKeys = (keys: Record<string, string>) => {
    Object.entries(keys).forEach(([provider, key]) => {
      updateApiKey(provider, key);
    });
  };


  // 返回设置页面
  const goBackToSetup = () => {
    setCurrentView('setup');
    setSetupView('api');
    setError(null);
  };

  // 加载历史对话
  const handleLoadConversation = (conversationData: any) => {
    loadConversation(conversationData);
    setCurrentView('conversation');
    setActiveConversationId(conversationData.id);
    storageService.setActiveConversation(conversationData.id);
  };

  // 删除历史对话
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条对话记录吗？')) {
      deleteConversation(id);
      const conversations = getAllConversations();
      setAllConversations(conversations);

      // 如果删除的是当前对话，返回设置页面
      if (conversation?.id === id) {
        goBackToSetup();
        setActiveConversationId(null);
        storageService.setActiveConversation(null);
      }

      // 如果删除的是活跃对话，清除活跃状态
      if (activeConversationId === id) {
        setActiveConversationId(null);
        storageService.setActiveConversation(null);
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
              我的兄弟叫AI
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
                        onClick={() => handleLoadConversation(conversation)}
                        className={`bg-gray-700 border p-3 rounded text-sm cursor-pointer transition-colors ${
                          conversation.id === activeConversationId
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
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
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
                if (conversation) {
                  resetConversation();
                }
                setCurrentView('setup');
                setSetupView('characters');
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
                    onApiKeysChange={updateApiKeys}
                  />
                )}

                {/* 角色选择和控制面板 - 只在 characters 视图显示 */}
                {setupView === 'characters' && (
                  <>
                    <CharacterSelector
                      characters={characters}
                      apiKeys={apiKeys}
                      onAddCharacter={addPresetCharacter}
                      onAddCustomCharacter={addCustomCharacter}
                      onRemoveCharacter={removeCharacter}
                      onUpdateCharacterApi={updateCharacterApi}
                      onUpdateCharacter={updateCharacter}
                    />
                    <ControlPanel
                      characters={characters}
                      onStartConversation={handleStartConversation}
                      isLoading={isLoading}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="max-w-5xl mx-auto">
                <ConversationView
                  conversation={conversation}
                  characters={characters}
                  onToggleConversation={toggleConversation}
                  onResetConversation={resetConversation}
                  onProcessNextTurn={() => conversation && processNextTurn(conversation)}
                  onUpdateCharacter={updateCharacter}
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

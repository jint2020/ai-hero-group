import React from 'react';
import { useAppStore } from '../store/useAppStore';
import ApiConfig from './ApiConfig';
import CharacterSelector from './CharacterSelector';
import ControlPanel from './ControlPanel';

const SetupView: React.FC = () => {
  const { setupView, apiKeys, setApiKeys } = useAppStore();

  return (
    <div className='flex h-screen w-full'>
      {/* 左侧侧边栏 - 对话记录 */}
      <aside className='w-1/3 bg-gray-800 border-r-2 border-cyan-400 flex flex-col'>
        {/* 侧边栏标题 */}
        <div className='bg-gray-900 border-b border-gray-600 p-4'>
          <h1 className='text-xl font-bold text-neon-cyan flicker'>
            群英会
          </h1>
          <div className='text-neon-pink text-xs mt-1'>
            之
          </div>
          <div className='text-neon-green text-xs mt-1'>
            我的对手竟然是AI
          </div>
        </div>

        {/* 对话记录列表 */}
        <ConversationHistory />
      </aside>

      {/* 右侧主内容区 */}
      <main className='flex-1 flex flex-col overflow-hidden'>
        <div className='flex-1 overflow-y-auto p-6'>
          <div className='max-w-4xl mx-auto space-y-8'>
            {setupView === 'api' ? (
              <ApiConfig
                apiKeys={apiKeys}
                onApiKeysChange={setApiKeys}
              />
            ) : (
              <>
                <CharacterSelector />
                <ControlPanel />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// 独立组件：对话记录列表
const ConversationHistory: React.FC = () => {
  const { allConversations, currentConversation, loadConversation, deleteConversation } = useAppStore();

  return (
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
  );
};

export default SetupView;

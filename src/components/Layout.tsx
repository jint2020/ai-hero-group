import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import ConversationView from './ConversationView';
import ResizableDivider from './ui/ResizableDivider';
import { useSidebarWidth } from '../hooks/useSidebarWidth';

const Layout: React.FC = () => {
  const { allConversations, currentConversation, loadConversation, deleteConversation, goBackToSetup, setCurrentView, setSetupView, clearCharacters } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarWidth, updateSidebarWidth } = useSidebarWidth();

  return (
    <div className="flex h-screen w-full relative resizable-container">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 左侧侧边栏 - 对话记录 */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full
          bg-gray-800 border-r-2 border-cyan-400 flex flex-col
          transform transition-transform duration-300 ease-in-out z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          // 移动端：使用动态宽度
          // PC端（lg:）：使用存储的宽度
          width: sidebarOpen
            ? `${Math.min(sidebarWidth, window.innerWidth * 0.85)}px`
            : typeof window !== 'undefined' && window.innerWidth >= 1024
              ? `${sidebarWidth}px`
              : undefined
        }}
      >
        {/* 侧边栏内容容器 */}
        <div className="flex flex-col h-full" style={{ width: '100%' }}>
          {/* 侧边栏标题 */}
          <div className="bg-gray-900 border-b border-gray-600 p-4 flex-shrink-0">
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
                        onClick={() => {
                          loadConversation(conversation);
                          setSidebarOpen(false);
                        }}
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

          {/* 移动端侧边栏头部 */}
          <div className="lg:hidden flex items-center justify-between p-4 border-t border-gray-600 flex-shrink-0">
            <span className="text-sm font-bold text-gray-300">对话记录</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
              aria-label="关闭侧边栏"
            >
              ✕
            </button>
          </div>

          {/* 侧边栏按钮组 */}
          <div className="p-4 border-t border-gray-600 space-y-3 flex-shrink-0">
            <button
              onClick={() => {
                // 清空角色数据并切换到角色配置页面
                clearCharacters();
                setCurrentView('setup');
                setSetupView('characters');
                setSidebarOpen(false);
              }}
              className="pixel-button green w-full"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>💬</span>
                <span>开始新对话</span>
              </div>
            </button>
            <button
              onClick={() => {
                goBackToSetup();
                setSidebarOpen(false);
              }}
              className="pixel-button yellow w-full"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>⚙️</span>
                <span>设置</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* PC端可调整分隔条 */}
      <div className="hidden lg:block">
        <ResizableDivider
          onResize={updateSidebarWidth}
          initialWidth={sidebarWidth}
          minWidth={200}
          maxWidth={600}
        />
      </div>

      {/* 右侧主内容区 - 对话视图 */}
      <main className="flex-1 flex flex-col overflow-hidden flex-grow min-w-0 bg-gray-900">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-6">
            <ConversationView onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;

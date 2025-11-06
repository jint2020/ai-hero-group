import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  variant?: 'conversation' | 'setup';
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  variant = 'conversation',
  sidebarOpen,
  onToggleSidebar
}) => {
  const {
    allConversations,
    currentConversation,
    loadConversation,
    deleteConversation,
    setCurrentView,
    setSetupView,
    clearCharacters,
    goBackToSetup,
    setError,
    setupView,
  } = useAppStore();

  return (
    <>
      {/* 移动端遮罩层 */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-40",
          // 只有在移动端且侧边栏打开时才显示遮罩层
          sidebarOpen ? "block lg:hidden" : "hidden"
        )}
        onClick={onToggleSidebar}
      />

      <div
        className={cn(
          "flex flex-col h-full bg-gray-800 border-r-2 border-cyan-400",
          // 移动端：固定定位，桌面端：静态定位
          "lg:relative fixed top-0 left-0 z-50 w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:transform-none",
          // 移动端隐藏时使用 translate-x-full，桌面端和显示时不使用
          !sidebarOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* 侧边栏标题 */}
        <div className="bg-gray-900 border-b border-gray-600 p-4 flex-shrink-0">
          <h1 className="text-xl font-bold text-neon-cyan flicker">群英会</h1>
          <div className="text-neon-pink text-xs mt-1">之</div>
          <div className="text-neon-green text-xs mt-1">我的对手竟然是AI</div>

          {/* 移动端关闭按钮 - 使用响应式类 */}
          <button
            onClick={onToggleSidebar}
            className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
            aria-label="关闭侧边栏"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">
          {variant === 'conversation' ? (
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
                          // 移动端点击后关闭侧边栏
                          onToggleSidebar?.();
                        }}
                        className={cn(
                          "bg-gray-700 border p-3 rounded text-sm cursor-pointer transition-colors hover:border-gray-500",
                          currentConversation?.id === conversation.id
                            ? "border-neon-cyan bg-gray-600"
                            : "border-gray-600"
                        )}
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
                          {new Date(conversation.createdAt).toLocaleString("zh-CN")}
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
          ) : (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-300 mb-2">设置选项</h3>
              <div className="space-y-2">
                <button
                  onClick={() => useAppStore.setState({ setupView: 'api' })}
                  className={cn(
                    "w-full bg-gray-700 border p-3 rounded text-sm cursor-pointer transition-colors hover:border-gray-500",
                    setupView === 'api' ? "border-neon-cyan bg-gray-600" : "border-gray-600"
                  )}
                >
                  <div className="text-neon-cyan font-mono">⚙️ API配置</div>
                  <div className="text-xs text-gray-400 mt-1">配置您的API密钥</div>
                </button>

                <button
                  onClick={() => useAppStore.setState({ setupView: 'characters' })}
                  className={cn(
                    "w-full bg-gray-700 border p-3 rounded text-sm cursor-pointer transition-colors hover:border-gray-500",
                    setupView === 'characters' ? "border-neon-cyan bg-gray-600" : "border-gray-600"
                  )}
                >
                  <div className="text-neon-cyan font-mono">👥 角色设置</div>
                  <div className="text-xs text-gray-400 mt-1">添加和配置AI角色</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮组 */}
        {variant === 'conversation' && (
          <div className="p-4 border-t border-gray-600 space-y-3 flex-shrink-0">
            <button
              onClick={() => {
                setCurrentView('setup');
                setSetupView('characters');
                useAppStore.setState({ currentConversation: null });
                clearCharacters();
                setError(null);
                // 移动端操作后关闭侧边栏
                onToggleSidebar?.();
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
                onToggleSidebar?.();
              }}
              className="pixel-button yellow w-full"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>⚙️</span>
                <span>设置</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AppSidebar;

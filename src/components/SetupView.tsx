import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import ApiConfig from './ApiConfig';
import CharacterSelector from './CharacterSelector';
import ControlPanel from './ControlPanel';
import ResizableDivider from './ui/ResizableDivider';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import Sidebar from './Sidebar';

const SetupView: React.FC = () => {
  const { setupView, apiKeys, setApiKeys } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarWidth, updateSidebarWidth } = useSidebarWidth();

  return (
    <div className='flex h-screen w-full relative resizable-container'>
      {/* 侧边栏 */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarWidth={sidebarWidth}
        context="setup"
      />

      {/* PC端可调整分隔条 */}
      <div className='hidden lg:block'>
        <ResizableDivider
          onResize={updateSidebarWidth}
          initialWidth={sidebarWidth}
          minWidth={200}
          maxWidth={600}
        />
      </div>

      {/* 右侧主内容区 */}
      <main className='flex-1 flex flex-col overflow-hidden flex-grow min-w-0 bg-gray-900'>
        <div className='flex-1 overflow-y-auto'>
          <div className='max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-8'>
            {/* 移动端顶部导航栏 */}
            <div className='lg:hidden flex items-center justify-between mb-4'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors'
                aria-label='打开侧边栏'
              >
                <svg
                  className='w-6 h-6 text-neon-cyan'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              </button>
              <h2 className='text-lg font-bold text-neon-cyan'>
                {setupView === 'api' ? 'API配置' : '角色设置'}
              </h2>
              <div className='w-10' /> {/* 占位符 */}
            </div>
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

export default SetupView;

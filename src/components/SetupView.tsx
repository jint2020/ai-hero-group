import React, { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import ApiConfig from './ApiConfig';
import CharacterSelector from './CharacterSelector';
import ControlPanel from './ControlPanel';
import ResizablePanelGroup from './ui/resizable-panel';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import Sidebar from './Sidebar';

const SetupView: React.FC = () => {
  const { setupView, apiKeys, setApiKeys } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true); // 桌面端默认显示
  const { sidebarWidth, updateSidebarWidth } = useSidebarWidth();

  const leftContent = (
    <Sidebar
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      sidebarWidth={sidebarWidth}
      context="setup"
    />
  );

  const rightContent = (
    <div className='flex-1 flex flex-col overflow-hidden bg-gray-900 h-full'>
      <div className='flex-1 overflow-y-auto min-h-0'>
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
    </div>
  );

  return (
    <div className='h-screen w-full'>
      <ResizablePanelGroup
        leftContent={leftContent}
        rightContent={rightContent}
        onResize={updateSidebarWidth}
        initialWidth={sidebarWidth}
        minWidth={200}
        maxWidth={600}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
};

export default SetupView;

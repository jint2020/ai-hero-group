import React, { useState } from 'react';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import Sidebar from './Sidebar';
import ResizableDivider from './ui/ResizableDivider';
import ConversationView from './ConversationView';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarWidth, updateSidebarWidth } = useSidebarWidth();

  return (
    <div className="flex h-screen w-full relative resizable-container">
      {/* 侧边栏 */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarWidth={sidebarWidth}
        context="conversation"
      />

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

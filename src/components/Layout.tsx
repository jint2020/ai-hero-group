import React, { useState } from 'react';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import Sidebar from './Sidebar';
import ResizablePanelGroup from './ui/resizable-panel';
import ConversationView from './ConversationView';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // 桌面端默认显示
  const { sidebarWidth, updateSidebarWidth } = useSidebarWidth();

  const leftContent = (
    <Sidebar
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      sidebarWidth={sidebarWidth}
      context="conversation"
    />
  );

  const rightContent = (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900 h-full">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <ConversationView onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full">
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

export default Layout;

import React, { ReactNode } from 'react';

import { useSidebarWidth } from '@/hooks/useSidebarWidth';
import AppSidebar from '@/components/AppSidebar';
import ResizablePanelGroup from '@/components/ui/resizable-panel';

interface MainLayoutProps {
  children: ReactNode;
  sidebarVariant?: 'conversation' | 'setup';
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebarVariant = 'conversation' }) => {
  // 桌面端默认显示，移动端默认隐藏
  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const { updateSidebarWidth, getCurrentWidth } = useSidebarWidth();

  // Update width percentage when sidebar state changes
  React.useEffect(() => {
    const currentWidth = getCurrentWidth();
    updateSidebarWidth(currentWidth, sidebarOpen);
  }, [sidebarOpen]);

  // Listen for custom toggle event from page headers
  React.useEffect(() => {
    const handleToggle = () => {
      setSidebarOpen(prev => {
        const newState = !prev;
        // Update width percentage after state change
        setTimeout(() => {
          const currentWidth = getCurrentWidth();
          updateSidebarWidth(currentWidth, newState);
        }, 0);
        return newState;
      });
    };

    window.addEventListener('toggle-sidebar', handleToggle);
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
    };
  }, [updateSidebarWidth, getCurrentWidth]);

  // Handle window resize to update width percentage
  React.useEffect(() => {
    const handleResize = () => {
      const currentWidth = getCurrentWidth();
      updateSidebarWidth(currentWidth, sidebarOpen);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen, updateSidebarWidth, getCurrentWidth]);

  const leftContent = (
    <AppSidebar
      variant={sidebarVariant}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    />
  );

  const rightContent = (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900 h-full">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          {children}
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
        initialWidth={getCurrentWidth()}
        minWidth={200}
        maxWidth={600}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
};

export default MainLayout;

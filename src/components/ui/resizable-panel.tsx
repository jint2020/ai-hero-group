import React, { useState, useEffect } from 'react';
import {
  ResizablePanelGroup as PanelGroup,
  ResizablePanel as Panel,
  ResizableHandle,
} from './resizable';
import { cn } from '@/lib/utils';

interface ResizablePanelGroupProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  onResize: (width: number) => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  showHandle?: boolean;
  totalWidth?: number;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ResizablePanelGroup: React.FC<ResizablePanelGroupProps> = ({
  leftContent,
  rightContent,
  onResize,
  initialWidth = 320,
  minWidth = 200,
  maxWidth = 600,
  className,
  showHandle = true,
  totalWidth: propTotalWidth,
  sidebarOpen,
  onToggleSidebar
}) => {
  const [totalWidth, setTotalWidth] = useState(propTotalWidth || 1920);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!propTotalWidth) {
      const updateDimensions = () => {
        const width = window.innerWidth;
        setTotalWidth(width);
        // 检测是否为移动端（< 1024px）
        setIsMobile(width < 1024);
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    } else {
      setIsMobile(propTotalWidth < 1024);
    }
  }, [propTotalWidth]);

  const handleResize = (panelSizes: number[]) => {
    if (panelSizes.length > 0 && onResize) {
      const percentage = panelSizes[0];
      const pixelWidth = (percentage / 100) * totalWidth;
      onResize(Math.round(pixelWidth));
    }
  };

  const defaultSizePercentage = Math.min(
    100,
    Math.max(0, (initialWidth / totalWidth) * 100)
  );
  const minSizePercentage = Math.min(
    100,
    Math.max(0, (minWidth / totalWidth) * 100)
  );
  const maxSizePercentage = Math.min(
    100,
    Math.max(0, (maxWidth / totalWidth) * 100)
  );

  // 根据屏幕尺寸渲染不同布局
  if (isMobile) {
    // 移动端布局：同时渲染主内容和侧边栏，由Sidebar自己控制显示
    // 在移动端使用约束宽度（不超过屏幕宽度的85%，最小200px）
    const maxAllowedWidth = Math.floor(totalWidth * 0.85);
    const constrainedWidth = Math.min(initialWidth, Math.max(minWidth, maxAllowedWidth));
    // 在移动端临时设置CSS变量以限制宽度
    const originalStyle = document.documentElement.style.getPropertyValue('--sidebar-width');
    document.documentElement.style.setProperty('--sidebar-width', `${constrainedWidth}px`);

    const result = (
      <div className="h-full w-full relative">
        <div className="h-full w-full">
          {rightContent}
        </div>
        {React.cloneElement(leftContent as React.ReactElement, {
          sidebarOpen,
          onToggleSidebar
        })}
      </div>
    );

    // 恢复原始宽度
    if (originalStyle) {
      document.documentElement.style.setProperty('--sidebar-width', originalStyle);
    } else {
      document.documentElement.style.removeProperty('--sidebar-width');
    }

    return result;
  }

  // 桌面端布局：使用 ResizablePanelGroup
  return (
    <PanelGroup
      direction="horizontal"
      onLayout={handleResize}
      className={cn("h-full w-full", className)}
    >
      <Panel
        defaultSize={defaultSizePercentage}
        minSize={minSizePercentage}
        maxSize={maxSizePercentage}
        className="bg-gray-900"
      >
        {leftContent}
      </Panel>
      {showHandle && (
        <ResizableHandle className="relative flex w-1 items-center justify-center bg-gray-600 hover:bg-cyan-400 transition-colors duration-200 after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-0.5 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 dark:bg-zinc-800" />
      )}
      <Panel>
        {rightContent}
      </Panel>
    </PanelGroup>
  );
};

export default ResizablePanelGroup;
export type { ResizablePanelGroupProps };

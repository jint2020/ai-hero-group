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

  // Get percentage from CSS variable, fallback to initialWidth
  const getInitialPercentage = () => {
    if (typeof document !== 'undefined') {
      const cssValue = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-percentage');
      if (cssValue) {
        const percentage = parseFloat(cssValue);
        if (!isNaN(percentage) && percentage >= 0) {
          return percentage;
        }
      }
    }
    return Math.min(100, Math.max(0, (initialWidth / totalWidth) * 100));
  };

  const defaultSizePercentage = getInitialPercentage();
  const minSizePercentage = Math.min(
    100,
    Math.max(0, (minWidth / totalWidth) * 100)
  );
  const maxSizePercentage = Math.min(
    100,
    Math.max(0, (maxWidth / totalWidth) * 100)
  );

  // Watch for CSS variable changes and update width
  React.useEffect(() => {
    const updateWidthFromCSSVariable = () => {
      const cssValue = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-percentage');
      if (cssValue) {
        const percentage = parseFloat(cssValue);
        if (!isNaN(percentage) && percentage >= 0) {
          const pixelWidth = (percentage / 100) * totalWidth;
          onResize(Math.round(pixelWidth));
        }
      }
    };

    // Observe CSS variable changes
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            updateWidthFromCSSVariable();
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style']
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [onResize, totalWidth]);

  // 根据屏幕尺寸渲染不同布局
  if (isMobile) {
    // 移动端布局：直接渲染右侧内容，AppSidebar 自己处理显示
    return <div className="h-full w-full">{rightContent}</div>;
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

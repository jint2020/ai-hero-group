import { useState, useEffect } from 'react';

const SIDEBAR_WIDTH_KEY = 'ai-conference-sidebar-width';
const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;

export const useSidebarWidth = () => {
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    // 从localStorage读取保存的宽度
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      if (savedWidth) {
        const width = parseInt(savedWidth, 10);
        if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
          return width;
        }
      }
    }
    return DEFAULT_WIDTH;
  });

  const updateSidebarWidth = (width: number) => {
    const clampedWidth = Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
    setSidebarWidth(clampedWidth);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, clampedWidth.toString());
  };

  const resetSidebarWidth = () => {
    setSidebarWidth(DEFAULT_WIDTH);
    localStorage.removeItem(SIDEBAR_WIDTH_KEY);
  };

  return {
    sidebarWidth,
    updateSidebarWidth,
    resetSidebarWidth,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH
  };
};

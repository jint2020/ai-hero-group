const SIDEBAR_WIDTH_KEY = 'ai-conference-sidebar-width';
const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 200;
const MAX_WIDTH = 600;

const getStoredWidth = (): number => {
  if (typeof window === 'undefined') {
    return DEFAULT_WIDTH;
  }
  const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);
  if (savedWidth) {
    const width = parseInt(savedWidth, 10);
    if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
      return width;
    }
  }
  return DEFAULT_WIDTH;
};

const updateCSSVariable = (width: number) => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
  }
};

export const useSidebarWidth = () => {
  // 初始化CSS变量
  if (typeof window !== 'undefined') {
    const storedWidth = getStoredWidth();
    updateCSSVariable(storedWidth);
  }

  const updateSidebarWidth = (width: number) => {
    const clampedWidth = Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
    updateCSSVariable(clampedWidth);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, clampedWidth.toString());
  };

  const resetSidebarWidth = () => {
    updateCSSVariable(DEFAULT_WIDTH);
    localStorage.removeItem(SIDEBAR_WIDTH_KEY);
  };

  // 提供获取当前宽度的方法（从CSS变量或localStorage）
  const getCurrentWidth = (): number => {
    if (typeof window === 'undefined') {
      return DEFAULT_WIDTH;
    }
    const cssValue = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width');
    if (cssValue) {
      const width = parseInt(cssValue, 10);
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        return width;
      }
    }
    return getStoredWidth();
  };

  return {
    updateSidebarWidth,
    resetSidebarWidth,
    getCurrentWidth,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH
  };
};

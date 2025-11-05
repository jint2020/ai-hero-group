import { StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * UI Store - 管理所有与用户界面相关的状态
 * 包括：当前视图、设置视图、错误状态、加载状态
 */
export interface UIState {
  // UI状态
  currentView: 'setup' | 'conversation';
  setupView: 'api' | 'characters';
  error: string | null;
  isLoading: boolean;
  isProcessing: boolean;

  // Actions
  setCurrentView: (view: 'setup' | 'conversation') => void;
  setSetupView: (view: 'api' | 'characters') => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
}

/**
 * 创建 UI Store 的 Creator 函数
 */
export const createUIStore: StateCreator<
  UIState,
  [],
  [],
  UIState
> = (set) => ({
  // 初始状态
  currentView: 'setup',
  setupView: 'api',
  error: null,
  isLoading: false,
  isProcessing: false,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setSetupView: (view) => set({ setupView: view }),
  setError: (error) => set({ error }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
});

/**
 * 带 devtools 的 UI Store Creator
 */
export const createUIStoreWithDevtools = devtools(createUIStore, {
  name: 'ui-store',
});

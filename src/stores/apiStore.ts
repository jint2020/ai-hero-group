import { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

/**
 * API Store - 管理所有与API配置相关的状态
 * 包括：API密钥、默认模型、模型列表
 */
export interface APIState {
  // API状态
  apiKeys: Record<string, string>;
  defaultModels: Record<string, string>;
  dynamicModels: Record<string, string[]>;
  isFetchingModels: Record<string, boolean>;
  modelFetchError: Record<string, string | null>;

  // Actions
  setApiKeys: (keys: Record<string, string>) => void;
  setDefaultModel: (provider: string, model: string) => void;
  setDynamicModels: (provider: string, models: string[]) => void;
  setIsFetchingModels: (provider: string, fetching: boolean) => void;
  setModelFetchError: (provider: string, error: string | null) => void;
  clearModelFetchError: (provider: string) => void;
}

/**
 * 创建 API Store 的 Creator 函数
 */
export const createAPIStore: StateCreator<
  APIState,
  [],
  [],
  APIState
> = (set) => ({
  // 初始状态
  apiKeys: {},
  defaultModels: {},
  dynamicModels: {},
  isFetchingModels: {},
  modelFetchError: {},

  // Actions
  setApiKeys: (keys) => set({ apiKeys: keys }),
  setDefaultModel: (provider, model) =>
    set((state) => ({
      ...state,
      defaultModels: { ...state.defaultModels, [provider]: model }
    })),
  setDynamicModels: (provider, models) =>
    set((state) => ({
      ...state,
      dynamicModels: { ...state.dynamicModels, [provider]: models }
    })),
  setIsFetchingModels: (provider, fetching) =>
    set((state) => ({
      ...state,
      isFetchingModels: { ...state.isFetchingModels, [provider]: fetching }
    })),
  setModelFetchError: (provider, error) =>
    set((state) => ({
      ...state,
      modelFetchError: { ...state.modelFetchError, [provider]: error }
    })),
  clearModelFetchError: (provider) =>
    set((state) => ({
      ...state,
      modelFetchError: { ...state.modelFetchError, [provider]: null }
    })),
});

/**
 * 带 persist 和 devtools 的 API Store Creator
 * API 密钥需要持久化存储
 */
export const createAPIStoreWithPersist = persist(
  createAPIStore,
  {
    name: 'ai-conference-api-storage',
    partialize: (state) => ({
      apiKeys: state.apiKeys,
      defaultModels: state.defaultModels,
      dynamicModels: state.dynamicModels,
    }),
  }
);

/**
 * 带 devtools 的 API Store Creator
 */
export const createAPIStoreWithDevtools = devtools(createAPIStore, {
  name: 'api-store',
});

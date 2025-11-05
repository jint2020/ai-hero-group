import { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { AICharacter, CustomCharacterConfig } from '../types';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

/**
 * Character Store - 管理所有与角色相关的状态
 * 包括：角色列表、角色操作
 */
export interface CharacterState {
  // 角色状态
  characters: AICharacter[];

  // Actions - 角色管理
  addCharacter: (
    presetIndex: number,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string,
    customBaseUrl?: string
  ) => Promise<void>;
  addCustomCharacter: (
    config: CustomCharacterConfig,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string,
    customBaseUrl?: string
  ) => Promise<void>;
  updateCharacter: (
    characterId: string,
    config: CustomCharacterConfig,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string
  ) => Promise<void>;
  updateCharacterApi: (
    characterId: string,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string
  ) => void;
  updateCharacterProp: (characterId: string, updates: Partial<AICharacter>) => void;
  removeCharacter: (characterId: string) => void;
  clearCharacters: () => void;

  // Actions - 配置管理
  loadUserConfig: () => void;
  saveUserConfig: () => void;
}

/**
 * 创建 Character Store 的 Creator 函数
 */
export const createCharacterStore: StateCreator<
  CharacterState,
  [],
  [],
  CharacterState
> = (set, get) => ({
  // 初始状态
  characters: [],

  // Actions - 角色管理
  addCharacter: async (presetIndex, apiProvider, model, apiKey, customBaseUrl) => {
    const { characters } = get();

    if (characters.length >= 3) {
      throw new Error('最多只能选择3个AI角色');
    }

    const { PRESET_CHARACTERS } = await import('../types');
    const preset = PRESET_CHARACTERS[presetIndex];
    const newCharacter: AICharacter = {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      ...preset,
      apiProvider,
      model,
      apiKey,
      customBaseUrl,
      status: 'idle'
    };

    set({
      characters: [...characters, newCharacter],
    });

    // 自动保存配置
    get().saveUserConfig();
  },

  addCustomCharacter: async (config, apiProvider, model, apiKey, customBaseUrl) => {
    const { characters } = get();

    if (characters.length >= 3) {
      throw new Error('最多只能选择3个AI角色');
    }

    const newCharacter: AICharacter = {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      ...config,
      apiProvider,
      model,
      apiKey,
      customBaseUrl,
      status: 'idle'
    };

    set({
      characters: [...characters, newCharacter],
    });

    // 自动保存配置
    get().saveUserConfig();
  },

  updateCharacter: async (characterId, config, apiProvider, model, apiKey) => {
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === characterId
          ? { ...c, ...config, apiProvider, model, apiKey }
          : c
      )
    }));

    // 保存配置
    get().saveUserConfig();
  },

  updateCharacterApi: (characterId, apiProvider, model, apiKey) => {
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === characterId
          ? { ...c, apiProvider, model, apiKey }
          : c
      )
    }));
  },

  updateCharacterProp: (characterId, updates) => {
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === characterId ? { ...c, ...updates } : c
      )
    }));
  },

  removeCharacter: (characterId) => {
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== characterId)
    }));

    // 保存配置
    get().saveUserConfig();
  },

  clearCharacters: () => {
    set({ characters: [] });
  },

  // Actions - 配置管理
  loadUserConfig: () => {
    const config = storageService.loadUserConfig();
    if (config) {
      set({
        characters: config.selectedCharacters || []
      });
    }
  },

  saveUserConfig: () => {
    const state = get();
    storageService.saveUserConfig({
      apiKeys: {}, // API 密钥由 apiStore 管理
      selectedCharacters: state.characters,
      theme: 'arcade'
    });
  },
});

/**
 * 带 persist 和 devtools 的 Character Store Creator
 * 角色数据需要持久化存储
 */
export const createCharacterStoreWithPersist = persist(
  createCharacterStore,
  {
    name: 'ai-conference-character-storage',
    partialize: (state) => ({
      characters: state.characters,
    }),
  }
);

/**
 * 带 devtools 的 Character Store Creator
 */
export const createCharacterStoreWithDevtools = devtools(createCharacterStore, {
  name: 'character-store',
});

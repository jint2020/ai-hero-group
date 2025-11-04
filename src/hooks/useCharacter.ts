import { useState, useCallback } from 'react';
import { AICharacter, PRESET_CHARACTERS, CustomCharacterConfig } from '../types';

export const useCharacter = () => {
  const [characters, setCharacters] = useState<AICharacter[]>([]);

  // 创建预设角色
  const createPresetCharacter = useCallback((
    presetIndex: number,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string,
    customBaseUrl?: string
  ): AICharacter => {
    const preset = PRESET_CHARACTERS[presetIndex];
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      ...preset,
      apiProvider,
      model,
      apiKey,
      customBaseUrl,
      status: 'idle'
    };
  }, []);

  // 创建自定义角色
  const createCustomCharacter = useCallback((
    config: CustomCharacterConfig,
    apiProvider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    model: string,
    apiKey: string,
    customBaseUrl?: string
  ): AICharacter => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      ...config,
      apiProvider,
      model,
      apiKey,
      customBaseUrl,
      status: 'idle'
    };
  }, []);

  // 添加角色
  const addCharacter = useCallback((character: AICharacter) => {
    if (characters.length >= 3) {
      throw new Error('最多只能选择3个AI角色');
    }
    setCharacters(prev => [...prev, character]);
  }, [characters.length]);

  // 移除角色
  const removeCharacter = useCallback((characterId: string) => {
    setCharacters(prev => prev.filter(c => c.id !== characterId));
  }, []);

  // 更新角色
  const updateCharacter = useCallback((characterId: string, updates: Partial<AICharacter>) => {
    setCharacters(prev => prev.map(c =>
      c.id === characterId ? { ...c, ...updates } : c
    ));
  }, []);

  // 更新角色状态
  const updateCharacterStatus = useCallback((characterId: string, status: AICharacter['status']) => {
    setCharacters(prev => prev.map(c =>
      c.id === characterId ? { ...c, status } : c
    ));
  }, []);

  // 获取角色
  const getCharacterById = useCallback((id: string) => {
    return characters.find(c => c.id === id);
  }, [characters]);

  // 清空所有角色
  const clearCharacters = useCallback(() => {
    setCharacters([]);
  }, []);

  // 验证角色配置
  const validateCharacters = useCallback(() => {
    const errors: string[] = [];

    if (characters.length === 0) {
      errors.push('请先选择至少一个AI角色');
    }

    if (characters.length > 3) {
      errors.push('最多只能选择3个AI角色');
    }

    characters.forEach(character => {
      if (!character.apiKey || !character.model) {
        errors.push(`角色 ${character.name} 的API配置不完整`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [characters]);

  // 设置角色列表（用于恢复历史对话）
  const setCharactersList = useCallback((characterList: AICharacter[]) => {
    setCharacters(characterList.map(c => ({ ...c, status: 'idle' as const })));
  }, []);

  return {
    characters,
    addCharacter,
    removeCharacter,
    updateCharacter,
    updateCharacterStatus,
    getCharacterById,
    clearCharacters,
    setCharactersList,
    validateCharacters,
    createPresetCharacter,
    createCustomCharacter
  };
};

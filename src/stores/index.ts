import { create } from 'zustand';
import type { UIState } from './uiStore';
import type { APIState } from './apiStore';
import type { CharacterState } from './characterStore';
import type { ConversationState } from './conversationStore';
import { createUIStore } from './uiStore';
import { createAPIStore } from './apiStore';
import { createCharacterStore } from './characterStore';
import { createConversationStore } from './conversationStore';

/**
 * 统一导出所有 Store 和 Hook
 * 方便在其他模块中导入使用
 */

// 导出组合后的 Store（向后兼容）
export { useAppStore } from './useAppStore';

// 创建独立的 Hook
export const useUIStore = create<UIState>()(createUIStore);
export const useAPIStore = create<APIState>()(createAPIStore);
export const useCharacterStore = create<CharacterState>()(createCharacterStore);
export const useConversationStore = create<ConversationState>()(createConversationStore);

// Type exports
export type { UIState } from './uiStore';
export type { APIState } from './apiStore';
export type { CharacterState } from './characterStore';
export type { ConversationState } from './conversationStore';
export type { AppState } from './useAppStore';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import ConversationOverview from './conversation/ConversationOverview';
import MessageList from './conversation/MessageList';
import ConversationControls from './conversation/ConversationControls';
import EditCharacterModal from './conversation/EditCharacterModal';

const ConversationView: React.FC = () => {
  const {
    currentConversation,
    characters,
    isProcessing
  } = useAppStore();

  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gray-900">
          {/* Mobile menu button */}
          <button
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors lg:hidden"
            aria-label="打开侧边栏"
            onClick={() => {
              // Dispatch a custom event to toggle sidebar
              window.dispatchEvent(new CustomEvent('toggle-sidebar'));
            }}
          >
            <svg
              className="w-6 h-6 text-neon-cyan"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-neon-cyan">群英会</h1>
        </header>
        <div className="flex-1 flex items-center justify-center h-64">
          <div className="text-gray-400 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <div className="text-lg font-mono">暂无对话内容</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gray-900">
        {/* Mobile menu button */}
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors lg:hidden"
          aria-label="打开侧边栏"
          onClick={() => {
            // Dispatch a custom event to toggle sidebar
            window.dispatchEvent(new CustomEvent('toggle-sidebar'));
          }}
        >
          <svg
            className="w-6 h-6 text-neon-cyan"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-neon-cyan">群英会</h1>
      </header>
      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          <ConversationOverview
            conversation={currentConversation}
            characters={characters}
            onEditCharacter={setEditingCharacterId}
          />

          <MessageList
            conversation={currentConversation}
            characters={characters}
            isProcessing={isProcessing}
          />

          <ConversationControls
            conversation={currentConversation}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      <EditCharacterModal
        characterId={editingCharacterId}
        onClose={() => setEditingCharacterId(null)}
      />
    </div>
  );
};

export default ConversationView;

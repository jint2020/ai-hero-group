import React, { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import ConversationOverview from './conversation/ConversationOverview';
import MessageList from './conversation/MessageList';
import ConversationControls from './conversation/ConversationControls';
import EditCharacterModal from './conversation/EditCharacterModal';

interface ConversationViewProps {
  onToggleSidebar?: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ onToggleSidebar }) => {
  const {
    currentConversation,
    characters,
    isProcessing
  } = useAppStore();

  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <div className="text-lg font-mono">暂无对话内容</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 移动端顶部导航栏 */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="打开侧边栏"
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
        <h2 className="text-lg font-bold text-neon-cyan">对话中</h2>
        <div className="w-10" /> {/* 占位符，保持居中 */}
      </div>
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

      <EditCharacterModal
        characterId={editingCharacterId}
        onClose={() => setEditingCharacterId(null)}
      />
    </div>
  );
};

export default ConversationView;

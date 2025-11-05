import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
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

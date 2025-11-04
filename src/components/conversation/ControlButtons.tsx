import React from 'react';
import { Conversation } from '../../types';
import { ActionButton } from '../shared';

interface ControlButtonsProps {
  conversation: Conversation;
  isProcessing: boolean;
  onToggleConversation: () => void;
  onResetConversation: () => void;
  onProcessNextTurn: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  conversation,
  isProcessing,
  onToggleConversation,
  onResetConversation,
  onProcessNextTurn
}) => {
  return (
    <div className="space-y-4">
      {/* 控制按钮（始终显示） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionButton
          onClick={onToggleConversation}
          disabled={isProcessing}
          variant={conversation.isActive ? 'pink' : 'green'}
        >
          <div className="flex items-center justify-center space-x-2">
            {conversation.isActive ? (
              <>
                <span>⏸️</span>
                <span>暂停对话</span>
              </>
            ) : (
              <>
                <span>▶️</span>
                <span>继续对话</span>
              </>
            )}
          </div>
        </ActionButton>

        <ActionButton
          onClick={onProcessNextTurn}
          disabled={!conversation.isActive || isProcessing}
          variant="yellow"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>⏭️</span>
            <span>下一轮</span>
          </div>
        </ActionButton>

        <ActionButton
          onClick={onResetConversation}
          disabled={isProcessing}
          variant="default"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>🔄</span>
            <span>重置对话</span>
          </div>
        </ActionButton>
      </div>
    </div>
  );
};

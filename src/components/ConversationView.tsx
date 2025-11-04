import React, { useState } from "react";
import { Conversation, AICharacter } from "../types";
import {
  ConversationOverview,
  MessageList,
  ControlButtons,
  EditModal
} from "./conversation";

interface ConversationViewProps {
  conversation: Conversation | null;
  characters: AICharacter[];
  onToggleConversation: () => void;
  onResetConversation: () => void;
  onProcessNextTurn: () => void;
  onUpdateCharacter: (
    characterId: string,
    updates: Partial<AICharacter>
  ) => void;
  isProcessing: boolean;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  characters,
  onToggleConversation,
  onResetConversation,
  onProcessNextTurn,
  onUpdateCharacter,
  isProcessing,
}) => {
  const [isCurrentConversationCollapsed, setIsCurrentConversationCollapsed] =
    useState(false);
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<AICharacter | null>(null);

  if (!conversation) {
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
      {/* 对话概览 */}
      <ConversationOverview
        conversation={conversation}
        characters={characters}
        isCollapsed={isCurrentConversationCollapsed}
        onToggleCollapse={() =>
          setIsCurrentConversationCollapsed(!isCurrentConversationCollapsed)
        }
        onEditCharacter={setEditingCharacter}
      />

      {/* 对话消息 */}
      <MessageList
        conversation={conversation}
        characters={characters}
        isProcessing={isProcessing}
      />

      {/* 控制按钮 */}
      <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neon-cyan flex items-center">
            <span className="mr-2">🎮</span>
            对话控制
          </h2>
          <button
            onClick={() => setIsControlPanelCollapsed(!isControlPanelCollapsed)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-xs transition-colors"
          >
            {isControlPanelCollapsed ? "展开" : "折叠"}
          </button>
        </div>

        <ControlButtons
          conversation={conversation}
          isProcessing={isProcessing}
          onToggleConversation={onToggleConversation}
          onResetConversation={onResetConversation}
          onProcessNextTurn={onProcessNextTurn}
        />

        {/* 展开后显示的附加信息 */}
        {!isControlPanelCollapsed && (
          <>
            {/* 状态信息 */}
            <div className="mb-4 p-3 bg-gray-900 border border-gray-600 rounded">
              <div className="text-sm font-mono text-gray-300 space-y-1">
                <div>当前轮次: {conversation.round}</div>
                <div>消息数量: {conversation.messages.length}</div>
                <div>参与角色: {conversation.characters.length}</div>
                <div>对话状态: {conversation.isActive ? "进行中" : "已暂停"}</div>
                {isProcessing && (
                  <div className="text-neon-yellow">正在处理下一轮对话...</div>
                )}
              </div>
            </div>

            {/* 操作提示 */}
            <div className="p-3 bg-blue-900 border border-blue-400 rounded">
              <div className="flex items-center mb-2">
                <span className="mr-2">💡</span>
                <span className="font-mono font-bold text-blue-100">操作提示</span>
              </div>
              <ul className="space-y-1 text-xs font-mono text-blue-200">
                <li>• 暂停/继续: 控制对话的进行状态</li>
                <li>• 下一轮: 手动触发下一轮对话</li>
                <li>• 重置: 清空对话历史，重新开始</li>
                <li>• AI会按照角色顺序轮流发言</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* 编辑模态框 */}
      <EditModal
        character={editingCharacter}
        onClose={() => setEditingCharacter(null)}
        onSave={(characterId, updates) => {
          onUpdateCharacter(characterId, updates);
          setEditingCharacter(null);
        }}
      />
    </div>
  );
};

export default ConversationView;

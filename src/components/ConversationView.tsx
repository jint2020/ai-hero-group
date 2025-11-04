import React, { useEffect, useRef } from 'react';
import { Conversation, AICharacter, Message } from '../types';

interface ConversationViewProps {
  conversation: Conversation | null;
  characters: AICharacter[];
  onToggleConversation: () => void;
  onResetConversation: () => void;
  onProcessNextTurn: () => void;
  isProcessing: boolean;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  characters,
  onToggleConversation,
  onResetConversation,
  onProcessNextTurn,
  isProcessing
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

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

  const getCharacterById = (id: string) => {
    return characters.find(c => c.id === id);
  };

  const getStatusColor = (status: AICharacter['status']) => {
    switch (status) {
      case 'idle': return 'text-gray-400';
      case 'thinking': return 'text-neon-yellow';
      case 'speaking': return 'text-neon-cyan';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: AICharacter['status']) => {
    switch (status) {
      case 'idle': return '空闲';
      case 'thinking': return '思考中';
      case 'speaking': return '发言中';
      case 'error': return '错误';
      default: return '未知';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* 对话概览 */}
      <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neon-cyan">当前对话</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              第 {conversation.round} 轮
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-mono ${
              conversation.isActive 
                ? 'bg-green-900 text-green-300 border border-green-400' 
                : 'bg-gray-700 text-gray-300 border border-gray-500'
            }`}>
              {conversation.isActive ? '进行中' : '已暂停'}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neon-green mb-2">讨论主题</h3>
          <div className="bg-gray-900 border border-gray-600 p-3 rounded text-white font-mono">
            {conversation.topic}
          </div>
        </div>

        {/* 角色状态 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {characters.map((character) => (
            <div key={character.id} className="bg-gray-900 border border-gray-600 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="character-avatar"
                  style={{ borderColor: character.color }}
                >
                  {character.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-white">{character.name}</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`status-indicator ${character.status}`}></div>
                    <span className={`text-xs ${getStatusColor(character.status)}`}>
                      {getStatusText(character.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>提供商: {character.apiProvider === 'siliconflow' ? 'SiliconFlow' : 
                             character.apiProvider === 'openrouter' ? 'OpenRouter' : 'DeepSeek'}</div>
                <div>模型: <span className="font-mono text-yellow-400">{character.model}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 对话消息 */}
      <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neon-cyan">对话记录</h2>
          <div className="text-sm text-gray-400">
            {conversation.messages.length} 条消息
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pixel-scrollbar">
          {conversation.messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💬</div>
              <div className="font-mono">等待AI开始对话...</div>
            </div>
          ) : (
            conversation.messages.map((message) => {
              const character = getCharacterById(message.characterId);
              if (!character) return null;

              return (
                <div key={message.id} className="message-bubble">
                  <div className="flex items-start space-x-3">
                    <div 
                      className="character-avatar flex-shrink-0"
                      style={{ borderColor: character.color }}
                    >
                      {character.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span 
                          className="font-bold text-sm"
                          style={{ color: character.color }}
                        >
                          {character.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
        <h2 className="text-xl font-bold text-neon-cyan mb-4 flex items-center">
          <span className="mr-2">🎮</span>
          对话控制
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 暂停/继续 */}
          <button
            onClick={onToggleConversation}
            disabled={isProcessing}
            className={`pixel-button py-3 ${
              conversation.isActive ? 'pink' : 'green'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          </button>

          {/* 下一轮 */}
          <button
            onClick={onProcessNextTurn}
            disabled={!conversation.isActive || isProcessing}
            className={`pixel-button yellow ${!conversation.isActive || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>⏭️</span>
              <span>下一轮</span>
            </div>
          </button>

          {/* 重置 */}
          <button
            onClick={onResetConversation}
            disabled={isProcessing}
            className={`pixel-button ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔄</span>
              <span>重置对话</span>
            </div>
          </button>
        </div>

        {/* 状态信息 */}
        <div className="mt-4 p-3 bg-gray-900 border border-gray-600 rounded">
          <div className="text-sm font-mono text-gray-300 space-y-1">
            <div>当前轮次: {conversation.round}</div>
            <div>消息数量: {conversation.messages.length}</div>
            <div>参与角色: {characters.length}</div>
            <div>对话状态: {conversation.isActive ? '进行中' : '已暂停'}</div>
            {isProcessing && (
              <div className="text-neon-yellow">正在处理下一轮对话...</div>
            )}
          </div>
        </div>

        {/* 操作提示 */}
        <div className="mt-4 p-3 bg-blue-900 border border-blue-400 rounded">
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
      </div>
    </div>
  );
};

export default ConversationView;
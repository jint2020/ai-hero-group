import React from 'react';
import { Conversation, AICharacter, Message } from '../../types';
import { ScrollableContainer } from '../shared';

interface MessageListProps {
  conversation: Conversation;
  characters: AICharacter[];
  isProcessing: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversation,
  characters,
  isProcessing
}) => {
  // 优先使用对话中的角色数据，否则使用传入的角色数据
  const displayCharacters = conversation?.characters || characters;

  const getCharacterById = (id: string) => {
    return displayCharacters.find((c) => c.id === id);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getNextSpeaker = () => {
    if (!conversation || conversation.characters.length === 0) return null;
    const nextIndex = (conversation.currentSpeakerIndex + 1) % conversation.characters.length;
    if (nextIndex === 0) return null;
    return conversation.characters[nextIndex];
  };

  const renderMessage = (message: Message) => {
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
  };

  const renderStreamingMessage = () => {
    if (!conversation.currentSpeakingMessage) return null;

    const character = getCharacterById(conversation.currentSpeakingMessage.characterId);
    if (!character) return null;

    return (
      <div className="message-bubble">
        <div className="flex items-start space-x-3">
          <div
            className="character-avatar flex-shrink-0"
            style={{ borderColor: character.color }}
          >
            {character.avatar}
          </div>
          <div className="flex-1">
            <div className='flex items-center space-x-2 mb-2'>
              <span
                className="font-bold text-sm"
                style={{ color: character.color }}
              >
                {character.name}
              </span>
              <span className="text-xs text-neon-yellow animate-pulse">
                正在输入中...
              </span>
            </div>
            <div className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {conversation.currentSpeakingMessage.content}
              <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWaitingMessage = () => {
    if (conversation.currentSpeakingMessage || !conversation.isActive || !isProcessing) {
      return null;
    }

    const nextSpeaker = getNextSpeaker();
    if (!nextSpeaker) return null;

    return (
      <div className="message-bubble">
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs text-gray-500 animate-pulse">⏳</span>
              <span className="text-xs text-gray-500 font-mono">
                等待
                <span className="text-neon-cyan mx-1 font-bold">{nextSpeaker.name}</span>
                输出中
                <span className="inline-flex">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '200ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '400ms' }}>.</span>
                </span>
              </span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"
                style={{ width: '60%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neon-cyan">对话记录</h2>
        <div className="text-sm text-gray-400">
          {conversation.messages.length} 条消息
          {conversation.currentSpeakingMessage && ' (+1 正在输入)'}
        </div>
      </div>

      <ScrollableContainer
        className="space-y-4 max-h-96 overflow-y-auto pixel-scrollbar"
        scrollToBottomTrigger={[
          conversation.messages,
          conversation.currentSpeakingMessage
        ]}
      >
        {conversation.messages.length === 0 && !conversation.currentSpeakingMessage ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <div className="font-mono">等待AI开始对话...</div>
          </div>
        ) : (
          <>
            {conversation.messages.map(renderMessage)}
            {renderStreamingMessage()}
            {renderWaitingMessage()}
          </>
        )}
      </ScrollableContainer>
    </div>
  );
};

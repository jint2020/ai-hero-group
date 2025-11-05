import React, { useEffect, useRef, useState } from 'react';
import { Conversation, AICharacter } from '../../types';

interface MessageListProps {
  conversation: Conversation;
  characters: AICharacter[];
  isProcessing: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  conversation,
  characters,
  isProcessing
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);

  // 滚动位置检测
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 50;
      const atBottom = scrollHeight - scrollTop - clientHeight < threshold;

      setIsUserAtBottom(atBottom);

      // 根据滚动位置显示不同的按钮
      if (atBottom) {
        setScrollDirection(null); // 在底部时不显示按钮
      } else if (scrollTop < 100) {
        // 滚动到顶部附近，显示向下按钮
        setScrollDirection('down');
      } else {
        // 滚动到中间或底部附近，显示向上按钮
        setScrollDirection('up');
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始检查

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 自动滚动到最新消息（仅当用户在底部时）
  useEffect(() => {
    if (isUserAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation.messages, conversation.currentSpeakingMessage, isUserAtBottom]);

  const scrollToTop = () => {
    const firstMessage = messagesContainerRef.current?.querySelector('.message-bubble');
    firstMessage?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCharacterById = (id: string) => {
    return characters.find((c) => c.id === id);
  };

  // 获取下一个发言者
  const getNextSpeaker = () => {
    if (!conversation || conversation.characters.length === 0) return null;

    const nextIndex = (conversation.currentSpeakerIndex + 1) % conversation.characters.length;

    // 如果是一轮中的最后一个人发言后，不需要显示等待提示
    if (nextIndex === 0) {
      return null;
    }

    return conversation.characters[nextIndex];
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
    <div className="bg-gray-800 border-2 border-cyan-400 p-4 md:p-6 rounded-lg neon-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className='text-lg md:text-xl font-bold text-neon-cyan'>对话记录</h2>
        <div className='text-xs md:text-sm text-gray-400'>
          {conversation.messages.length} 条消息
          {conversation.currentSpeakingMessage && ' (+1 正在输入)'}
        </div>
      </div>

      <div className='relative'>
        <div
          ref={messagesContainerRef}
          className='space-y-3 md:space-y-4 max-h-80 md:max-h-96 overflow-y-auto pixel-scrollbar'
        >
          {conversation.messages.length === 0 && !conversation.currentSpeakingMessage ? (
            <div className='text-center text-gray-500 py-8'>
              <div className='text-4xl mb-2'>💬</div>
              <div className='font-mono'>等待AI开始对话...</div>
            </div>
          ) : (
            <>
              {conversation.messages.map((message) => {
                const character = getCharacterById(message.characterId);
                if (!character) return null;

                return (
                  <div key={message.id} className='message-bubble'>
                    <div className='flex items-start space-x-3'>
                      <div
                        className='character-avatar flex-shrink-0'
                        style={{ borderColor: character.color }}
                      >
                        {character.avatar}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <span
                            className='font-bold text-sm'
                            style={{ color: character.color }}
                          >
                            {character.name}
                          </span>
                          <span className='text-xs text-gray-400'>
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div className='text-white font-mono text-sm leading-relaxed whitespace-pre-wrap'>
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 流式消息显示 */}
              {conversation.currentSpeakingMessage && (
                <div className='message-bubble'>
                  <div className='flex items-start space-x-3'>
                    <div
                      className='character-avatar flex-shrink-0'
                      style={{
                        borderColor: getCharacterById(
                          conversation.currentSpeakingMessage.characterId
                        )?.color
                      }}
                    >
                      {
                        getCharacterById(
                          conversation.currentSpeakingMessage.characterId
                        )?.avatar
                      }
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <span
                          className='font-bold text-sm'
                          style={{
                            color: getCharacterById(
                              conversation.currentSpeakingMessage.characterId
                            )?.color
                          }}
                        >
                          {
                            getCharacterById(
                              conversation.currentSpeakingMessage.characterId
                            )?.name
                          }
                        </span>
                        <span className='text-xs text-neon-yellow animate-pulse'>
                          正在输入中...
                        </span>
                      </div>
                      <div className='text-white font-mono text-sm leading-relaxed whitespace-pre-wrap'>
                        {conversation.currentSpeakingMessage.content}
                        <span className='inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse'></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 等待下一位角色输出的提示 */}
              {!conversation.currentSpeakingMessage &&
                conversation.isActive &&
                isProcessing &&
                getNextSpeaker() && (
                  <div className='message-bubble'>
                    <div className='flex items-start space-x-3'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <span className='text-xs text-gray-500 animate-pulse'>⏳</span>
                          <span className='text-xs text-gray-500 font-mono'>
                            等待
                            <span className='text-neon-cyan mx-1 font-bold'>
                              {getNextSpeaker()?.name}
                            </span>
                            输出中
                            <span className='inline-flex'>
                              <span
                                className='animate-bounce'
                                style={{ animationDelay: '0ms' }}
                              >
                                .
                              </span>
                              <span
                                className='animate-bounce'
                                style={{ animationDelay: '200ms' }}
                              >
                                .
                              </span>
                              <span
                                className='animate-bounce'
                                style={{ animationDelay: '400ms' }}
                              >
                                .
                              </span>
                            </span>
                          </span>
                        </div>
                        <div className='h-1 bg-gray-700 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse'
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 滚动按钮 - 单个按钮显示 */}
        {scrollDirection && (
          <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2'>
            <button
              onClick={scrollDirection === 'up' ? scrollToTop : scrollToBottom}
              className='p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full text-gray-300 hover:text-white transition-colors shadow-lg'
              title={scrollDirection === 'up' ? '回到顶部' : '回到最新消息'}
            >
              {scrollDirection === 'up' ? '↑' : '↓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;

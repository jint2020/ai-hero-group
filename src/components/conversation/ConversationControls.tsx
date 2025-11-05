import React, { useState } from 'react';
import { Conversation } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface ConversationControlsProps {
  conversation: Conversation;
  isProcessing: boolean;
}

const ConversationControls: React.FC<ConversationControlsProps> = ({
  conversation,
  isProcessing
}) => {
  const { toggleConversation, resetConversation, processNextTurn } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className='bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-neon-cyan flex items-center'>
          <span className='mr-2'>🎮</span>
          对话控制
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='px-3 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-xs transition-colors'
        >
          {isCollapsed ? '展开' : '折叠'}
        </button>
      </div>

      {/* 控制按钮（始终显示） */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
        {/* 暂停/继续 */}
        <button
          onClick={toggleConversation}
          disabled={isProcessing}
          className={`pixel-button py-3 ${
            conversation.isActive ? 'pink' : 'green'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className='flex items-center justify-center space-x-2'>
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
          onClick={() => processNextTurn(conversation)}
          disabled={!conversation.isActive || isProcessing}
          className={`pixel-button yellow ${
            !conversation.isActive || isProcessing
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          <div className='flex items-center justify-center space-x-2'>
            <span>⏭️</span>
            <span>下一轮</span>
          </div>
        </button>

        {/* 重置 */}
        <button
          onClick={resetConversation}
          disabled={isProcessing}
          className={`pixel-button ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className='flex items-center justify-center space-x-2'>
            <span>🔄</span>
            <span>重置对话</span>
          </div>
        </button>
      </div>

      {/* 展开后显示的附加信息 */}
      {!isCollapsed && (
        <>
          {/* 状态信息 */}
          <div className='mb-4 p-3 bg-gray-900 border border-gray-600 rounded'>
            <div className='text-sm font-mono text-gray-300 space-y-1'>
              <div>当前轮次: {conversation.round}</div>
              <div>消息数量: {conversation.messages.length}</div>
              <div>参与角色: {conversation.characters.length}</div>
              <div>对话状态: {conversation.isActive ? '进行中' : '已暂停'}</div>
              {isProcessing && (
                <div className='text-neon-yellow'>正在处理下一轮对话...</div>
              )}
            </div>
          </div>

          {/* 操作提示 */}
          <div className='p-3 bg-blue-900 border border-blue-400 rounded'>
            <div className='flex items-center mb-2'>
              <span className='mr-2'>💡</span>
              <span className='font-mono font-bold text-blue-100'>操作提示</span>
            </div>
            <ul className='space-y-1 text-xs font-mono text-blue-200'>
              <li>• 暂停/继续: 控制对话的进行状态</li>
              <li>• 下一轮: 手动触发下一轮对话</li>
              <li>• 重置: 清空对话历史，重新开始</li>
              <li>• AI会按照角色顺序轮流发言</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationControls;

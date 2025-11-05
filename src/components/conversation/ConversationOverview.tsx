import React, { useState } from 'react';
import { Conversation, AICharacter } from '../../types';

interface ConversationOverviewProps {
  conversation: Conversation;
  characters: AICharacter[];
  onEditCharacter: (characterId: string) => void;
}

const ConversationOverview: React.FC<ConversationOverviewProps> = ({
  conversation,
  characters,
  onEditCharacter
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getStatusColor = (status: AICharacter['status']) => {
    switch (status) {
      case 'idle':
        return 'text-gray-400';
      case 'thinking':
        return 'text-neon-yellow';
      case 'speaking':
        return 'text-neon-cyan';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: AICharacter['status']) => {
    switch (status) {
      case 'idle':
        return '空闲';
      case 'thinking':
        return '思考中';
      case 'speaking':
        return '发言中';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'siliconflow':
        return 'SiliconFlow';
      case 'openrouter':
        return 'OpenRouter';
      case 'deepseek':
        return 'DeepSeek';
      case 'custom':
        return '自定义';
      default:
        return provider;
    }
  };

  return (
    <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neon-cyan">当前对话</h2>
        <div className="flex items-center space-x-4">
          {!isCollapsed && (
            <>
              <div className="text-sm text-gray-400">
                第 {conversation.round} 轮
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-mono ${
                  conversation.isActive
                    ? 'bg-green-900 text-green-300 border border-green-400'
                    : 'bg-gray-700 text-gray-300 border border-gray-500'
                }`}
              >
                {conversation.isActive ? '进行中' : '已暂停'}
              </div>
            </>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-xs transition-colors"
          >
            {isCollapsed ? '展开' : '折叠'}
          </button>
        </div>
      </div>

      {isCollapsed ? (
        // 折叠状态：只显示角色头像和名字
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-gray-900 border border-gray-600 p-3 rounded-lg flex items-center space-x-3"
            >
              <div
                className="character-avatar flex-shrink-0"
                style={{ borderColor: character.color }}
              >
                {character.avatar}
              </div>
              <h4 className="font-bold text-white">{character.name}</h4>
            </div>
          ))}
        </div>
      ) : (
        // 展开状态：显示完整内容
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neon-green mb-2">
              讨论主题
            </h3>
            <div className="bg-gray-900 border border-gray-600 p-3 rounded text-white font-mono">
              {conversation.topic}
            </div>
          </div>

          {/* 角色状态 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {characters.map((character) => (
              <div
                key={character.id}
                className="bg-gray-900 border border-gray-600 p-4 rounded-lg"
              >
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
                      <div
                        className={`status-indicator ${character.status}`}
                      ></div>
                      <span
                        className={`text-xs ${getStatusColor(character.status)}`}
                      >
                        {getStatusText(character.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>提供商:</span>
                      <span className="text-gray-300">
                        {getProviderName(character.apiProvider)}
                      </span>
                    </div>
                    <button
                      onClick={() => onEditCharacter(character.id)}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-xs transition-colors"
                    >
                      编辑
                    </button>
                  </div>
                  <div>
                    模型:{' '}
                    <span className="font-mono text-yellow-400">
                      {character.model}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationOverview;

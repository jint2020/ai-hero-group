import React from 'react';
import { Conversation, AICharacter } from '../../types';
import { CharacterCard, StatusBadge } from '../shared';

interface ConversationOverviewProps {
  conversation: Conversation;
  characters: AICharacter[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onEditCharacter: (character: AICharacter) => void;
}

export const ConversationOverview: React.FC<ConversationOverviewProps> = ({
  conversation,
  characters,
  isCollapsed,
  onToggleCollapse,
  onEditCharacter
}) => {
  // 优先使用对话中的角色数据，否则使用传入的角色数据
  const displayCharacters = conversation?.characters || characters;

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
            onClick={onToggleCollapse}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-xs transition-colors"
          >
            {isCollapsed ? '展开' : '折叠'}
          </button>
        </div>
      </div>

      {isCollapsed ? (
        /* 折叠状态：只显示角色头像和名字 */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              compact
            />
          ))}
        </div>
      ) : (
        /* 展开状态：显示完整内容 */
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
            {displayCharacters.map((character) => (
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
                    <StatusBadge status={character.status} />
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>提供商:</span>
                      <span className="text-gray-300">
                        {character.apiProvider === 'siliconflow'
                          ? 'SiliconFlow'
                          : character.apiProvider === 'openrouter'
                          ? 'OpenRouter'
                          : character.apiProvider === 'deepseek'
                          ? 'DeepSeek'
                          : '自定义'}
                      </span>
                    </div>
                    <button
                      onClick={() => onEditCharacter(character)}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-xs transition-colors"
                    >
                      编辑
                    </button>
                  </div>
                  <div>
                    模型:{' '}
                    <span className='font-mono text-yellow-400'>
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

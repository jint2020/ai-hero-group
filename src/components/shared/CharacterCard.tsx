import React from 'react';
import { AICharacter } from '../../types';

interface CharacterCardProps {
  character: AICharacter;
  onEdit?: (character: AICharacter) => void;
  onRemove?: (characterId: string) => void;
  compact?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onEdit,
  onRemove,
  compact = false
}) => {
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

  if (compact) {
    return (
      <div className="bg-gray-900 border border-gray-600 p-3 rounded-lg flex items-center space-x-3">
        <div
          className="character-avatar flex-shrink-0"
          style={{ borderColor: character.color }}
        >
          {character.avatar}
        </div>
        <h4 className="font-bold text-white">{character.name}</h4>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-600 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
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
        {(onEdit || onRemove) && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(character)}
                className="pixel-button yellow text-xs px-2 py-1"
              >
                编辑
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(character.id)}
                className="pixel-button pink text-xs px-2 py-1"
              >
                移除
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-400">性格:</span>
          <span className="text-white ml-1">{character.personality}</span>
        </div>
        <div>
          <span className="text-gray-400">提供商:</span>
          <span className="text-cyan-400 ml-1">
            {character.apiProvider === 'siliconflow' ? 'SiliconFlow' :
             character.apiProvider === 'openrouter' ? 'OpenRouter' :
             character.apiProvider === 'deepseek' ? 'DeepSeek' : '自定义'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">模型:</span>
          <span className="text-yellow-400 ml-1 font-mono text-xs">{character.model}</span>
        </div>
      </div>
    </div>
  );
};

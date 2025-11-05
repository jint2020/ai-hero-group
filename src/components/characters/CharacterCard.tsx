import React from 'react';
import { AICharacter } from '../../types';
import { API_PROVIDERS } from '../../types/apiProviders';
import { useAppStore } from '../../store/useAppStore';

interface CharacterCardProps {
  character: AICharacter;
  onEdit: (characterId: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onEdit }) => {
  const { removeCharacter } = useAppStore();

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
    return API_PROVIDERS[provider]?.name || provider;
  };

  return (
    <div className='bg-gray-900 border border-gray-600 p-4 rounded-lg'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-3'>
          <div
            className='character-avatar'
            style={{ borderColor: character.color }}
          >
            {character.avatar}
          </div>
          <div>
            <h4 className='font-bold text-white'>{character.name}</h4>
            <div className='flex items-center space-x-2'>
              <div className={`status-indicator ${character.status}`}></div>
              <span className={`text-xs ${getStatusColor(character.status)}`}>
                {getStatusText(character.status)}
              </span>
            </div>
          </div>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={() => onEdit(character.id)}
            className='pixel-button yellow text-xs px-2 py-1'
          >
            编辑
          </button>
          <button
            onClick={() => removeCharacter(character.id)}
            className='pixel-button pink text-xs px-2 py-1'
          >
            移除
          </button>
        </div>
      </div>

      <div className='space-y-2 text-sm'>
        <div>
          <span className='text-gray-400'>性格:</span>
          <span className='text-white ml-1'>{character.personality}</span>
        </div>
        <div>
          <span className='text-gray-400'>提供商:</span>
          <span className='text-cyan-400 ml-1'>{getProviderName(character.apiProvider)}</span>
        </div>
        <div>
          <span className='text-gray-400'>模型:</span>
          <span className='text-yellow-400 ml-1 font-mono text-xs'>
            {character.model}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;

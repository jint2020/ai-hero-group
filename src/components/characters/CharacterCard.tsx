import React from 'react';
import { AICharacter } from '../../types';
import { API_PROVIDERS } from '../../types/apiProviders';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface CharacterCardProps {
  character: AICharacter;
  onEdit: (characterId: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onEdit }) => {
  const { removeCharacter } = useAppStore();

  const getStatusBadgeVariant = (status: AICharacter['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'idle':
        return 'secondary';
      case 'thinking':
        return 'default';
      case 'speaking':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
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
    <Card className='bg-gray-900 border-gray-700'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div
              className='character-avatar'
              style={{ borderColor: character.color }}
            >
              {character.avatar}
            </div>
            <div>
              <CardTitle className='text-lg text-white'>{character.name}</CardTitle>
              <Badge variant={getStatusBadgeVariant(character.status)} className='mt-1'>
                {getStatusText(character.status)}
              </Badge>
            </div>
          </div>
          <div className='flex space-x-2'>
            <Button
              onClick={() => onEdit(character.id)}
              variant='neonYellow'
              size='sm'
            >
              编辑
            </Button>
            <Button
              onClick={() => removeCharacter(character.id)}
              variant='neonPink'
              size='sm'
            >
              移除
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
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
      </CardContent>
    </Card>
  );
};

export default CharacterCard;

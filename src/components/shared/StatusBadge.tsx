import React from 'react';
import { AICharacter } from '../../types';

interface StatusBadgeProps {
  status: AICharacter['status'];
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStatusConfig = (status: AICharacter['status']) => {
    switch (status) {
      case 'idle':
        return {
          color: 'text-gray-400',
          text: '空闲',
          dot: 'bg-gray-400'
        };
      case 'thinking':
        return {
          color: 'text-neon-yellow',
          text: '思考中',
          dot: 'bg-neon-yellow'
        };
      case 'speaking':
        return {
          color: 'text-neon-cyan',
          text: '发言中',
          dot: 'bg-neon-cyan'
        };
      case 'error':
        return {
          color: 'text-red-400',
          text: '错误',
          dot: 'bg-red-400'
        };
      default:
        return {
          color: 'text-gray-400',
          text: '未知',
          dot: 'bg-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={`flex items-center space-x-1 ${config.color}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
      <span className={sizeClass}>{config.text}</span>
    </div>
  );
};

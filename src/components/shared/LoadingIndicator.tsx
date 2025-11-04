import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = '加载中...',
  size = 'md'
}) => {
  const sizeConfig = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`${sizeConfig[size]} border-2 border-green-400 border-t-transparent rounded-full animate-spin`}></div>
      <span className="text-sm text-gray-300">{message}</span>
    </div>
  );
};

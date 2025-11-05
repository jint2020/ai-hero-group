import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-gray-900 border border-gray-600 rounded-lg p-4 ${className}`}>
      {title && (
        <h3 className='text-lg font-semibold text-white mb-3'>{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;

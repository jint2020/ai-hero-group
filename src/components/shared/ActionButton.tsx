import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'green' | 'pink' | 'yellow' | 'default';
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  variant = 'default',
  children,
  className = '',
  title
}) => {
  const getVariantClass = () => {
    if (disabled) {
      return 'opacity-50 cursor-not-allowed';
    }

    switch (variant) {
      case 'green':
        return 'green glow';
      case 'pink':
        return 'pink glow';
      case 'yellow':
        return 'yellow glow';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`pixel-button ${getVariantClass()} ${className}`}
      title={title}
    >
      {children}
    </button>
  );
};

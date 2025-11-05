import React, { useState, useCallback, useEffect } from 'react';

interface ResizableDividerProps {
  onResize: (width: number) => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

const ResizableDivider: React.FC<ResizableDividerProps> = ({
  onResize,
  initialWidth = 320,
  minWidth = 200,
  maxWidth = 600,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dividerWidth, setDividerWidth] = useState(initialWidth);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.querySelector('.resizable-container') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newWidth = Math.min(
      Math.max(e.clientX - containerRect.left, minWidth),
      maxWidth
    );

    setDividerWidth(newWidth);
    onResize(newWidth);
  }, [isDragging, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`
        bg-gray-600 transition-all duration-200 cursor-col-resize
        relative group flex-shrink-0
        ${isDragging ? 'bg-cyan-400' : ''}
        ${className}
      `}
      onMouseDown={handleMouseDown}
      style={{
        width: '4px',
        minWidth: '4px',
        maxWidth: '4px',
        backgroundColor: isDragging ? '#06b6d4' : '#4b5563',
        // 添加细微的渐变效果
        background: isDragging
          ? 'linear-gradient(to bottom, #06b6d4, #0891b2)'
          : 'linear-gradient(to bottom, #4b5563, #374151)'
      }}
    >
      {/* 拖拽时的视觉反馈 */}
      {isDragging && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
          }}
        />
      )}

      {/* 鼠标悬停时的视觉提示 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div
          className="rounded-full"
          style={{
            width: '3px',
            height: '100dvh',
            backgroundColor: '#06b6d4',
            boxShadow: '0 0 8px rgba(6, 182, 212, 0.6)'
          }}
        />
      </div>

      {/* 始终显示的细线（使分隔条更明显） */}
      <div
        className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2"
        style={{
          width: '1px',
          backgroundColor: isDragging ? '#ffffff' : '#9ca3af',
          opacity: 0.3
        }}
      />
    </div>
  );
};

export default ResizableDivider;

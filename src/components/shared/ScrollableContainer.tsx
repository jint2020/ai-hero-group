import React, { useEffect, useRef, useState } from 'react';

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
  scrollToBottomTrigger?: any;
}

export const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  className = '',
  autoScroll = true,
  scrollToBottomTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);

  // 滚动位置检测
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 50;
      const atBottom = scrollHeight - scrollTop - clientHeight < threshold;

      // 检测用户是否向上滚动
      if (scrollTop > 100 && !atBottom) {
        setUserHasScrolledUp(true);
      } else if (atBottom) {
        // 用户滚动到底部时，重置状态
        setUserHasScrolledUp(false);
        setScrollDirection(null);
        return;
      }

      setIsUserAtBottom(atBottom);

      if (atBottom) {
        setScrollDirection(null);
      } else if (scrollTop < 100) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 自动滚动 - 只有在用户没有主动向上滚动时才自动滚动
  useEffect(() => {
    if (autoScroll && isUserAtBottom && !userHasScrolledUp) {
      scrollToBottom();
    }
  }, [scrollToBottomTrigger, autoScroll, isUserAtBottom, userHasScrolledUp]);

  const scrollToTop = () => {
    const firstMessage = containerRef.current?.querySelector('.message-bubble');
    firstMessage?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    const endRef = containerRef.current?.querySelector('[data-scroll-end]');
    endRef?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div ref={containerRef} className={className}>
        {children}
        <div data-scroll-end ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
      </div>

      {/* 滚动按钮 */}
      {scrollDirection && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => {
              if (scrollDirection === 'up') {
                scrollToTop();
              } else {
                setUserHasScrolledUp(false);
                scrollToBottom();
              }
            }}
            className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full text-gray-300 hover:text-white transition-colors shadow-lg"
            title={scrollDirection === 'up' ? '回到顶部' : '回到最新消息'}
          >
            {scrollDirection === 'up' ? '↑' : '↓'}
          </button>
        </div>
      )}
    </div>
  );
};


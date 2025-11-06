import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white font-mono">
        {/* 扫描线效果 */}
        <div className="scanline" />
        {children}
      </div>
    </ErrorBoundary>
  );
};

export default RootLayout;

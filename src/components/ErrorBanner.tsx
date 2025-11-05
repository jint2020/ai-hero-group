import React from 'react';

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-900 border-b-2 border-red-400 text-red-100 p-3 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center">
          <span className="mr-2">⚠️</span>
          <span className="font-mono text-sm">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-red-100 hover:text-white ml-4 px-2 py-1 rounded transition-colors"
          aria-label="关闭错误提示"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ErrorBanner;

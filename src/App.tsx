import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import SetupView from './components/SetupView';
import ConversationLayout from './components/Layout';
import ErrorBanner from './components/ErrorBanner';
import './App.css';

function App() {
  const {
    currentView,
    error,
    loadUserConfig,
    loadConversations,
    setError
  } = useAppStore();

  // 初始化加载
  useEffect(() => {
    loadUserConfig();
    loadConversations();
  }, []);

  return (
    <div className='min-h-screen bg-gray-900 text-white font-mono'>
      {/* 扫描线效果 */}
      <div className='scanline' />

      <div className='flex h-screen'>
        {/* 主布局 */}
        {currentView === 'setup' ? <SetupView /> : <ConversationLayout />}
      </div>

      {/* 错误提示 */}
      {error && (
        <ErrorBanner
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}

export default App;

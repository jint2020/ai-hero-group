import React, { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import SetupView from './components/SetupView';
import ConversationView from './components/ConversationView';
import ErrorBanner from './components/ErrorBanner';
import { RootLayout, MainLayout } from '@/layouts';
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
    <RootLayout>
      <div className='flex h-screen'>
        {/* 根据视图渲染不同布局 */}
        {currentView === 'setup' ? (
          <MainLayout sidebarVariant="setup">
            <SetupView />
          </MainLayout>
        ) : (
          <MainLayout sidebarVariant="conversation">
            <ConversationView />
          </MainLayout>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <ErrorBanner
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </RootLayout>
  );
}

export default App;

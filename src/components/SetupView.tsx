import React from 'react';
import { useAppStore } from '@/stores/useAppStore';
import ApiConfig from './ApiConfig';
import CharacterSelector from './CharacterSelector';
import ControlPanel from './ControlPanel';

const SetupView: React.FC = () => {
  const { setupView, apiKeys, setApiKeys } = useAppStore();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gray-900">
        {/* Mobile menu button */}
        <button
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors lg:hidden"
          aria-label="打开侧边栏"
          onClick={() => {
            // Dispatch a custom event to toggle sidebar
            window.dispatchEvent(new CustomEvent('toggle-sidebar'));
          }}
        >
          <svg
            className="w-6 h-6 text-neon-cyan"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-neon-cyan">
          {setupView === 'api' ? 'API配置' : '角色设置'}
        </h1>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-8">
        {setupView === 'api' ? (
          <ApiConfig
            apiKeys={apiKeys}
            onApiKeysChange={setApiKeys}
          />
        ) : (
          <>
            <CharacterSelector />
            <ControlPanel />
          </>
        )}
      </div>
    </div>
  );
};

export default SetupView;

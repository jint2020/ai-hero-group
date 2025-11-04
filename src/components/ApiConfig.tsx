import React, { useState, useEffect } from 'react';
import { API_PROVIDERS } from '../types';

interface ApiConfigProps {
  apiKeys: Record<string, string>;
  onApiKeysChange: (keys: Record<string, string>) => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ apiKeys, onApiKeysChange }) => {
  const [localKeys, setLocalKeys] = useState<Record<string, string>>(apiKeys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'error' | null>>({});

  useEffect(() => {
    setLocalKeys(apiKeys);
  }, [apiKeys]);

  const handleKeyChange = (provider: string, value: string) => {
    const newKeys = { ...localKeys, [provider]: value };
    setLocalKeys(newKeys);
    onApiKeysChange(newKeys);
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const testConnection = async (provider: 'siliconflow' | 'openrouter' | 'deepseek') => {
    const apiKey = localKeys[provider];
    if (!apiKey) {
      alert('请先输入API密钥');
      return;
    }

    setTestResults(prev => ({ ...prev, [provider]: 'testing' }));

    try {
      // 简单的格式验证
      const models = API_PROVIDERS[provider].models;
      const testModel = models[0]; // 使用第一个可用模型测试

      const response = await fetch(`${API_PROVIDERS[provider].baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(provider === 'openrouter' ? {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'AI Conference'
          } : {})
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: 'hello' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, [provider]: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, [provider]: 'error' }));
      }
    } catch (error) {
      console.error('API测试失败:', error);
      setTestResults(prev => ({ ...prev, [provider]: 'error' }));
    }

    // 3秒后清除测试结果
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, [provider]: null }));
    }, 3000);
  };

  const getTestResultIcon = (provider: string) => {
    const result = testResults[provider];
    switch (result) {
      case 'testing':
        return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>;
      case 'success':
        return <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-green-800 rounded-full"></div>
        </div>;
      case 'error':
        return <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-red-800 rounded-full"></div>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
      <h2 className="text-xl font-bold text-neon-cyan mb-4 flex items-center">
        <span className="mr-2">⚙️</span>
        API配置
      </h2>
      
      <div className="space-y-6">
        {Object.entries(API_PROVIDERS).map(([key, provider]) => (
          <div key={key} className="bg-gray-900 border border-gray-600 p-4 rounded">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-neon-green">{provider.name}</h3>
              <div className="flex items-center space-x-2">
                {getTestResultIcon(key)}
                <button
                  onClick={() => testConnection(key as 'siliconflow' | 'openrouter' | 'deepseek')}
                  className="pixel-button text-xs px-2 py-1"
                  disabled={testResults[key] === 'testing'}
                >
                  测试连接
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">
                  API密钥
                </label>
                <div className="flex">
                  <input
                    type={showKeys[key] ? 'text' : 'password'}
                    value={localKeys[key] || ''}
                    onChange={(e) => handleKeyChange(key, e.target.value)}
                    placeholder={`输入${provider.name}的API密钥`}
                    className="pixel-input flex-1 rounded-r-none"
                  />
                  <button
                    onClick={() => toggleShowKey(key)}
                    className="px-3 py-2 bg-gray-700 border-2 border-l-0 border-gray-600 text-gray-300 hover:text-white transition-colors"
                  >
                    {showKeys[key] ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">
                  可用模型 ({provider.models.length}个)
                </label>
                <div className="text-xs text-gray-400 font-mono max-h-20 overflow-y-auto pixel-scrollbar">
                  {provider.models.map((model, index) => (
                    <div key={index} className="py-1">{model}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900 border border-blue-400 rounded text-blue-100 text-sm">
        <div className="flex items-center mb-2">
          <span className="mr-2">💡</span>
          <span className="font-mono font-bold">提示</span>
        </div>
        <ul className="space-y-1 text-xs font-mono">
          <li>• SiliconFlow: 支持国产大模型，价格优惠</li>
          <li>• OpenRouter: 聚合多个AI提供商，模型丰富</li>
          <li>• DeepSeek: 专业的代码和对话模型</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiConfig;
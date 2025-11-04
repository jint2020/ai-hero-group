import React, { useState, useEffect } from 'react';
import { API_PROVIDERS } from '../types/apiProviders';
import { DEFAULT_API_KEYS } from '../config/defaultConfig';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface ApiConfigProps {
  apiKeys: Record<string, string>;
  onApiKeysChange: (keys: Record<string, string>) => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ apiKeys, onApiKeysChange }) => {
  const [localKeys, setLocalKeys] = useState<Record<string, string>>(apiKeys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'error' | null>>({});
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [customProviderName, setCustomProviderName] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customModels, setCustomModels] = useState(''); // 逗号分隔的模型列表
  const [customApiKey, setCustomApiKey] = useState('');

  // 动态模型列表状态
  const [dynamicModels, setDynamicModels] = useState<Record<string, string[]>>({});
  const [isFetchingModels, setIsFetchingModels] = useState<Record<string, boolean>>({});
  const [modelFetchError, setModelFetchError] = useState<Record<string, string | null>>({});

  // 默认模型状态
  const [defaultModels, setDefaultModels] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalKeys(apiKeys);
    // 加载缓存的默认模型
    const providers = ['siliconflow', 'openrouter', 'deepseek'];
    const loadedDefaults: Record<string, string> = {};
    providers.forEach(provider => {
      loadedDefaults[provider] = storageService.loadDefaultModel(provider);
    });
    setDefaultModels(loadedDefaults);
  }, [apiKeys]);

  const handleKeyChange = (provider: string, value: string) => {
    const newKeys = { ...localKeys, [provider]: value };
    setLocalKeys(newKeys);
    onApiKeysChange(newKeys);
  };

  // 获取模型列表（优先使用动态获取）
  const getModelList = (provider: string): string[] => {
    if (dynamicModels[provider] && dynamicModels[provider].length > 0) {
      return dynamicModels[provider];
    }
    return API_PROVIDERS[provider]?.models || [];
  };

  // 动态获取 SiliconFlow 模型列表
  const fetchModels = async (provider: 'siliconflow' | 'openrouter' | 'deepseek') => {
    const apiKey = localKeys[provider];
    if (!apiKey) {
      alert('请先输入API密钥');
      return;
    }

    // 检查缓存
    const cached = storageService.getCachedModels(provider);
    if (cached) {
      setDynamicModels(prev => ({ ...prev, [provider]: cached }));
      console.log(`从缓存加载${provider}的${cached.length}个模型`);
      return;
    }

    setIsFetchingModels(prev => ({ ...prev, [provider]: true }));
    setModelFetchError(prev => ({ ...prev, [provider]: null }));

    try {
      let models: string[] = [];

      if (provider === 'siliconflow') {
        // SiliconFlow 支持动态获取
        models = await aiService.fetchSiliconFlowModels(apiKey);
      } else if (provider === 'openrouter') {
        // OpenRouter 支持动态获取
        models = await aiService.fetchOpenRouterModels(apiKey);
      } else {
        // 其他供应商使用默认列表
        models = aiService.getAvailableModels(provider);
      }

      setDynamicModels(prev => ({ ...prev, [provider]: models }));
      storageService.cacheModels(provider, models);

      console.log(`成功获取${provider}的${models.length}个模型`);
    } catch (error) {
      console.error(`获取${provider}模型列表失败:`, error);
      setModelFetchError(prev => ({
        ...prev,
        [provider]: error instanceof Error ? error.message : '获取模型列表失败'
      }));
      // 使用默认模型列表
      const fallbackModels = aiService.getAvailableModels(provider);
      setDynamicModels(prev => ({ ...prev, [provider]: fallbackModels }));
    } finally {
      setIsFetchingModels(prev => ({ ...prev, [provider]: false }));
    }
  };

  // 设置默认模型
  const handleSetDefaultModel = (provider: string, model: string) => {
    storageService.saveDefaultModel(provider, model);
    setDefaultModels(prev => ({ ...prev, [provider]: model }));
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

    let testModel = defaultModels[provider];

    // 对于 DeepSeek，检查是否输入了模型名称；对于其他提供商，检查可用模型列表
    if (!testModel || testModel.trim() === '') {
      if (provider === 'deepseek') {
        alert('请先输入模型名称');
        return;
      } else {
        const availableModels = getModelList(provider);
        if (availableModels.length === 0) {
          alert('没有可用的模型，请先点击获取模型列表');
          return;
        }
        // 如果有模型列表但没有选择默认模型，使用第一个模型并保存到持久化存储
        testModel = availableModels[0];
        setDefaultModels(prev => ({ ...prev, [provider]: testModel }));
        storageService.saveDefaultModel(provider, testModel);
      }
    }

    setTestResults(prev => ({ ...prev, [provider]: 'testing' }));

    try {
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

      {/* 默认配置信息提示 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-400 rounded-lg">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="text-lg font-bold text-neon-blue mb-2">默认API配置</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>系统已为您准备了以下默认API供应商配置：</p>
              <ul className="ml-4 space-y-1 text-xs">
                {Object.entries(API_PROVIDERS).map(([key, provider]) => (
                  <li key={key} className="flex items-center space-x-2">
                    <span className="text-neon-cyan">•</span>
                    <span className="font-mono text-neon-green">{provider.name}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-gray-300">{provider.models.length}个可用模型</span>
                    {DEFAULT_API_KEYS[key] ? (
                      <span className="text-yellow-400">(默认密钥: ***)</span>
                    ) : (
                      <span className="text-yellow-400">(需要配置密钥)</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600 rounded text-yellow-100">
                <div className="flex items-center mb-1">
                  <span className="mr-2">⚠️</span>
                  <span className="font-bold text-xs">重要提示</span>
                </div>
                <p className="text-xs">
                  默认配置仅包含供应商信息和模型列表，您需要自行输入有效的API密钥。
                  请访问各供应商官网获取免费试用额度或购买API服务。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

              {/* 默认模型选择 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">
                  默认模型
                </label>
                <div className="flex space-x-2">
                  {/* SiliconFlow 和 OpenRouter 使用下拉选择器 */}
                  {(key === 'siliconflow' || key === 'openrouter') ? (
                    <select
                      value={defaultModels[key] || ''}
                      onChange={(e) => handleSetDefaultModel(key, e.target.value)}
                      className="pixel-input flex-1 max-w-[280px] truncate"
                      style={{ textOverflow: 'ellipsis' }}
                    >
                      <option value="">请选择默认模型</option>
                      {getModelList(key).map((model, index) => (
                        <option key={index} value={model} title={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  ) : (
                    /* DeepSeek 使用带提示的输入框 */
                    <div className="flex-1 max-w-[280px]">
                      <input
                        type="text"
                        value={defaultModels[key] || ''}
                        onChange={(e) => handleSetDefaultModel(key, e.target.value)}
                        placeholder="请输入模型名称，例如: deepseek-chat"
                        className="pixel-input w-full"
                      />
                      {/* 显示常用模型建议 */}
                      {(!defaultModels[key] || defaultModels[key] === '') && (
                        <div className="mt-1 text-xs text-gray-500">
                          常用模型: deepseek-chat | deepseek-coder | deepseek-reasoner
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => fetchModels(key as 'siliconflow' | 'openrouter' | 'deepseek')}
                    disabled={isFetchingModels[key]}
                    className="pixel-button text-xs px-3"
                    title={(key === 'siliconflow' || key === 'openrouter') ? '从API获取最新模型列表' : '使用默认模型列表'}
                  >
                    {isFetchingModels[key] ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (key === 'siliconflow' || key === 'openrouter') ? (
                      '🔄'
                    ) : (
                      '📋'
                    )}
                  </button>
                </div>
                {defaultModels[key] && (
                  <div className="mt-1 text-xs text-green-400">
                    ✓ 已设置默认模型: {defaultModels[key]}
                  </div>
                )}
              </div>

              {/* 模型获取错误信息 */}
              {modelFetchError[key] && (
                <div className="p-2 bg-red-900 border border-red-400 rounded text-red-100 text-xs">
                  {modelFetchError[key]}
                </div>
              )}

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">
                  可用模型 ({getModelList(key).length}个)
                </label>
                <div className="text-xs text-gray-400 font-mono max-h-20 overflow-y-auto pixel-scrollbar">
                  {getModelList(key).map((model, index) => (
                    <div
                      key={index}
                      className={`py-1 truncate ${defaultModels[key] === model ? 'text-neon-green' : ''}`}
                      title={model}
                    >
                      {model} {defaultModels[key] === model && '✓'}
                    </div>
                  ))}
                </div>
                {(key === 'siliconflow' || key === 'openrouter') && (
                  <div className="mt-2 text-xs text-blue-300">
                    💡 点击 🔄 按钮可从API获取最新模型列表
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 自定义API配置 */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neon-yellow">自定义API提供商</h3>
          {!showCustomConfig ? (
            <button
              onClick={() => setShowCustomConfig(true)}
              className="pixel-button green"
            >
              添加自定义API
            </button>
          ) : null}
        </div>

        {showCustomConfig && (
          <div className="bg-gray-900 border border-gray-600 p-4 rounded-lg space-y-4">
            <h4 className="text-md font-semibold text-neon-green mb-2">配置自定义API</h4>

            {/* 提供商名称 */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-1">
                提供商名称
              </label>
              <input
                type="text"
                value={customProviderName}
                onChange={(e) => setCustomProviderName(e.target.value)}
                placeholder="例如: 我的自定义API"
                className="pixel-input w-full"
              />
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-1">
                Base URL
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="例如: https://api.example.com/v1"
                className="pixel-input w-full"
              />
            </div>

            {/* 模型列表 */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-1">
                支持的模型 (逗号分隔)
              </label>
              <input
                type="text"
                value={customModels}
                onChange={(e) => setCustomModels(e.target.value)}
                placeholder="例如: gpt-3.5-turbo, gpt-4, claude-3"
                className="pixel-input w-full"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-1">
                API Key
              </label>
              <div className="flex">
                <input
                  type={showKeys['custom'] ? 'text' : 'password'}
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="输入自定义API的密钥"
                  className="pixel-input flex-1 rounded-r-none"
                />
                <button
                  onClick={() => toggleShowKey('custom')}
                  className="px-3 py-2 bg-gray-700 border-2 border-l-0 border-gray-600 text-gray-300 hover:text-white transition-colors"
                >
                  {showKeys['custom'] ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (!customProviderName.trim()) {
                    alert('请输入提供商名称');
                    return;
                  }
                  if (!customBaseUrl.trim()) {
                    alert('请输入Base URL');
                    return;
                  }
                  if (!customApiKey.trim()) {
                    alert('请输入API Key');
                    return;
                  }

                  // 保存自定义配置
                  const newKeys = { ...localKeys, 'custom': customApiKey };
                  setLocalKeys(newKeys);
                  onApiKeysChange(newKeys);

                  // 重置表单
                  setShowCustomConfig(false);
                  setCustomProviderName('');
                  setCustomBaseUrl('');
                  setCustomModels('');
                  setCustomApiKey('');
                }}
                className="pixel-button green flex-1"
              >
                保存配置
              </button>
              <button
                onClick={() => {
                  setShowCustomConfig(false);
                  setCustomProviderName('');
                  setCustomBaseUrl('');
                  setCustomModels('');
                  setCustomApiKey('');
                }}
                className="pixel-button flex-1"
              >
                取消
              </button>
            </div>

            <div className="p-3 bg-blue-900 border border-blue-400 rounded text-blue-100 text-xs">
              <div className="flex items-center mb-2">
                <span className="mr-2">💡</span>
                <span className="font-mono font-bold">自定义API提示</span>
              </div>
              <ul className="space-y-1 text-xs font-mono">
                <li>• 请确保你的API兼容OpenAI格式</li>
                <li>• Base URL需要包含协议 (https://)</li>
                <li>• 模型名称必须与你的API实际支持的模型一致</li>
              </ul>
            </div>
          </div>
        )}
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
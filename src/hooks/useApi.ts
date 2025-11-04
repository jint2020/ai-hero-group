import { useState, useCallback, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { API_PROVIDERS } from '../types/apiProviders';

export const useApi = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'success' | 'error' | null>>({});
  const [dynamicModels, setDynamicModels] = useState<Record<string, string[]>>({});
  const [isFetchingModels, setIsFetchingModels] = useState<Record<string, boolean>>({});
  const [defaultModels, setDefaultModels] = useState<Record<string, string>>({});

  // 初始化时加载配置
  useEffect(() => {
    const config = storageService.loadUserConfig();
    if (config) {
      setApiKeys(config.apiKeys || {});
    }

    // 加载默认模型
    const providers = ['siliconflow', 'openrouter', 'deepseek'];
    const loadedDefaults: Record<string, string> = {};
    providers.forEach(provider => {
      loadedDefaults[provider] = storageService.loadDefaultModel(provider);
    });
    setDefaultModels(loadedDefaults);
  }, []);

  // 更新API密钥
  const updateApiKey = useCallback((provider: string, apiKey: string) => {
    const newKeys = { ...apiKeys, [provider]: apiKey };
    setApiKeys(newKeys);
    storageService.saveUserConfig({
      apiKeys: newKeys,
      selectedCharacters: [],
      theme: 'arcade'
    });
  }, [apiKeys]);

  // 获取模型列表
  const getModelList = useCallback((provider: string): string[] => {
    if (dynamicModels[provider] && dynamicModels[provider].length > 0) {
      return dynamicModels[provider];
    }
    return API_PROVIDERS[provider]?.models || [];
  }, [dynamicModels]);

  // 动态获取模型
  const fetchModels = useCallback(async (provider: 'siliconflow' | 'openrouter' | 'deepseek') => {
    const apiKey = apiKeys[provider];
    if (!apiKey) {
      throw new Error('请先输入API密钥');
    }

    // 检查缓存
    const cached = storageService.getCachedModels(provider);
    if (cached) {
      setDynamicModels(prev => ({ ...prev, [provider]: cached }));
      return cached;
    }

    setIsFetchingModels(prev => ({ ...prev, [provider]: true }));

    try {
      let models: string[] = [];

      if (provider === 'siliconflow') {
        models = await aiService.fetchSiliconFlowModels(apiKey);
      } else if (provider === 'openrouter') {
        models = await aiService.fetchOpenRouterModels(apiKey);
      } else {
        models = aiService.getAvailableModels(provider);
      }

      setDynamicModels(prev => ({ ...prev, [provider]: models }));
      storageService.cacheModels(provider, models);
      return models;
    } catch (error) {
      console.error(`获取${provider}模型列表失败:`, error);
      const fallbackModels = aiService.getAvailableModels(provider);
      setDynamicModels(prev => ({ ...prev, [provider]: fallbackModels }));
      return fallbackModels;
    } finally {
      setIsFetchingModels(prev => ({ ...prev, [provider]: false }));
    }
  }, [apiKeys]);

  // 设置默认模型
  const setDefaultModel = useCallback((provider: string, model: string) => {
    storageService.saveDefaultModel(provider, model);
    setDefaultModels(prev => ({ ...prev, [provider]: model }));
  }, []);

  // 测试API连接
  const testConnection = useCallback(async (provider: 'siliconflow' | 'openrouter' | 'deepseek') => {
    const apiKey = apiKeys[provider];
    if (!apiKey) {
      throw new Error('请先输入API密钥');
    }

    let testModel = defaultModels[provider];

    // 获取测试模型
    if (!testModel || testModel.trim() === '') {
      if (provider === 'deepseek') {
        throw new Error('请先设置默认模型');
      } else {
        const availableModels = getModelList(provider);
        if (availableModels.length === 0) {
          throw new Error('没有可用模型，请先获取模型列表');
        }
        testModel = availableModels[0];
        setDefaultModels(prev => ({ ...prev, [provider]: testModel }));
        storageService.saveDefaultModel(provider, testModel);
      }
    }

    setTestResults(prev => ({ ...prev, [provider]: 'testing' }));

    try {
      const isConnected = await aiService.testConnection(
        provider,
        apiKey,
        testModel
      );

      setTestResults(prev => ({
        ...prev,
        [provider]: isConnected ? 'success' : 'error'
      }));

      return isConnected;
    } catch (error) {
      console.error('API测试失败:', error);
      setTestResults(prev => ({ ...prev, [provider]: 'error' }));
      return false;
    } finally {
      // 3秒后清除测试结果
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [provider]: null }));
      }, 3000);
    }
  }, [apiKeys, defaultModels, getModelList]);

  // 验证API密钥格式
  const validateApiKey = useCallback((provider: 'siliconflow' | 'openrouter' | 'deepseek', apiKey: string) => {
    return aiService.validateApiKey(provider, apiKey);
  }, []);

  return {
    apiKeys,
    testResults,
    dynamicModels,
    isFetchingModels,
    defaultModels,
    updateApiKey,
    getModelList,
    fetchModels,
    setDefaultModel,
    testConnection,
    validateApiKey
  };
};

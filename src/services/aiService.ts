import { API_PROVIDERS } from '../types';

// API调用服务
export class AIService {
  private static instance: AIService;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // 调用AI API
  async callAI(
    provider: 'siliconflow' | 'openrouter' | 'deepseek',
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string
  ): Promise<string> {
    const providerConfig = API_PROVIDERS[provider];
    
    if (!providerConfig) {
      throw new Error(`未知的API提供商: ${provider}`);
    }

    if (!apiKey) {
      throw new Error('API密钥不能为空');
    }

    const url = `${providerConfig.baseUrl}/chat/completions`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 根据不同提供商设置认证头
    switch (provider) {
      case 'siliconflow':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'openrouter':
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'AI Conference';
        break;
      case 'deepseek':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
    }

    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.8,
      max_tokens: 1000,
      stream: false
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API调用失败: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API响应格式异常');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI API调用错误:', error);
      throw error;
    }
  }

  // 测试API连接
  async testConnection(
    provider: 'siliconflow' | 'openrouter' | 'deepseek',
    apiKey: string,
    model: string
  ): Promise<boolean> {
    try {
      const response = await this.callAI(
        provider,
        apiKey,
        model,
        [{ role: 'user', content: '你好' }],
        '你是一个测试助手，请简单回复确认连接正常。'
      );
      return response.length > 0;
    } catch (error) {
      console.error('API连接测试失败:', error);
      return false;
    }
  }

  // 获取可用模型列表
  getAvailableModels(provider: 'siliconflow' | 'openrouter' | 'deepseek'): string[] {
    return API_PROVIDERS[provider]?.models || [];
  }

  // 验证API密钥格式
  validateApiKey(provider: 'siliconflow' | 'openrouter' | 'deepseek', apiKey: string): boolean {
    if (!apiKey || apiKey.trim().length === 0) {
      return false;
    }

    // 基本格式验证
    switch (provider) {
      case 'siliconflow':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'openrouter':
        return apiKey.startsWith('sk-or-') && apiKey.length > 20;
      case 'deepseek':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      default:
        return true;
    }
  }
}

export const aiService = AIService.getInstance();
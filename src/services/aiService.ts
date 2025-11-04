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

  // 调用AI API - 流式版本
  async callAIStream(
    provider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    onChunk: (chunk: string) => void,
    customBaseUrl?: string,
    customModels?: string[]
  ): Promise<void> {
    let providerConfig;

    if (provider === 'custom') {
      if (!customBaseUrl) {
        throw new Error('自定义API需要提供base URL');
      }
      providerConfig = { baseUrl: customBaseUrl, models: customModels || [] };
    } else {
      providerConfig = API_PROVIDERS[provider];
      if (!providerConfig) {
        throw new Error(`未知的API提供商: ${provider}`);
      }
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
      stream: true
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应错误:', response.status, errorText);
        let errorMessage = `API调用失败 (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = `${errorMessage}: ${errorText}`;
          }
        }

        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } catch (error) {
      console.error('AI API调用错误:', error);
      throw error;
    }
  }

  // 调用AI API - 非流式版本（保持向后兼容）
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
        console.error('API响应错误:', response.status, errorText);
        let errorMessage = `API调用失败 (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = `${errorMessage}: ${errorText}`;
          }
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
    provider: 'siliconflow' | 'openrouter' | 'deepseek' | 'custom',
    apiKey: string,
    model: string,
    customBaseUrl?: string
  ): Promise<boolean> {
    try {
      if (provider === 'custom') {
        // 自定义API使用流式调用测试
        return new Promise<boolean>((resolve) => {
          let hasResponse = false;

          this.callAIStream(
            provider,
            apiKey,
            model,
            [{ role: 'user', content: '你好' }],
            '你是一个测试助手，请简单回复确认连接正常。',
            (chunk: string) => {
              if (chunk && chunk.length > 0) {
                hasResponse = true;
              }
            },
            customBaseUrl,
            [model]
          ).then(() => {
            resolve(hasResponse);
          }).catch(() => {
            resolve(false);
          });
        });
      }

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
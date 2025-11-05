/*
 * @Description: 
 * @Author: Jin Tang
 * @Date: 2025-11-04 17:07:37
 * @LastEditors: Jin Tang
 * @LastEditTime: 2025-11-05 08:37:53
 */
import { APIProvider } from './index';

// API提供商配置 - 动态模型获取
export const API_PROVIDERS: Record<string, APIProvider> = {
  siliconflow: {
    name: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: [], // 动态获取模型列表
    requiresKey: true
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [], // 动态获取模型列表
    requiresKey: true
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      'deepseek-chat',      // 对话模型
      'deepseek-coder',     // 代码模型
      'deepseek-reasoner'   // 推理模型
    ],
    requiresKey: true
  }
};

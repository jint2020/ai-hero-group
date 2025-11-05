import React, { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

const ControlPanel: React.FC = () => {
  const { characters, startConversation, isLoading } = useAppStore();
  const [topic, setTopic] = useState('');

  const handleStartConversation = () => {
    if (!topic.trim()) {
      alert('请输入对话主题');
      return;
    }
    startConversation(topic.trim());
  };

  const getValidationMessage = () => {
    if (characters.length === 0) {
      return '请先选择至少一个AI角色';
    }
    if (characters.length > 3) {
      return '最多只能选择3个AI角色';
    }
    if (characters.some((c) => !c.apiKey || !c.model)) {
      return '请完善所有角色的API配置';
    }
    return null;
  };

  const validationMessage = getValidationMessage();
  const canStart =
    !validationMessage &&
    characters.length > 0 &&
    topic.trim().length > 0 &&
    !isLoading;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle':
        return '空闲';
      case 'thinking':
        return '思考中';
      case 'speaking':
        return '发言中';
      case 'error':
        return '错误';
      default:
        return '活跃';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'siliconflow':
        return 'SiliconFlow';
      case 'openrouter':
        return 'OpenRouter';
      case 'deepseek':
        return 'DeepSeek';
      default:
        return provider;
    }
  };

  const suggestedTopics = [
    '人工智能的未来发展',
    '科技对日常生活的影响',
    '编程与创意的结合',
    '数字时代的社交媒体',
    '环保与可持续发展',
    '教育科技的革新',
    '虚拟现实与增强现实',
    '区块链技术的应用',
    '机器学习与数据分析',
    '网络安全的重要性'
  ];

  return (
    <div className='bg-gray-800 border-2 border-cyan-400 p-4 md:p-6 rounded-lg neon-border'>
      <h2 className='text-lg md:text-xl font-bold text-neon-cyan mb-4 flex items-center'>
        <span className='mr-2'>🎮</span>
        对话控制台
      </h2>

      {/* 角色状态概览 */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-neon-green mb-3'>角色状态</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          {characters.map((character) => (
            <div
              key={character.id}
              className='bg-gray-900 border border-gray-600 p-3 rounded'
            >
              <div className='flex items-center space-x-3'>
                <div
                  className='character-avatar'
                  style={{ borderColor: character.color }}
                >
                  {character.avatar}
                </div>
                <div className='flex-1'>
                  <div className='font-bold text-white text-sm'>
                    {character.name}
                  </div>
                  <div className='text-xs text-gray-400'>
                    {getProviderName(character.apiProvider)}
                  </div>
                  <div className='flex items-center space-x-2 mt-1'>
                    <div className={`status-indicator ${character.status}`}></div>
                    <span className='text-xs text-gray-400'>
                      {getStatusText(character.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 空位显示 */}
          {Array.from({ length: 3 - characters.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className='bg-gray-900/50 border border-dashed border-gray-600 p-3 rounded'
            >
              <div className='flex items-center justify-center h-16 text-gray-500'>
                <span className='text-sm'>空位</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 对话主题设置 */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-neon-yellow mb-3'>对话主题</h3>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-mono text-gray-300 mb-2'>
              请输入本次对话的主题
            </label>
            <input
              type='text'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='例如：人工智能的未来发展...'
              className='pixel-input w-full'
              disabled={isLoading}
            />
          </div>

          {/* 建议主题 */}
          <div>
            <label className='block text-sm font-mono text-gray-300 mb-2'>
              建议主题 (点击选择)
            </label>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {suggestedTopics.map((suggestedTopic, index) => (
                <button
                  key={index}
                  onClick={() => setTopic(suggestedTopic)}
                  className='text-left p-2 bg-gray-900 border border-gray-600 rounded text-sm text-gray-300 hover:border-cyan-400 hover:text-cyan-400 transition-colors'
                  disabled={isLoading}
                >
                  {suggestedTopic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 验证信息 */}
      {validationMessage && (
        <div className='mb-4 p-3 bg-red-900 border border-red-400 rounded text-red-100 text-sm'>
          <div className='flex items-center'>
            <span className='mr-2'>⚠️</span>
            <span className='font-mono'>{validationMessage}</span>
          </div>
        </div>
      )}

      {/* 开始对话按钮 */}
      <div className='space-y-4'>
        <button
          onClick={handleStartConversation}
          disabled={!canStart}
          className={`w-full py-4 text-lg font-bold transition-all ${
            canStart ? 'pixel-button green glow' : 'pixel-button opacity-50 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className='flex items-center justify-center space-x-2'>
              <div className='w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin'></div>
              <span>正在初始化对话...</span>
            </div>
          ) : (
            <div className='flex items-center justify-center space-x-2'>
              <span>🚀</span>
              <span>开始群英会</span>
            </div>
          )}
        </button>

        {/* 功能说明 */}
        <div className='bg-blue-900 border border-blue-400 rounded p-4'>
          <div className='flex items-center mb-2'>
            <span className='mr-2'>💡</span>
            <span className='font-mono font-bold text-blue-100'>使用说明</span>
          </div>
          <ul className='space-y-1 text-xs font-mono text-blue-200'>
            <li>• AI角色将按照设定顺序轮流发言</li>
            <li>• 每个角色都有独特的性格和说话风格</li>
            <li>• 对话会基于完整的历史记录进行</li>
            <li>• 可以随时暂停、继续或重置对话</li>
            <li>• 支持最多3个AI角色同时参与</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;

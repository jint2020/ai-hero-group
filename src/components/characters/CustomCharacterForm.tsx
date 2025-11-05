import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CustomCharacterConfig } from '../../types';
import { API_PROVIDERS } from '../../types/apiProviders';

interface CustomCharacterFormProps {
  editingCharacterId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CustomCharacterForm: React.FC<CustomCharacterFormProps> = ({
  editingCharacterId,
  onCancel,
  onSuccess
}) => {
  const { characters, apiKeys, addCustomCharacter, updateCharacter } = useAppStore();

  const character = characters.find((c) => c.id === editingCharacterId);

  const [customConfig, setCustomConfig] = useState<CustomCharacterConfig>({
    name: '',
    avatar: '🤖',
    personality: '',
    systemPrompt: '',
    color: '#00ffff'
  });

  const [selectedProvider, setSelectedProvider] = useState<
    'siliconflow' | 'openrouter' | 'deepseek' | 'custom'
  >('siliconflow');
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    if (character) {
      setCustomConfig({
        name: character.name,
        avatar: character.avatar,
        personality: character.personality,
        systemPrompt: character.systemPrompt,
        color: character.color
      });
      setSelectedProvider(character.apiProvider);
      setSelectedModel(character.model);
    }
  }, [character]);

  useEffect(() => {
    const models = API_PROVIDERS[selectedProvider].models;
    if (models.length > 0) {
      setSelectedModel(models[0]);
    } else {
      setSelectedModel('');
    }
  }, [selectedProvider]);

  // 可用头像选项
  const avatarOptions = [
    '🤖', '🧙‍♂️', '🧠', '👨‍💼', '👩‍💼', '🎭', '🎨', '🧪',
    '🚀', '⚡', '🔥', '💎', '🌟', '🎯', '🎲', '🎪'
  ];

  // 可用颜色选项
  const colorOptions = [
    '#00ffff', '#ff0080', '#39ff14', '#ffff00', '#ff6600',
    '#00ff00', '#ff00ff', '#00ccff', '#ffcc00', '#cc00ff'
  ];

  const handleSave = async () => {
    if (!customConfig.name.trim()) {
      alert('请输入角色名称');
      return;
    }
    if (!customConfig.personality.trim()) {
      alert('请输入角色性格');
      return;
    }
    if (!customConfig.systemPrompt.trim()) {
      alert('请输入系统提示词');
      return;
    }

    const apiKey = apiKeys[selectedProvider];
    if (!apiKey) {
      alert('请先在API配置中设置对应的API密钥');
      return;
    }

    if (!selectedModel) {
      alert('请选择一个模型');
      return;
    }

    try {
      if (editingCharacterId) {
        // 编辑现有角色
        await updateCharacter(
          editingCharacterId,
          customConfig,
          selectedProvider,
          selectedModel,
          apiKey
        );
      } else {
        // 添加新自定义角色
        await addCustomCharacter(customConfig, selectedProvider, selectedModel, apiKey);
      }
      onSuccess();
    } catch (error) {
      console.error('保存角色失败:', error);
    }
  };

  return (
    <div className='bg-gray-900 border border-gray-600 p-4 rounded-lg'>
      {/* 角色名称 */}
      <div className='mb-4'>
        <label className='block text-sm font-mono text-gray-300 mb-2'>
          角色名称
        </label>
        <input
          type='text'
          value={customConfig.name}
          onChange={(e) =>
            setCustomConfig({ ...customConfig, name: e.target.value })
          }
          placeholder='例如: 我的AI助手'
          className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
        />
      </div>

      {/* 头像选择 */}
      <div className='mb-4'>
        <label className='block text-sm font-mono text-gray-300 mb-2'>
          选择头像
        </label>
        <div className='grid grid-cols-8 gap-2'>
          {avatarOptions.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setCustomConfig({ ...customConfig, avatar })}
              className={`p-2 border rounded text-xl ${
                customConfig.avatar === avatar
                  ? 'border-neon-cyan bg-gray-800'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      {/* 颜色选择 */}
      <div className='mb-4'>
        <label className='block text-sm font-mono text-gray-300 mb-2'>
          选择颜色
        </label>
        <div className='flex flex-wrap gap-2'>
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => setCustomConfig({ ...customConfig, color })}
              className={`w-8 h-8 rounded border-2 ${
                customConfig.color === color ? 'border-white' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* 角色性格 */}
      <div className='mb-4'>
        <label className='block text-sm font-mono text-gray-300 mb-2'>
          角色性格
        </label>
        <input
          type='text'
          value={customConfig.personality}
          onChange={(e) =>
            setCustomConfig({ ...customConfig, personality: e.target.value })
          }
          placeholder='例如: 幽默、理性、富有创意'
          className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
        />
      </div>

      {/* 系统提示词 */}
      <div className='mb-4'>
        <label className='block text-sm font-mono text-gray-300 mb-2'>
          系统提示词
        </label>
        <textarea
          value={customConfig.systemPrompt}
          onChange={(e) =>
            setCustomConfig({ ...customConfig, systemPrompt: e.target.value })
          }
          placeholder='定义AI角色的行为和回答风格...'
          rows={4}
          className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
        />
      </div>

      {/* API配置 */}
      <div className='mb-4'>
        <label className='block text-sm font-mono text-gray-300 mb-2'>
          API提供商
        </label>
        <select
          value={selectedProvider}
          onChange={(e) =>
            setSelectedProvider(e.target.value as typeof selectedProvider)
          }
          className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
        >
          <option value='siliconflow'>SiliconFlow</option>
          <option value='openrouter'>OpenRouter</option>
          <option value='deepseek'>DeepSeek</option>
          <option value='custom'>自定义</option>
        </select>
      </div>

      <div className='mb-6'>
        <label className='block text-sm font-mono text-gray-300 mb-2'>模型</label>
        {selectedProvider === 'deepseek' ? (
          <input
            type='text'
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            placeholder='请输入模型名称，例如: deepseek-chat'
            className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
          />
        ) : (
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
          >
            <option value=''>请选择模型</option>
            {API_PROVIDERS[selectedProvider].models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 操作按钮 */}
      <div className='flex space-x-3'>
        <button onClick={handleSave} className='flex-1 pixel-button green'>
          {editingCharacterId ? '更新角色' : '创建角色'}
        </button>
        <button onClick={onCancel} className='flex-1 pixel-button'>
          取消
        </button>
      </div>
    </div>
  );
};

export default CustomCharacterForm;

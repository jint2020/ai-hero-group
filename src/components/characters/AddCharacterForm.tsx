import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { PRESET_CHARACTERS } from '../../types';
import { API_PROVIDERS } from '../../types/apiProviders';

interface AddCharacterFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const AddCharacterForm: React.FC<AddCharacterFormProps> = ({
  onCancel,
  onSuccess
}) => {
  const { addCharacter, apiKeys } = useAppStore();

  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<
    'siliconflow' | 'openrouter' | 'deepseek' | 'custom'
  >('siliconflow');
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    const models = API_PROVIDERS[selectedProvider].models;
    if (models.length > 0) {
      setSelectedModel(models[0]);
    } else {
      setSelectedModel('');
    }
  }, [selectedProvider]);

  const handleAdd = async () => {
    if (selectedPreset === null) {
      alert('请先选择一个角色类型');
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
      await addCharacter(selectedPreset, selectedProvider, selectedModel, apiKey);
      onSuccess();
    } catch (error) {
      console.error('添加角色失败:', error);
    }
  };

  return (
    <div className='bg-gray-900 border border-gray-600 p-4 rounded-lg'>
      {/* 角色选择 */}
      <div className='mb-4'>
        <label className='block text-sm font-mono text-gray-300 mb-2'>
          选择预设角色
        </label>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {PRESET_CHARACTERS.map((preset, index) => (
            <button
              key={index}
              onClick={() => setSelectedPreset(index)}
              className={`p-3 border rounded-lg transition-all ${
                selectedPreset === index
                  ? 'border-neon-cyan bg-gray-800'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className='text-2xl mb-1'>{preset.avatar}</div>
              <div className='font-bold text-white text-sm'>{preset.name}</div>
              <div className='text-xs text-gray-400 mt-1'>
                {preset.personality}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API提供商选择 */}
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

      {/* 模型选择 */}
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
        <button onClick={handleAdd} className='flex-1 pixel-button green'>
          添加角色
        </button>
        <button onClick={onCancel} className='flex-1 pixel-button'>
          取消
        </button>
      </div>
    </div>
  );
};

export default AddCharacterForm;

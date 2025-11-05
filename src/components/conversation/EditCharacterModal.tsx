import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { API_PROVIDERS } from '../../types/apiProviders';

interface EditCharacterModalProps {
  characterId: string | null;
  onClose: () => void;
}

const EditCharacterModal: React.FC<EditCharacterModalProps> = ({
  characterId,
  onClose
}) => {
  const { characters, updateCharacterProp } = useAppStore();

  const character = characters.find((c) => c.id === characterId);

  const [editProvider, setEditProvider] = useState<
    'siliconflow' | 'openrouter' | 'deepseek' | 'custom'
  >('siliconflow');
  const [editModel, setEditModel] = useState('');

  useEffect(() => {
    if (character) {
      setEditProvider(character.apiProvider);
      setEditModel(character.model);
    }
  }, [character]);

  if (!character) return null;

  // 获取可用模型列表
  const getAvailableModels = (provider: string): string[] => {
    return API_PROVIDERS[provider]?.models || [];
  };

  const handleSave = () => {
    updateCharacterProp(character.id, {
      apiProvider: editProvider,
      model: editModel
    });
    onClose();
  };

  const handleProviderChange = (provider: typeof editProvider) => {
    setEditProvider(provider);
    // 重置模型为第一个可用模型
    const availableModels = getAvailableModels(provider);
    if (availableModels.length > 0) {
      setEditModel(availableModels[0]);
    } else {
      setEditModel('');
    }
  };

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      onClick={onClose}
    >
      <div
        className='bg-gray-900 border-2 border-cyan-400 p-6 rounded-lg neon-border max-w-md w-full mx-4'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-bold text-neon-green'>
            编辑角色配置
          </h3>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            ✕
          </button>
        </div>

        <div className='space-y-4'>
          {/* 角色名称 */}
          <div>
            <div className='text-sm font-mono text-gray-300 mb-2'>
              角色名称
            </div>
            <div className='bg-gray-800 border border-gray-600 p-2 rounded text-white'>
              {character.name}
            </div>
          </div>

          {/* API提供商选择 */}
          <div>
            <label className='block text-sm font-mono text-gray-300 mb-2'>
              API提供商
            </label>
            <select
              value={editProvider}
              onChange={(e) => handleProviderChange(e.target.value as typeof editProvider)}
              className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
            >
              <option value='siliconflow'>SiliconFlow</option>
              <option value='openrouter'>OpenRouter</option>
              <option value='deepseek'>DeepSeek</option>
              <option value='custom'>自定义</option>
            </select>
          </div>

          {/* 模型选择 */}
          <div>
            <label className='block text-sm font-mono text-gray-300 mb-2'>
              模型
            </label>
            {editProvider === 'deepseek' ? (
              <input
                type='text'
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                placeholder='请输入模型名称，例如: deepseek-chat'
                className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
              />
            ) : (
              <select
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                className='w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white'
              >
                <option value=''>请选择模型</option>
                {getAvailableModels(editProvider).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className='flex space-x-3 mt-6'>
          <button
            onClick={handleSave}
            className='flex-1 pixel-button green'
            disabled={!editModel.trim()}
          >
            保存
          </button>
          <button onClick={onClose} className='flex-1 pixel-button'>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCharacterModal;

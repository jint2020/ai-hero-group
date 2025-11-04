import React, { useState } from 'react';
import { AICharacter, PRESET_CHARACTERS, API_PROVIDERS, CustomCharacterConfig } from '../types';

interface CharacterSelectorProps {
  characters: AICharacter[];
  apiKeys: Record<string, string>;
  onAddCharacter: (presetIndex: number, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string) => void;
  onAddCustomCharacter: (config: CustomCharacterConfig, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string) => void;
  onRemoveCharacter: (characterId: string) => void;
  onUpdateCharacterApi: (characterId: string, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string) => void;
  onUpdateCharacter: (characterId: string, config: CustomCharacterConfig, apiProvider: 'siliconflow' | 'openrouter' | 'deepseek', model: string, apiKey: string) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  characters,
  apiKeys,
  onAddCharacter,
  onAddCustomCharacter,
  onRemoveCharacter,
  onUpdateCharacterApi,
  onUpdateCharacter
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'siliconflow' | 'openrouter' | 'deepseek'>('siliconflow');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);

  // 自定义角色表单状态
  const [customConfig, setCustomConfig] = useState<CustomCharacterConfig>({
    name: '',
    avatar: '🤖',
    personality: '',
    systemPrompt: '',
    color: '#00ffff'
  });

  // 可用头像选项
  const avatarOptions = ['🤖', '🧙‍♂️', '🧠', '👨‍💼', '👩‍💼', '🎭', '🎨', '🧪', '🚀', '⚡', '🔥', '💎', '🌟', '🎯', '🎲', '🎪'];

  // 可用颜色选项
  const colorOptions = ['#00ffff', '#ff0080', '#39ff14', '#ffff00', '#ff6600', '#00ff00', '#ff00ff', '#00ccff', '#ffcc00', '#cc00ff'];

  const availableModels = API_PROVIDERS[selectedProvider].models;

  React.useEffect(() => {
    if (availableModels.length > 0) {
      setSelectedModel(availableModels[0]);
    }
  }, [selectedProvider]);

  const handleAddCharacter = () => {
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

    onAddCharacter(selectedPreset, selectedProvider, selectedModel, apiKey);
    setShowAddForm(false);
    setSelectedPreset(null);
  };

  // 开始编辑角色
  const handleEditCharacter = (character: AICharacter) => {
    setEditingCharacterId(character.id);
    setCustomConfig({
      name: character.name,
      avatar: character.avatar,
      personality: character.personality,
      systemPrompt: character.systemPrompt,
      color: character.color
    });
    setShowCustomForm(true);
  };

  // 保存自定义角色
  const handleSaveCustomCharacter = () => {
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

    if (editingCharacterId) {
      // 编辑现有角色
      onUpdateCharacter(editingCharacterId, customConfig, selectedProvider, selectedModel, apiKey);
    } else {
      // 添加新自定义角色
      onAddCustomCharacter(customConfig, selectedProvider, selectedModel, apiKey);
    }

    // 重置表单
    setShowCustomForm(false);
    setEditingCharacterId(null);
    setCustomConfig({
      name: '',
      avatar: '🤖',
      personality: '',
      systemPrompt: '',
      color: '#00ffff'
    });
    setSelectedPreset(null);
  };

  // 取消编辑/添加
  const handleCancelCustom = () => {
    setShowCustomForm(false);
    setEditingCharacterId(null);
    setCustomConfig({
      name: '',
      avatar: '🤖',
      personality: '',
      systemPrompt: '',
      color: '#00ffff'
    });
    setSelectedPreset(null);
  };

  const getStatusColor = (status: AICharacter['status']) => {
    switch (status) {
      case 'idle': return 'text-gray-400';
      case 'thinking': return 'text-neon-yellow';
      case 'speaking': return 'text-neon-cyan';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: AICharacter['status']) => {
    switch (status) {
      case 'idle': return '空闲';
      case 'thinking': return '思考中';
      case 'speaking': return '发言中';
      case 'error': return '错误';
      default: return '未知';
    }
  };

  return (
    <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neon-cyan flex items-center">
          <span className="mr-2">🤖</span>
          AI角色选择
        </h2>
        <div className="text-sm text-gray-400">
          已选择 {characters.length}/3 个角色
        </div>
      </div>

      {/* 已选择的角色 */}
      {characters.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neon-green mb-3">当前角色</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => (
              <div key={character.id} className="bg-gray-900 border border-gray-600 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="character-avatar"
                      style={{ borderColor: character.color }}
                    >
                      {character.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{character.name}</h4>
                      <div className="flex items-center space-x-2">
                        <div className={`status-indicator ${character.status}`}></div>
                        <span className={`text-xs ${getStatusColor(character.status)}`}>
                          {getStatusText(character.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCharacter(character)}
                      className="pixel-button yellow text-xs px-2 py-1"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onRemoveCharacter(character.id)}
                      className="pixel-button pink text-xs px-2 py-1"
                    >
                      移除
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">性格:</span>
                    <span className="text-white ml-1">{character.personality}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">提供商:</span>
                    <span className="text-cyan-400 ml-1">{API_PROVIDERS[character.apiProvider].name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">模型:</span>
                    <span className="text-yellow-400 ml-1 font-mono text-xs">{character.model}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 添加角色表单 */}
      {characters.length < 3 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neon-yellow">添加新角色</h3>
            {!showAddForm && !showCustomForm && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="pixel-button green"
                >
                  预设角色
                </button>
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="pixel-button yellow"
                >
                  自定义角色
                </button>
              </div>
            )}
          </div>

          {showAddForm && (
            <div className="bg-gray-900 border border-gray-600 p-4 rounded-lg space-y-4">
              {/* 选择预设角色 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  选择角色类型
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PRESET_CHARACTERS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPreset(index)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        selectedPreset === index
                          ? 'border-cyan-400 bg-cyan-900/20'
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{preset.avatar}</div>
                        <div>
                          <div className="font-bold text-white">{preset.name}</div>
                          <div className="text-xs text-gray-400">{preset.personality}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 选择API提供商 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  选择API提供商
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as 'siliconflow' | 'openrouter' | 'deepseek')}
                  className="pixel-input w-full"
                >
                  {Object.entries(API_PROVIDERS).map(([key, provider]) => (
                    <option key={key} value={key}>{provider.name}</option>
                  ))}
                </select>
              </div>

              {/* 选择模型 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  选择模型
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="pixel-input w-full"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleAddCharacter}
                  className="pixel-button green flex-1"
                >
                  添加角色
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedPreset(null);
                  }}
                  className="pixel-button flex-1"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 自定义角色表单 */}
          {showCustomForm && (
            <div className="bg-gray-900 border border-gray-600 p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-neon-green mb-4">
                {editingCharacterId ? '编辑自定义角色' : '创建自定义角色'}
              </h3>

              {/* 角色名称 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  角色名称 *
                </label>
                <input
                  type="text"
                  value={customConfig.name}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入角色名称"
                  className="pixel-input w-full"
                />
              </div>

              {/* 头像选择 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  选择头像
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setCustomConfig(prev => ({ ...prev, avatar }))}
                      className={`p-2 border-2 rounded text-xl transition-all ${
                        customConfig.avatar === avatar
                          ? 'border-cyan-400 bg-cyan-900/20'
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* 颜色选择 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  选择主题色
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCustomConfig(prev => ({ ...prev, color }))}
                      className={`h-10 border-2 rounded transition-all ${
                        customConfig.color === color
                          ? 'border-white scale-110'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* 性格描述 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  性格描述 *
                </label>
                <input
                  type="text"
                  value={customConfig.personality}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, personality: e.target.value }))}
                  placeholder="例如：睿智、深沉、富有哲理"
                  className="pixel-input w-full"
                />
              </div>

              {/* 系统提示词 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  系统提示词 *
                </label>
                <textarea
                  value={customConfig.systemPrompt}
                  onChange={(e) => setCustomConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="定义角色的行为准则、说话风格等..."
                  rows={4}
                  className="pixel-input w-full"
                />
              </div>

              {/* 选择API提供商 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  选择API提供商
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as 'siliconflow' | 'openrouter' | 'deepseek')}
                  className="pixel-input w-full"
                >
                  {Object.entries(API_PROVIDERS).map(([key, provider]) => (
                    <option key={key} value={key}>{provider.name}</option>
                  ))}
                </select>
              </div>

              {/* 选择模型 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  选择模型
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="pixel-input w-full"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveCustomCharacter}
                  className="pixel-button green flex-1"
                >
                  {editingCharacterId ? '保存修改' : '添加角色'}
                </button>
                <button
                  onClick={handleCancelCustom}
                  className="pixel-button flex-1"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 角色说明 */}
      <div className="bg-blue-900 border border-blue-400 rounded p-4">
        <div className="flex items-center mb-2">
          <span className="mr-2">📋</span>
          <span className="font-mono font-bold text-blue-100">角色说明</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          {PRESET_CHARACTERS.map((preset, index) => (
            <div key={index} className="bg-blue-800/50 p-2 rounded">
              <div className="font-bold text-blue-100">{preset.avatar} {preset.name}</div>
              <div className="text-blue-200 mt-1">{preset.personality}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelector;
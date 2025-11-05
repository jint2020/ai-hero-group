import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { CustomCharacterConfig } from '../../types';
import { API_PROVIDERS } from '../../types/apiProviders';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
    <Card className='bg-gray-900 border-gray-700'>
      <CardHeader>
        <CardTitle className='text-cyan-400'>
          {editingCharacterId ? '编辑自定义角色' : '创建自定义角色'}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* 角色名称 */}
        <div className='space-y-2'>
          <Label htmlFor='name' className='text-gray-300'>角色名称</Label>
          <Input
            id='name'
            type='text'
            value={customConfig.name}
            onChange={(e) =>
              setCustomConfig({ ...customConfig, name: e.target.value })
            }
            placeholder='例如: 我的AI助手'
            className='bg-gray-800 border-gray-600 text-white'
          />
        </div>

        {/* 头像选择 */}
        <div className='space-y-2'>
          <Label className='text-gray-300'>选择头像</Label>
          <div className='grid grid-cols-8 gap-2'>
            {avatarOptions.map((avatar) => (
              <Button
                key={avatar}
                type='button'
                variant={customConfig.avatar === avatar ? 'neon' : 'outline'}
                size='icon'
                onClick={() => setCustomConfig({ ...customConfig, avatar })}
                className='text-xl'
              >
                {avatar}
              </Button>
            ))}
          </div>
        </div>

        {/* 颜色选择 */}
        <div className='space-y-2'>
          <Label className='text-gray-300'>选择颜色</Label>
          <div className='flex flex-wrap gap-2'>
            {colorOptions.map((color) => (
              <Button
                key={color}
                type='button'
                variant='outline'
                size='icon'
                onClick={() => setCustomConfig({ ...customConfig, color })}
                className={`w-8 h-8 rounded-full ${
                  customConfig.color === color ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 角色性格 */}
        <div className='space-y-2'>
          <Label htmlFor='personality' className='text-gray-300'>角色性格</Label>
          <Input
            id='personality'
            type='text'
            value={customConfig.personality}
            onChange={(e) =>
              setCustomConfig({ ...customConfig, personality: e.target.value })
            }
            placeholder='例如: 幽默、理性、富有创意'
            className='bg-gray-800 border-gray-600 text-white'
          />
        </div>

        {/* 系统提示词 */}
        <div className='space-y-2'>
          <Label htmlFor='systemPrompt' className='text-gray-300'>系统提示词</Label>
          <Textarea
            id='systemPrompt'
            value={customConfig.systemPrompt}
            onChange={(e) =>
              setCustomConfig({ ...customConfig, systemPrompt: e.target.value })
            }
            placeholder='定义AI角色的行为和回答风格...'
            rows={4}
            className='bg-gray-800 border-gray-600 text-white'
          />
        </div>

        {/* API配置 */}
        <div className='space-y-2'>
          <Label className='text-gray-300'>API提供商</Label>
          <Select
            value={selectedProvider}
            onValueChange={(value) =>
              setSelectedProvider(value as typeof selectedProvider)
            }
          >
            <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
              <SelectValue placeholder='选择提供商' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='siliconflow'>SiliconFlow</SelectItem>
              <SelectItem value='openrouter'>OpenRouter</SelectItem>
              <SelectItem value='deepseek'>DeepSeek</SelectItem>
              <SelectItem value='custom'>自定义</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label className='text-gray-300'>模型</Label>
          {selectedProvider === 'deepseek' ? (
            <Input
              type='text'
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              placeholder='请输入模型名称，例如: deepseek-chat'
              className='bg-gray-800 border-gray-600 text-white'
            />
          ) : (
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                <SelectValue placeholder='选择模型' />
              </SelectTrigger>
              <SelectContent>
                {API_PROVIDERS[selectedProvider].models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 操作按钮 */}
        <div className='flex gap-3 pt-4'>
          <Button onClick={handleSave} variant='neonGreen' className='flex-1'>
            {editingCharacterId ? '更新角色' : '创建角色'}
          </Button>
          <Button onClick={onCancel} variant='outline' className='flex-1'>
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCharacterForm;

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import CharacterCard from './characters/CharacterCard';
import AddCharacterForm from './characters/AddCharacterForm';
import CustomCharacterForm from './characters/CustomCharacterForm';

const CharacterSelector: React.FC = () => {
  const { characters } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);

  return (
    <div className='bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-neon-cyan flex items-center'>
          <span className='mr-2'>🤖</span>
          AI角色选择
        </h2>
        <div className='text-sm text-gray-400'>
          已选择 {characters.length}/3 个角色
        </div>
      </div>

      {/* 已选择的角色 */}
      {characters.length > 0 && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-neon-green mb-3'>当前角色</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={setEditingCharacterId}
              />
            ))}
          </div>
        </div>
      )}

      {/* 添加角色表单 */}
      {characters.length < 3 && (
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-neon-yellow mb-4'>添加新角色</h3>

          {showAddForm ? (
            <AddCharacterForm
              onCancel={() => setShowAddForm(false)}
              onSuccess={() => {
                setShowAddForm(false);
              }}
            />
          ) : showCustomForm ? (
            <CustomCharacterForm
              editingCharacterId={editingCharacterId}
              onCancel={() => {
                setShowCustomForm(false);
                setEditingCharacterId(null);
              }}
              onSuccess={() => {
                setShowCustomForm(false);
                setEditingCharacterId(null);
              }}
            />
          ) : (
            <div className='flex space-x-2'>
              <button
                onClick={() => setShowAddForm(true)}
                className='pixel-button green'
              >
                <span className='mr-2'>+</span>
                选择预设角色
              </button>
              <button
                onClick={() => setShowCustomForm(true)}
                className='pixel-button'
              >
                <span className='mr-2'>✏️</span>
                创建自定义角色
              </button>
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      {characters.length === 0 && (
        <div className='p-4 bg-blue-900 border border-blue-400 rounded'>
          <div className='flex items-start'>
            <span className='mr-2'>💡</span>
            <div>
              <div className='font-mono font-bold text-blue-100 mb-1'>使用提示</div>
              <ul className='space-y-1 text-xs font-mono text-blue-200'>
                <li>• 选择预设角色快速开始，或创建完全自定义的角色</li>
                <li>• 最多可同时选择3个AI角色进行对话</li>
                <li>• 每个角色需要配置对应的API提供商和模型</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelector;

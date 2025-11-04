import React, { useEffect, useRef, useState } from "react";
import { Conversation, AICharacter, Message } from "../types";
import { API_PROVIDERS } from "../types/apiProviders";
import { storageService } from "../services/storageService";
import { aiService } from "../services/aiService";

interface ConversationViewProps {
  conversation: Conversation | null;
  characters: AICharacter[];
  onToggleConversation: () => void;
  onResetConversation: () => void;
  onProcessNextTurn: () => void;
  onUpdateCharacter: (
    characterId: string,
    updates: Partial<AICharacter>
  ) => void;
  isProcessing: boolean;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  characters,
  onToggleConversation,
  onResetConversation,
  onProcessNextTurn,
  onUpdateCharacter,
  isProcessing,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingCharacter, setEditingCharacter] = useState<AICharacter | null>(
    null
  );
  const [editProvider, setEditProvider] = useState<
    "siliconflow" | "openrouter" | "deepseek" | "custom"
  >("siliconflow");
  const [editModel, setEditModel] = useState("");

  // 打开编辑模态框
  const openEditModal = (character: AICharacter) => {
    setEditingCharacter(character);
    setEditProvider(character.apiProvider);
    setEditModel(character.model);
  };

  // 保存编辑
  const saveEdit = () => {
    if (!editingCharacter) return;
    onUpdateCharacter(editingCharacter.id, {
      apiProvider: editProvider,
      model: editModel,
    });
    setEditingCharacter(null);
  };

  // 获取可用模型列表
  const getAvailableModels = (provider: string): string[] => {
    const cached = storageService.getCachedModels(provider);
    if (cached && cached.length > 0) {
      return cached;
    } 
    // else {
    //   try {
    //     let models: string[] = [];

    //     if (provider === "siliconflow") {
    //       // SiliconFlow 支持动态获取
    //       models = await aiService.fetchSiliconFlowModels(apiKey);
    //     } else if (provider === "openrouter") {
    //       // OpenRouter 支持动态获取
    //       models = await aiService.fetchOpenRouterModels(apiKey);
    //     } else {
    //       // 其他供应商使用默认列表
    //       models = aiService.getAvailableModels(provider);
    //     }
    //   } catch (error) {}
    // }
    return API_PROVIDERS[provider]?.models || [];
  };

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <div className="text-lg font-mono">暂无对话内容</div>
        </div>
      </div>
    );
  }

  const getCharacterById = (id: string) => {
    return characters.find((c) => c.id === id);
  };

  const getStatusColor = (status: AICharacter["status"]) => {
    switch (status) {
      case "idle":
        return "text-gray-400";
      case "thinking":
        return "text-neon-yellow";
      case "speaking":
        return "text-neon-cyan";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = (status: AICharacter["status"]) => {
    switch (status) {
      case "idle":
        return "空闲";
      case "thinking":
        return "思考中";
      case "speaking":
        return "发言中";
      case "error":
        return "错误";
      default:
        return "未知";
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* 对话概览 */}
      <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neon-cyan">当前对话</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              第 {conversation.round} 轮
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono ${
                conversation.isActive
                  ? "bg-green-900 text-green-300 border border-green-400"
                  : "bg-gray-700 text-gray-300 border border-gray-500"
              }`}
            >
              {conversation.isActive ? "进行中" : "已暂停"}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neon-green mb-2">
            讨论主题
          </h3>
          <div className="bg-gray-900 border border-gray-600 p-3 rounded text-white font-mono">
            {conversation.topic}
          </div>
        </div>

        {/* 角色状态 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-gray-900 border border-gray-600 p-4 rounded-lg"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="character-avatar"
                  style={{ borderColor: character.color }}
                >
                  {character.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-white">{character.name}</h4>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`status-indicator ${character.status}`}
                    ></div>
                    <span
                      className={`text-xs ${getStatusColor(character.status)}`}
                    >
                      {getStatusText(character.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>提供商:</span>
                    <span className="text-gray-300">
                      {character.apiProvider === "siliconflow"
                        ? "SiliconFlow"
                        : character.apiProvider === "openrouter"
                        ? "OpenRouter"
                        : character.apiProvider === "deepseek"
                        ? "DeepSeek"
                        : "自定义"}
                    </span>
                  </div>
                  <text
                    onClick={() => openEditModal(character)}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-xs transition-colors"
                  >
                    编辑
                  </text>
                </div>
                <div>
                  模型:{" "}
                  <span className="font-mono text-yellow-400">
                    {character.model}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 对话消息 */}
      <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neon-cyan">对话记录</h2>
          <div className="text-sm text-gray-400">
            {conversation.messages.length} 条消息
            {conversation.currentSpeakingMessage && " (+1 正在输入)"}
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pixel-scrollbar">
          {conversation.messages.length === 0 &&
          !conversation.currentSpeakingMessage ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">💬</div>
              <div className="font-mono">等待AI开始对话...</div>
            </div>
          ) : (
            <>
              {conversation.messages.map((message) => {
                const character = getCharacterById(message.characterId);
                if (!character) return null;

                return (
                  <div key={message.id} className="message-bubble">
                    <div className="flex items-start space-x-3">
                      <div
                        className="character-avatar flex-shrink-0"
                        style={{ borderColor: character.color }}
                      >
                        {character.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className="font-bold text-sm"
                            style={{ color: character.color }}
                          >
                            {character.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* 流式消息显示 */}
              {conversation.currentSpeakingMessage && (
                <div className="message-bubble">
                  <div className="flex items-start space-x-3">
                    <div
                      className="character-avatar flex-shrink-0"
                      style={{
                        borderColor: getCharacterById(
                          conversation.currentSpeakingMessage.characterId
                        )?.color,
                      }}
                    >
                      {
                        getCharacterById(
                          conversation.currentSpeakingMessage.characterId
                        )?.avatar
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className="font-bold text-sm"
                          style={{
                            color: getCharacterById(
                              conversation.currentSpeakingMessage.characterId
                            )?.color,
                          }}
                        >
                          {
                            getCharacterById(
                              conversation.currentSpeakingMessage.characterId
                            )?.name
                          }
                        </span>
                        <span className="text-xs text-neon-yellow animate-pulse">
                          正在输入中...
                        </span>
                      </div>
                      <div className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {conversation.currentSpeakingMessage.content}
                        <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="bg-gray-800 border-2 border-cyan-400 p-6 rounded-lg neon-border">
        <h2 className="text-xl font-bold text-neon-cyan mb-4 flex items-center">
          <span className="mr-2">🎮</span>
          对话控制
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 暂停/继续 */}
          <button
            onClick={onToggleConversation}
            disabled={isProcessing}
            className={`pixel-button py-3 ${
              conversation.isActive ? "pink" : "green"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-center space-x-2">
              {conversation.isActive ? (
                <>
                  <span>⏸️</span>
                  <span>暂停对话</span>
                </>
              ) : (
                <>
                  <span>▶️</span>
                  <span>继续对话</span>
                </>
              )}
            </div>
          </button>

          {/* 下一轮 */}
          <button
            onClick={onProcessNextTurn}
            disabled={!conversation.isActive || isProcessing}
            className={`pixel-button yellow ${
              !conversation.isActive || isProcessing
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>⏭️</span>
              <span>下一轮</span>
            </div>
          </button>

          {/* 重置 */}
          <button
            onClick={onResetConversation}
            disabled={isProcessing}
            className={`pixel-button ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔄</span>
              <span>重置对话</span>
            </div>
          </button>
        </div>

        {/* 状态信息 */}
        <div className="mt-4 p-3 bg-gray-900 border border-gray-600 rounded">
          <div className="text-sm font-mono text-gray-300 space-y-1">
            <div>当前轮次: {conversation.round}</div>
            <div>消息数量: {conversation.messages.length}</div>
            <div>参与角色: {characters.length}</div>
            <div>对话状态: {conversation.isActive ? "进行中" : "已暂停"}</div>
            {isProcessing && (
              <div className="text-neon-yellow">正在处理下一轮对话...</div>
            )}
          </div>
        </div>

        {/* 操作提示 */}
        <div className="mt-4 p-3 bg-blue-900 border border-blue-400 rounded">
          <div className="flex items-center mb-2">
            <span className="mr-2">💡</span>
            <span className="font-mono font-bold text-blue-100">操作提示</span>
          </div>
          <ul className="space-y-1 text-xs font-mono text-blue-200">
            <li>• 暂停/继续: 控制对话的进行状态</li>
            <li>• 下一轮: 手动触发下一轮对话</li>
            <li>• 重置: 清空对话历史，重新开始</li>
            <li>• AI会按照角色顺序轮流发言</li>
          </ul>
        </div>
      </div>

      {/* 编辑模态框 */}
      {editingCharacter && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEditingCharacter(null)}
        >
          <div
            className="bg-gray-900 border-2 border-cyan-400 p-6 rounded-lg neon-border max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neon-green">
                编辑角色配置
              </h3>
              <button
                onClick={() => setEditingCharacter(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 角色名称 */}
              <div>
                <div className="text-sm font-mono text-gray-300 mb-2">
                  角色名称
                </div>
                <div className="bg-gray-800 border border-gray-600 p-2 rounded text-white">
                  {editingCharacter.name}
                </div>
              </div>

              {/* API提供商选择 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  API提供商
                </label>
                <select
                  value={editProvider}
                  onChange={(e) => {
                    const newProvider = e.target.value as typeof editProvider;
                    setEditProvider(newProvider);
                    // 重置模型为第一个可用模型
                    const availableModels = getAvailableModels(newProvider);
                    if (availableModels.length > 0) {
                      setEditModel(availableModels[0]);
                    } else {
                      setEditModel("");
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="siliconflow">SiliconFlow</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              {/* 模型选择 */}
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  模型
                </label>
                {editProvider === "deepseek" ? (
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    placeholder="请输入模型名称，例如: deepseek-chat"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                ) : (
                  <select
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="">请选择模型</option>
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
            <div className="flex space-x-3 mt-6">
              <button
                onClick={saveEdit}
                className="flex-1 pixel-button green"
                disabled={!editModel.trim()}
              >
                保存
              </button>
              <button
                onClick={() => setEditingCharacter(null)}
                className="flex-1 pixel-button"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationView;

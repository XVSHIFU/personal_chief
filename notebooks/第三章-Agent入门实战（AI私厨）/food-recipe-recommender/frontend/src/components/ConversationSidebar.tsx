import React from 'react'
import { MessageSquare, Plus, Clock, Trash2, X } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import type { Conversation } from '../store/chatStore'

interface ConversationSidebarProps {
  onClose?: () => void
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({ onClose }) => {
  const conversations = useChatStore((state) => state.conversations)
  const currentConversationId = useChatStore((state) => state.currentConversationId)
  const addConversation = useChatStore((state) => state.addConversation)
  const deleteConversation = useChatStore((state) => state.deleteConversation)
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation)

  const handleNewConversation = () => {
    addConversation({
      title: '新的对话',
      preview: '',
      messageCount: 0,
      unread: false,
    })
  }

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    if (window.confirm('确定要删除这个对话吗？')) {
      deleteConversation(conversationId)
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversation(conversationId)
    if (onClose) onClose()
  }

  // 格式化时间显示（兼容本地存储反序列化后的字符串时间）
  const formatTime = (value: Date | string | number) => {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '未知时间'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="w-full glass-effect memphis-card memphis-animate-in rounded-2xl shadow-lg flex flex-col h-full">
      {/* 侧边栏头部 */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare size={18} />
              历史对话
            </h2>
            {/* 移动端关闭按钮 */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1 text-gray-500 hover:text-red-500"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            onClick={handleNewConversation}
            className="p-2 bg-yellow-300 text-black rounded-xl hover:bg-pink-300 transition-all memphis-button"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
            <p>暂无历史对话</p>
            <p className="text-sm mt-1">点击上方"+"按钮开始新对话</p>
          </div>
        ) : (
          conversations.map((conv: Conversation) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`p-2 sm:p-3 rounded-xl mb-2 cursor-pointer transition-all hover:bg-cyan-100/70 border-2 border-transparent ${conv.id === currentConversationId ? 'sidebar-item-active' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-800 truncate text-sm sm:text-base">{conv.title}</h3>
                    {conv.unread && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">{conv.preview || '暂无消息'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(conv.lastUpdated)}
                  </span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 移动端抽屉开关 */}
      {onClose && (
        <div className="md:hidden p-4 border-t border-gray-200/50">
          <button
            onClick={onClose}
            className="w-full py-2 text-center text-gray-500 hover:text-orange-500"
          >
            收起侧边栏
          </button>
        </div>
      )}
    </div>
  )
}

export default ConversationSidebar
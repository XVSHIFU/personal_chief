import React, { useEffect, useMemo } from 'react'
import { UtensilsCrossed, Loader } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { useChatStore } from '../store/chatStore'
import { apiService } from '../services/api'
import type { Message as ChatMessage } from '../store/chatStore'

const ChatArea: React.FC = () => {
  const messages = useChatStore((state) => state.messages)
  const currentConversationId = useChatStore((state) => state.currentConversationId)
  const isLoading = useChatStore((state) => state.isLoading)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const setLoading = useChatStore((state) => state.setLoading)
  const setMessages = useChatStore((state) => state.setMessages)

  // 当切换对话时加载历史消息
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentConversationId) {
        setMessages([])
        return
      }

      setLoading(true)
      try {
        const response = await apiService.getMessages(currentConversationId)
        const now = new Date()
        const loadedMessages = response.messages.map((msg, index) => ({
          id: `${currentConversationId}-${index}-${msg.role}`,
          role: msg.role,
          content: msg.content,
          timestamp: now,
          imageUrl: msg.image_url || null,
        }))
        setMessages(loadedMessages)
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [currentConversationId, setLoading, setMessages])

  // 格式化消息时间
  const formatMessageTime = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    if (Number.isNaN(date.getTime())) return '--:--'
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 处理示例问题点击
  const handleExampleClick = async (exampleText: string) => {
    if (isLoading || isStreaming) return
    try {
      await apiService.streamChat(exampleText)
    } catch (error) {
      console.error('发送示例消息失败:', error)
    }
  }

  // 准备消息数据用于显示
  const displayMessages = useMemo(() =>
    messages.map((msg: ChatMessage) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      time: formatMessageTime(msg.timestamp || new Date()),
      imageUrl: msg.imageUrl,
    })),
    [messages]
  )

  return (
    <div className="flex-1 glass-effect memphis-card memphis-animate-in rounded-2xl shadow-lg overflow-hidden flex flex-col">
      {/* 聊天区域头部 */}
      <div className="p-3 sm:p-4 border-b-4 border-black bg-white/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-300 border-2 border-black rounded-xl">
              <UtensilsCrossed className="text-black" size={20} />
            </div>
            <div>
              <h2 className="font-black text-gray-900">当前对话</h2>
              <p className="text-sm text-gray-600">AI私厨正在为您服务</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {messages.length} 条消息
            {isStreaming && <span className="ml-2 text-orange-500">AI正在回复...</span>}
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Loader className="animate-spin text-orange-500 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-600">加载消息中...</p>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6">
              <UtensilsCrossed className="text-orange-500" size={48} />
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-2">欢迎使用AI私厨</p>
            <p className="text-gray-500 text-center mb-8 max-w-md">
              上传食材图片或描述现有食材，我会为您推荐个性化食谱
            </p>

            {/* 示例问题 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              <div
                onClick={() => handleExampleClick('我有西红柿和鸡蛋，能做什么菜？')}
                className="p-3 bg-white border-4 border-black rounded-xl text-left cursor-pointer hover:bg-yellow-100 transition-colors active:scale-95 memphis-shadow memphis-chip"
              >
                <p className="font-medium text-gray-800 mb-1">我有西红柿和鸡蛋，能做什么菜？</p>
                <p className="text-xs text-gray-500">推荐简单家常菜</p>
              </div>
              <div
                onClick={() => handleExampleClick('减脂期间适合吃什么？')}
                className="p-3 bg-white border-4 border-black rounded-xl text-left cursor-pointer hover:bg-pink-100 transition-colors active:scale-95 memphis-shadow memphis-chip"
              >
                <p className="font-medium text-gray-800 mb-1">减脂期间适合吃什么？</p>
                <p className="text-xs text-gray-500">健康低卡食谱</p>
              </div>
              <div
                onClick={() => handleExampleClick('快速早餐有什么建议？')}
                className="p-3 bg-white border-4 border-black rounded-xl text-left cursor-pointer hover:bg-cyan-100 transition-colors active:scale-95 memphis-shadow memphis-chip"
              >
                <p className="font-medium text-gray-800 mb-1">快速早餐有什么建议？</p>
                <p className="text-xs text-gray-500">15分钟内完成</p>
              </div>
              <div
                onClick={() => handleExampleClick('上传图片识别食材')}
                className="p-3 bg-white border-4 border-black rounded-xl text-left cursor-pointer hover:bg-green-100 transition-colors active:scale-95 memphis-shadow memphis-chip"
              >
                <p className="font-medium text-gray-800 mb-1">上传图片识别食材</p>
                <p className="text-xs text-gray-500">自动分析推荐食谱</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-8">点击上方按钮上传图片或直接输入问题</p>
          </div>
        ) : (
          displayMessages.map((msg: { id: string; role: 'user' | 'assistant'; content: string; time: string; imageUrl?: string | null }) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>
    </div>
  )
}

export default ChatArea
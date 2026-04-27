import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date | string | number
  imageUrl?: string | null
}

export interface Conversation {
  id: string
  title: string
  preview: string
  lastUpdated: Date | string | number
  messageCount: number
  unread: boolean
}

const toValidDate = (value: Date | string | number | unknown): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  const date = new Date(value as string | number)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

interface ChatState {
  // 当前对话
  currentConversationId: string | null
  messages: Message[]

  // 对话列表
  conversations: Conversation[]

  // 加载状态
  isLoading: boolean
  isStreaming: boolean

  // Actions
  setCurrentConversation: (conversationId: string) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string
  updateMessage: (messageId: string, content: string) => void
  clearConversation: () => void
  setMessages: (messages: Message[]) => void

  addConversation: (conversation: Omit<Conversation, 'id' | 'lastUpdated'>) => string
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void
  deleteConversation: (conversationId: string) => void
  renameConversation: (conversationId: string, title: string) => void

  setLoading: (loading: boolean) => void
  setStreaming: (streaming: boolean) => void

  // 生成对话标题
  generateConversationTitle: (firstMessage: string) => string
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentConversationId: null,
      messages: [],
      conversations: [],
      isLoading: false,
      isStreaming: false,

      // 设置当前对话
      setCurrentConversation: (conversationId) => {
        set((state) => {
          // 标记当前对话为已读，其他对话保持原样
          const updatedConversations = state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, unread: false }
              : conv
          )

          return {
            currentConversationId: conversationId,
            conversations: updatedConversations,
          }
        })
        // 消息加载由ChatArea组件的useEffect处理
      },

      // 添加消息，返回新消息的ID
      addMessage: (message): string => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9)
        const now = new Date()
        const newMessage: Message = {
          ...message,
          id,
          timestamp: now,
        }

        set((state) => ({
          messages: [...state.messages, newMessage],
        }))

        // 更新当前对话的预览和元数据
        const state = get()
        if (state.currentConversationId) {
          // 如果有消息内容，更新预览（用户消息或非空的AI消息）
          const previewText = message.content
            ? (message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''))
            : (message.role === 'user' ? '[图片消息]' : 'AI正在回复...')

          get().updateConversation(state.currentConversationId, {
            preview: previewText,
            lastUpdated: now,
            messageCount: state.messages.length + 1, // 包括新消息
            unread: false, // 当前对话已读
          })
        }

        return id
      },

      // 更新消息（用于流式响应）
      updateMessage: (messageId, content) => {
        set((state) => {
          // 更新消息内容
          const updatedMessages = state.messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: msg.content + content }
              : msg
          )

          // 找到被更新的消息（用于预览）
          const updatedMsg = updatedMessages.find(msg => msg.id === messageId)

          // 如果这是AI消息并且有当前对话，更新对话预览
          if (updatedMsg && updatedMsg.role === 'assistant' && state.currentConversationId) {
            const previewText = updatedMsg.content
              ? (updatedMsg.content.substring(0, 50) + (updatedMsg.content.length > 50 ? '...' : ''))
              : 'AI正在回复...'

            // 更新对应的对话
            const updatedConversations = state.conversations.map((conv) =>
              conv.id === state.currentConversationId
                ? {
                    ...conv,
                    preview: previewText,
                    lastUpdated: new Date(),
                    messageCount: updatedMessages.length,
                    unread: false,
                  }
                : conv
            )

            return {
              messages: updatedMessages,
              conversations: updatedConversations,
            }
          }

          return { messages: updatedMessages }
        })
      },

      // 清空当前对话
      clearConversation: () => {
        set({ messages: [] })
      },

      // 设置消息列表
      setMessages: (messages: Message[]) => {
        set({ messages })
      },

      // 添加新对话
      addConversation: (conversation) => {
        const id = Date.now().toString()
        const now = new Date()
        const newConversation: Conversation = {
          ...conversation,
          id,
          lastUpdated: now,
        }

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
          messages: [],
        }))

        return id
      },

      // 更新对话
      updateConversation: (conversationId, updates) => {
        const now = new Date()
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, ...updates, lastUpdated: now }
              : conv
          ),
        }))
      },

      // 删除对话
      deleteConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== conversationId),
          currentConversationId:
            state.currentConversationId === conversationId
              ? state.conversations.length > 1
                ? state.conversations[1].id
                : null
              : state.currentConversationId,
        }))
      },

      // 重命名对话
      renameConversation: (conversationId, title) => {
        get().updateConversation(conversationId, { title })
      },

      // 设置加载状态
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      // 设置流式响应状态
      setStreaming: (streaming) => {
        set({ isStreaming: streaming })
      },

      // 生成对话标题
      generateConversationTitle: (firstMessage) => {
        const message = firstMessage.toLowerCase()

        // 检查常见食材组合（优先级从高到低）
        if ((message.includes('西红柿') || message.includes('番茄')) && message.includes('鸡蛋')) {
          return '西红柿炒蛋食谱'
        } else if ((message.includes('土豆') || message.includes('马铃薯')) && message.includes('牛肉')) {
          return '土豆炖牛肉'
        } else if (message.includes('鸡肉') && message.includes('蘑菇')) {
          return '小鸡炖蘑菇'
        } else if (message.includes('鱼') && message.includes('香煎')) {
          return '香煎鱼料理'
        }

        // 检查单个主要食材
        if (message.includes('西红柿') || message.includes('番茄')) {
          return '西红柿食谱'
        } else if (message.includes('鸡蛋')) {
          return '鸡蛋料理'
        } else if (message.includes('鸡肉')) {
          return '鸡肉烹饪'
        } else if (message.includes('牛肉')) {
          return '牛肉大餐'
        } else if (message.includes('猪肉')) {
          return '猪肉菜肴'
        } else if (message.includes('鱼') || message.includes('海鲜')) {
          return '海鲜料理'
        } else if (message.includes('虾')) {
          return '虾仁美食'
        } else if (message.includes('土豆') || message.includes('马铃薯')) {
          return '土豆食谱'
        } else if (message.includes('蘑菇')) {
          return '菌菇料理'
        } else if (message.includes('豆腐')) {
          return '豆腐菜肴'
        } else if (message.includes('米饭') || message.includes('炒饭')) {
          return '米饭主食'
        } else if (message.includes('面条') || message.includes('拉面') || message.includes('意大利面')) {
          return '面食制作'
        } else if (message.includes('蔬菜') || message.includes('青菜') || message.includes('绿叶菜')) {
          return '蔬菜食谱'
        }

        // 检查烹饪场景和需求
        if (message.includes('快速') || message.includes('简单') || message.includes('快手')) {
          return '快手菜'
        } else if (message.includes('健康') || message.includes('减肥') || message.includes('低脂')) {
          return '健康饮食'
        } else if (message.includes('辣') || message.includes('麻辣') || message.includes('香辣')) {
          return '辣味美食'
        } else if (message.includes('甜') || message.includes('甜品') || message.includes('蛋糕')) {
          return '甜点制作'
        } else if (message.includes('汤') || message.includes('炖汤') || message.includes('煲汤')) {
          return '汤品食谱'
        } else if (message.includes('炒') || message.includes('翻炒')) {
          return '炒菜技巧'
        } else if (message.includes('烤') || message.includes('烘焙') || message.includes('烤箱')) {
          return '烘焙料理'
        } else if (message.includes('火锅') || message.includes('涮锅')) {
          return '火锅准备'
        } else if (message.includes('早餐') || message.includes('早饭')) {
          return '早餐建议'
        } else if (message.includes('午餐') || message.includes('午饭')) {
          return '午餐方案'
        } else if (message.includes('晚餐') || message.includes('晚饭') || message.includes('晚餐')) {
          return '晚餐计划'
        } else if (message.includes('夜宵') || message.includes('宵夜')) {
          return '夜宵推荐'
        } else if (message.includes('聚餐') || message.includes('宴客')) {
          return '聚餐菜单'
        } else if (message.includes('儿童') || message.includes('宝宝')) {
          return '儿童餐食'
        } else if (message.includes('素食') || message.includes('斋菜')) {
          return '素食食谱'
        }

        // 如果消息很短或只有图片
        if (message.trim().length <= 3 || message.includes('图片') || message.includes('照片')) {
          return '图片食谱咨询'
        }

        // 默认标题：截取前10个字符
        const trimmed = firstMessage.trim()
        if (trimmed.length > 10) {
          return trimmed.substring(0, 10) + '...'
        } else if (trimmed.length > 0) {
          return trimmed
        }

        return '新的对话'
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.conversations?.length) return

        state.conversations = state.conversations.map((conv) => ({
          ...conv,
          lastUpdated: toValidDate(conv.lastUpdated),
        }))
      },
    }
  )
)
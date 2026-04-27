import { useChatStore } from '../store/chatStore'

export interface ChatRequest {
  message: string
  image_url?: string
  thread_id: string
}

export interface ChatResponse {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    image_url?: string | null
  }>
}

class ApiService {
  private baseUrl = '/api/v1'

  private buildUploadFilename(file: File): string {
    const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'jpg'
    return `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext || 'jpg'}`
  }

  // 流式聊天
  async streamChat(message: string, imageUrl?: string, threadId?: string): Promise<void> {
    const store = useChatStore.getState()
    let currentThreadId = threadId || store.currentConversationId

    // 如果没有当前对话，创建一个新的
    if (!currentThreadId) {
      currentThreadId = store.addConversation({
        title: '新的对话',
        preview: '',
        messageCount: 0,
        unread: false,
      })
    }

    // 添加用户消息到本地状态
    store.addMessage({
      role: 'user',
      content: message,
      imageUrl,
    })

    // 创建AI消息占位符，使用store.addMessage生成ID
    const aiMessageId = store.addMessage({
      role: 'assistant',
      content: '',
      imageUrl: null,
    })

    try {
      store.setStreaming(true)

      const response = await fetch(`${this.baseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          image_url: imageUrl,
          thread_id: currentThreadId,
        } as ChatRequest),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        // 更新AI消息内容
        store.updateMessage(aiMessageId, chunk)
      }

      // 如果这是新对话，生成标题
      const messages = useChatStore.getState().messages
      if (messages.filter(m => m.role === 'user').length === 1) {
        const title = store.generateConversationTitle(message)
        store.renameConversation(currentThreadId, title)
      }

    } catch (error) {
      console.error('Stream chat error:', error)
      store.updateMessage(aiMessageId, '抱歉，发送消息时出错了。请稍后重试。')
    } finally {
      store.setStreaming(false)
    }
  }

  // 获取历史消息
  async getMessages(threadId: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/messages?thread_id=${threadId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Get messages error:', error)
      throw error
    }
  }

  // 上传图片到OSS（通过后端获取签名URL）
  async uploadImage(file: File): Promise<string> {
    try {
      const filename = this.buildUploadFilename(file)

      // 1. 获取上传签名URL（后端使用 query 参数）
      const response = await fetch(`${this.baseUrl}/oss/presign?filename=${encodeURIComponent(filename)}`)

      if (!response.ok) {
        throw new Error(`Failed to get upload URL: ${response.status}`)
      }

      const { uploadUrl, accessUrl, contentType } = await response.json()

      // 2. 上传文件到OSS
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType || file.type || 'application/octet-stream',
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload to OSS: ${uploadResponse.status}`)
      }

      return accessUrl
    } catch (error) {
      console.error('Upload image error:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
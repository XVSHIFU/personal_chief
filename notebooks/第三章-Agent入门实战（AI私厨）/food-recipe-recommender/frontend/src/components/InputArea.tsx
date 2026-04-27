import React, { useEffect, useRef, useState } from 'react'
import { Image, Send, Upload, X } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { apiService } from '../services/api'

const InputArea: React.FC = () => {
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)
  const isStreaming = useChatStore((state) => state.isStreaming)

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  useEffect(() => {
    const blockBrowserFileDrop = (e: DragEvent) => {
      e.preventDefault()
    }

    window.addEventListener('dragover', blockBrowserFileDrop)
    window.addEventListener('drop', blockBrowserFileDrop)

    return () => {
      window.removeEventListener('dragover', blockBrowserFileDrop)
      window.removeEventListener('drop', blockBrowserFileDrop)
    }
  }, [])

  const selectImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      selectImage(file)
    }
  }

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isStreaming) return
    dragCounterRef.current += 1
    setIsDragging(true)
  }

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isStreaming) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragging(false)

    if (isStreaming) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      selectImage(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !imageFile) return

    const text = message.trim()
    let imageUrl: string | undefined

    // 如果有图片，先上传
    if (imageFile) {
      try {
        imageUrl = await apiService.uploadImage(imageFile)
      } catch (error) {
        console.error('图片上传失败:', error)
        alert('图片上传失败，请重试')
        return
      }
    }

    // 上传成功后立即清空输入，AI 流式回复在后台进行
    setMessage('')
    removeImage()

    void apiService.streamChat(text, imageUrl).catch((error) => {
      console.error('发送消息失败:', error)
      alert('发送消息失败，请重试')
    })
  }

  const isUploading = isStreaming

  return (
    <div
      className={`mt-4 input-area relative transition-all duration-200 ${isDragging ? 'ring-4 ring-orange-300 ring-offset-2 bg-orange-50/30' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        {/* 拖拽提示 */}
        {isDragging && (
          <div className="absolute inset-0 bg-yellow-100/90 rounded-2xl z-10 flex flex-col items-center justify-center border-4 border-dashed border-black">
            <div className="p-4 bg-cyan-200 border-2 border-black rounded-full mb-3">
              <Upload size={32} className="text-orange-500" />
            </div>
            <p className="font-medium text-gray-700">松开以上传图片</p>
            <p className="text-sm text-gray-500 mt-1">支持 JPG、PNG 格式</p>
          </div>
        )}

        {/* 图片预览 */}
        {imagePreview && (
          <div className="mb-3 relative">
            <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50/80 rounded-xl">
              <img
                src={imagePreview}
                alt="预览"
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">已选择图片</p>
                <p className="text-xs text-gray-400">
                  {imageFile?.name || '未命名图片'}
                </p>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 text-gray-500 hover:text-red-600"
                disabled={isUploading}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 items-end">
          {/* 图片上传按钮 */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="image-upload"
              className={`memphis-button h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl cursor-pointer transition-all ${isUploading ? 'text-gray-300 cursor-not-allowed bg-gray-100 border-gray-300 shadow-none' : 'text-black bg-yellow-200 hover:bg-pink-200'}`}
            >
              {imagePreview ? <Upload size={20} /> : <Image size={20} />}
            </label>
          </div>

          {/* 文本输入框 */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="描述你有的食材或上传图片..."
            className="flex-1 min-h-11 sm:min-h-12 bg-white border-4 border-black rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 resize-none focus:outline-none focus:ring-0 transition-all"
            rows={1}
            disabled={isUploading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />

          {/* 发送按钮 */}
          <button
            type="submit"
            disabled={(!message.trim() && !imageFile) || isUploading}
            className="memphis-button h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl bg-cyan-300 text-black hover:bg-green-300 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:border-gray-300 disabled:shadow-none transition-all"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* 快捷提示 */}
        <div className="mt-3 text-xs text-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span>支持上传食材图片或描述食材</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline">拖拽图片到此区域</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Enter发送，Shift+Enter换行</span>
            {isUploading && <span className="text-orange-500">AI正在回复...</span>}
          </div>
        </div>
      </form>
    </div>
  )
}

export default InputArea
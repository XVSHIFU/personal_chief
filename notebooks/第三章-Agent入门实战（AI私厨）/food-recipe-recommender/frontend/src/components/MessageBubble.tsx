import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, Bot, Clock } from 'lucide-react'

const normalizeImageUrl = (src?: string) => {
  if (!src) return ''
  const cleaned = src.trim().replace(/^<|>$/g, '')
  if (cleaned.startsWith('//')) return `https:${cleaned}`
  return cleaned
}

const isHttpUrl = (url: string) => /^https?:\/\//i.test(url)

const MarkdownImage: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = React.useState(false)
  const finalSrc = normalizeImageUrl(src)

  if (!finalSrc || !isHttpUrl(finalSrc)) {
    return <span className="text-xs text-gray-500">图片链接无效</span>
  }

  if (hasError) {
    return (
      <div className="text-sm text-gray-500">
        图片加载失败，
        <a
          href={finalSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
        >
          点击查看原图
        </a>
      </div>
    )
  }

  return (
    <img
      src={finalSrc}
      alt={alt || '食谱图片'}
      className="rounded-lg sm:rounded-xl max-w-full max-h-48 sm:max-h-64 md:max-h-80 object-cover mx-auto"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  )
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  imageUrl?: string | null
}

interface MessageBubbleProps {
  message: Message
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user'
  const [userImageError, setUserImageError] = React.useState(false)
  const normalizedUserImage = normalizeImageUrl(message.imageUrl || undefined)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1 sm:mb-2`}>
      <div className={`memphis-card memphis-animate-in max-w-[97%] xs:max-w-[96%] sm:max-w-[95%] md:max-w-[95%] lg:max-w-[94%] xl:max-w-[93%] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-sm ${isUser ? 'message-bubble-user' : 'message-bubble-assistant'}`}>
        {/* 消息头部 */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <div className={`p-1 sm:p-1.5 rounded-full border-2 border-black ${isUser ? 'bg-yellow-200' : 'bg-cyan-300'}`}>
            {isUser ? (
              <User size={12} className="text-black" />
            ) : (
              <Bot size={12} className="text-black" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-medium">
            {isUser ? '您' : 'AI私厨'}
          </span>
          <span className="text-xs text-gray-600 flex items-center gap-1 ml-auto">
            <Clock size={10} />
            {message.time}
          </span>
        </div>

        {/* 消息内容 */}
        <div className="text-gray-900">
          {normalizedUserImage && (
            <div className="mb-2 sm:mb-3">
              {userImageError ? (
                <a
                  href={normalizedUserImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 underline underline-offset-2"
                >
                  图片加载失败，点击查看
                </a>
              ) : (
                <img
                  src={normalizedUserImage}
                  alt="上传的食材"
                  className="rounded-lg sm:rounded-xl max-w-full xs:max-w-40 sm:max-w-48 max-h-24 xs:max-h-28 sm:max-h-32 md:max-h-48 object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setUserImageError(true)}
                />
              )}
            </div>
          )}

          <div className="leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 mt-1 text-gray-800">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 mt-1 text-gray-800">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-1 mt-0.5 sm:mt-1 text-gray-700">{children}</h3>,
                h4: ({ children }) => <h4 className="text-xs sm:text-sm font-semibold mb-1 mt-0.5 sm:mt-1 text-gray-700">{children}</h4>,
                h5: ({ children }) => <h5 className="text-xs sm:text-sm font-medium mb-1 mt-0.5 sm:mt-1 text-gray-600">{children}</h5>,
                h6: ({ children }) => <h6 className="text-xs font-medium mb-1 mt-0.5 sm:mt-1 text-gray-500">{children}</h6>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 ml-3 sm:ml-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 ml-3 sm:ml-4">{children}</ol>,
                li: ({ children }) => <li className="mb-0.5 sm:mb-1">{children}</li>,
                p: ({ children }) => <p className="mb-2 sm:mb-3 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-orange-300 pl-3 sm:pl-4 py-1 my-2 sm:my-3 italic bg-orange-50/30">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-3 sm:my-4 border-gray-200/50" />,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border-collapse border border-gray-200 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
                tr: ({ children }) => <tr className="even:bg-gray-50/50">{children}</tr>,
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border border-gray-300">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 border border-gray-300">{children}</td>
                ),
                code: ({ children, className }) => {
                  const text = String(children)
                  const isBlock = Boolean(className) || text.includes('\n')

                  if (!isBlock) {
                    return (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs sm:text-sm font-mono text-gray-700">
                        {children}
                      </code>
                    )
                  }

                  return (
                    <pre className="bg-gray-50 p-2 sm:p-3 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono my-1.5 sm:my-2 border border-gray-200">
                      <code>{children}</code>
                    </pre>
                  )
                },
                img: ({ src, alt }) => (
                  <div className="my-2 sm:my-3">
                    <MarkdownImage src={src} alt={alt} />
                  </div>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MessageBubble)
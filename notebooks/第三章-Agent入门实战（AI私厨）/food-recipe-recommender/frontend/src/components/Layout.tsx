import React, { ReactNode } from 'react'
import { ChefHat } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative memphis-waves">
      {/* 背景渐变 */}
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-200 via-pink-200 to-cyan-200"></div>

      {/* 装饰性气泡 */}
      <div className="fixed inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      {/* 头部导航 */}
      <header className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4">
        <div className="max-w-[1440px] mx-auto memphis-card memphis-animate-in rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-4 border-black bg-white/95 memphis-shadow">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-pink-300 border-2 border-black rounded-lg sm:rounded-xl">
              <ChefHat className="text-black" size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-purple-700">
                AI 私人厨师
              </h1>
              <p className="text-xs sm:text-sm text-gray-700">上传食材图片，获取个性化食谱推荐</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="relative pt-20 pb-6 px-3 sm:pt-24 sm:pb-8 sm:px-4 max-w-[1440px] mx-auto">
        {children}
      </main>
    </div>
  )
}

export default Layout
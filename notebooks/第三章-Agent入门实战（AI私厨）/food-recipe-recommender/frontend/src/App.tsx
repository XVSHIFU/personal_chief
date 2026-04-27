import { useState } from 'react'
import Layout from './components/Layout'
import ConversationSidebar from './components/ConversationSidebar'
import ChatArea from './components/ChatArea'
import InputArea from './components/InputArea'
import IngredientSidebar from './components/IngredientSidebar'
import { Menu, X } from 'lucide-react'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Layout>
      <div className="flex h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] overflow-hidden">
        {/* 移动端侧边栏切换按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-24 left-4 z-50 p-3 bg-cyan-300 text-black rounded-xl memphis-button hover:bg-pink-300 active:scale-95 transition-all"
          aria-label={sidebarOpen ? "关闭侧边栏" : "打开侧边栏"}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* 侧边栏 - 历史对话 */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 fixed md:relative z-40
          w-full sm:w-72 md:w-80 lg:w-[22rem]
          transition-transform duration-300 ease-in-out
          h-full
        `}>
          <ConversationSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* 侧边栏遮罩层 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 主聊天区域 + 详情栏 */}
        <div className="flex-1 flex flex-col sm:gap-3 md:flex-row md:gap-4 lg:gap-5 min-w-0 min-h-0 gap-2">
          {/* 主聊天区域 */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatArea />
            <InputArea />
          </div>
          {/* 详情栏 - 桌面端显示 */}
          <div className="hidden md:block w-64 lg:w-72 xl:w-80 min-h-0">
            <IngredientSidebar />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App
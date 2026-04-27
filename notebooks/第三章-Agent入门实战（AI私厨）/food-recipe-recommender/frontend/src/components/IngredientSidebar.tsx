import React, { useMemo } from 'react'
import { Utensils, ChefHat, Carrot, Clock } from 'lucide-react'
import { useChatStore } from '../store/chatStore'

// 常见食材关键词（中英文）
const INGREDIENT_KEYWORDS = [
  '西红柿', '番茄', '鸡蛋', '鸡肉', '牛肉', '猪肉', '羊肉', '鱼', '虾', '蟹',
  '豆腐', '蘑菇', '香菇', '金针菇', '土豆', '马铃薯', '胡萝卜', '萝卜', '黄瓜',
  '青椒', '辣椒', '洋葱', '大蒜', '姜', '葱', '香菜', '芹菜', '菠菜', '生菜',
  '白菜', '卷心菜', '花菜', '西兰花', '玉米', '米饭', '面条', '意大利面',
  '面包', '奶酪', '牛奶', '酸奶', '黄油', '酱油', '醋', '盐', '糖', '油',
  'tomato', 'egg', 'chicken', 'beef', 'pork', 'fish', 'shrimp', 'tofu', 'mushroom',
  'potato', 'carrot', 'cucumber', 'pepper', 'onion', 'garlic', 'ginger', 'rice', 'noodle'
]

// 烹饪方法关键词
const COOKING_KEYWORDS = [
  '炒', '煮', '蒸', '炸', '烤', '炖', '煎', '焖', '烧', '拌', '腌',
  'stir-fry', 'boil', 'steam', 'fry', 'roast', 'stew', 'pan-fry', 'braise', 'mix', 'marinate'
]

const IngredientSidebar: React.FC = () => {
  const { messages, currentConversationId, conversations } = useChatStore()

  // 提取当前对话的食材和烹饪方法
  const { ingredients, cookingMethods, recipeSuggestions } = useMemo(() => {
    if (messages.length === 0) {
      return { ingredients: [], cookingMethods: [], recipeSuggestions: [] }
    }

    const allContent = messages.map(m => m.content).join(' ')
    const lowerContent = allContent.toLowerCase()

    // 提取食材关键词
    const foundIngredients = INGREDIENT_KEYWORDS.filter(keyword =>
      lowerContent.includes(keyword.toLowerCase())
    )

    // 去重并限制数量
    const uniqueIngredients = Array.from(new Set(foundIngredients)).slice(0, 8)

    // 提取烹饪方法
    const foundCookingMethods = COOKING_KEYWORDS.filter(keyword =>
      lowerContent.includes(keyword.toLowerCase())
    ).slice(0, 5)

    // 简单提取可能的食谱建议（从AI消息中）
    const recipeSuggestions: string[] = []
    const aiMessages = messages.filter(m => m.role === 'assistant' && m.content)

    // 查找包含"食谱"、"菜谱"、"推荐"等的句子
    aiMessages.forEach(msg => {
      const lines = msg.content.split('\n')
      lines.forEach(line => {
        if ((line.includes('食谱') || line.includes('菜谱') || line.includes('推荐') || line.includes('建议'))
            && line.length < 100) {
          // 清理Markdown格式
          const cleanLine = line.replace(/[#*\-`]/g, '').trim()
          if (cleanLine && !recipeSuggestions.includes(cleanLine)) {
            recipeSuggestions.push(cleanLine)
          }
        }
      })
    })

    // 如果没找到明确的食谱建议，使用默认建议
    if (recipeSuggestions.length === 0 && uniqueIngredients.length > 0) {
      const ingredientStr = uniqueIngredients.slice(0, 3).join('、')
      recipeSuggestions.push(`${ingredientStr}的创意料理`)
      recipeSuggestions.push(`${ingredientStr}快速食谱`)
    }

    return {
      ingredients: uniqueIngredients,
      cookingMethods: foundCookingMethods,
      recipeSuggestions: recipeSuggestions.slice(0, 5)
    }
  }, [messages])

  // 当前对话信息
  const currentConversation = currentConversationId
    ? conversations.find(c => c.id === currentConversationId)
    : null

  // 如果没有当前对话或没有消息，显示引导
  if (!currentConversationId || messages.length === 0) {
    return (
      <div className="glass-effect memphis-card memphis-animate-in rounded-2xl shadow-lg h-full p-4 flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <ChefHat size={18} />
          食材信息
        </h3>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
            <div className="p-3 bg-cyan-200 border-2 border-black rounded-full mb-4">
            <Carrot className="text-orange-400" size={32} />
          </div>
          <p className="text-center font-medium text-gray-600">开始对话以识别食材</p>
          <p className="text-sm mt-2 text-center text-gray-400">
            上传食材图片或描述食材，AI会识别并推荐食谱
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="glass-effect memphis-card memphis-animate-in rounded-2xl shadow-lg h-full min-h-0 p-4 flex flex-col overflow-hidden">
      {/* 头部 */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <ChefHat size={18} />
          食材信息
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} />
          <span>当前对话 · {currentConversation?.messageCount || 0} 条消息</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {/* 识别到的食材 */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Carrot size={16} />
            识别到的食材
          </h4>
          {ingredients.length > 0 ? (
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-yellow-100/70 rounded-lg border-2 border-black memphis-chip"
                >
                  <div className="w-3 h-3 rounded-full bg-pink-400 border border-black"></div>
                  <span className="text-sm text-gray-700">{ingredient}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-gray-50/50 rounded-lg text-center">
              <p className="text-sm text-gray-500">暂无识别的食材</p>
              <p className="text-xs mt-1 text-gray-400">尝试描述更具体的食材名称</p>
            </div>
          )}
        </div>

        {/* 烹饪方法 */}
        {cookingMethods.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3">烹饪方法</h4>
            <div className="flex flex-wrap gap-2">
              {cookingMethods.map((method, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-cyan-100 border-2 border-black rounded-full text-xs text-gray-700 memphis-chip"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 食谱建议 */}
        <div className="pt-4 border-t-4 border-black">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Utensils size={16} />
            推荐食谱
          </h4>
          {recipeSuggestions.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-1.5">
              {recipeSuggestions.map((recipe, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                  <span>{recipe}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                <span>根据食材定制食谱</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                <span>快速简单的家常菜</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                <span>营养均衡的健康餐</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default IngredientSidebar
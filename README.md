# AI 私厨

拍一张冰箱里的食材照片，或者直接输入「我有番茄、鸡蛋和豆腐，两个人吃，能做什么？」AI 私厨会根据食材搜索菜谱，给出做法和推荐理由。你可以在同一段对话中继续问「只有一口锅，哪道菜最省事？」

这是一个 LangChain 多模态 Agent 课程实践仓库。前两章是 Python Notebook，第三章包含可以本地运行的食谱推荐应用。[应用源码](notebooks/第三章-Agent入门实战（AI私厨）/food-recipe-recommender/) · [项目笔记](https://xvshifu.github.io/xvsf/posts/ai-%E7%A7%81%E5%8E%A8/)

## 一次推荐是怎么完成的

1. **输入食材。** React 页面支持文字和照片。上传照片时，前端先向 FastAPI 申请签名 URL，再将图片直传阿里云 OSS，聊天请求中只携带图片地址。
2. **搜索菜谱。** 后端把文字和图片组成一条多模态消息，交给 `qwen3-omni-flash`。Agent 可以调用 Tavily 搜索菜谱，提示词要求它结合食材、制作难度和营养搭配给出建议。
3. **继续追问。** FastAPI 将回答逐段返回页面。LangGraph 的 SQLite Checkpointer 按 `thread_id` 保存会话，因此「换一道」「少放油」这类追问可以沿用前面的食材清单。

## 本地运行

以下命令适用于 PowerShell，使用 Python 3.12 和 uv。应用目录里有独立的依赖锁文件和已构建的前端页面。

```powershell
git clone https://github.com/XVSHIFU/personal_chief.git
cd "personal_chief/notebooks/第三章-Agent入门实战（AI私厨）/food-recipe-recommender"
uv sync --locked --python 3.12
New-Item -ItemType Directory -Force db | Out-Null
```

在当前目录创建 `.env`，配置百炼、Tavily 和阿里云 OSS。应用启动时就会读取 OSS 访问密钥，即使先体验文字对话，也需要填写这两项。示例按北京地域配置。

```dotenv
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=你的百炼密钥
TAVILY_API_KEY=你的Tavily密钥
OSS_BUCKET=你的Bucket名称
OSS_ENDPOINT=oss-cn-beijing.aliyuncs.com
OSS_ACCESS_KEY_ID=你的OSS访问密钥ID
OSS_ACCESS_KEY_SECRET=你的OSS访问密钥Secret
```

从应用目录启动服务。

```powershell
uv run python -m app.main
```

打开 [本地应用](http://127.0.0.1:8001/) 输入食材清单，或到 [FastAPI 接口文档](http://127.0.0.1:8001/docs) 查看请求参数。试用照片上传时，Bucket 的 CORS 规则需要允许本地页面发起带 `Content-Type` 的 `PUT` 请求，模型服务也需要能够读取上传后的图片 URL。

## 从哪里读代码

| 文件 | 主要内容 |
| --- | --- |
| [personal_chief.py](notebooks/第三章-Agent入门实战（AI私厨）/food-recipe-recommender/app/agents/personal_chief.py) | Agent 的提示词、模型和搜索工具，以及 SQLite 会话保存与读取 |
| [chat.py](notebooks/第三章-Agent入门实战（AI私厨）/food-recipe-recommender/app/api/v1/chat.py) | 流式聊天接口、历史消息读取和清空 |
| [oss.py](notebooks/第三章-Agent入门实战（AI私厨）/food-recipe-recommender/app/api/v1/oss.py) | 图片上传签名和访问地址 |
| [api.ts](notebooks/第三章-Agent入门实战（AI私厨）/food-recipe-recommender/frontend/src/services/api.ts) | 浏览器如何上传图片、发送消息和逐段显示回答 |

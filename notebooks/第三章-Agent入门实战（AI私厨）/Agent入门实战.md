# Agent入门实战（AI 私厨）



# 1.需求分析

AI 私厨是一个基于 LangChain 和多模态 AI 的食谱推荐应用。用户可以拍摄自家冰箱或厨房的食物照片，AI 会自动识别图片中的食材，根据食材搜索相关食谱推荐给用户。

## 1.1 功能特性

- 📸 **图片识别** - 上传食材图片，自动识别其中的食材
- 🔍 **智能搜索** - 根据识别的食材搜索相关食谱
- 🍽️ **智能排序** - 按推荐度、难度、营养价值对食谱进行排序
- 💡 **创意建议** - 当找不到合适食谱时，提供创意搭配建议
- 💬 **对话交互** - 聊天式界面，支持图片上传 + 文本对话

![image-20260421133725032](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421133725032.png)

![image-20260421133748571](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421133748571.png)

 

## 1.2 预期效果

基本的聊天界面窗口，支持**图片上传**+**文本对话**：

<img src="C:\Users\Xvsf\AppData\Roaming\Typora\typora-user-images\image-20260416194640090.png" alt="image-20260416194640090" style="zoom:50%;" />



上传图片，根据图片识别食材：

![image-20260416194703646](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416194703646.png)

根据食材搜索食谱，并智能排序：

![image-20260416194723606](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416194723606.png)



## 1.3 实现思路分析

定义一个基础 Agent ，核心就是模型（Model）和工具（Tool）：

- **模型**：由于要实现多模态输入，所以必须用多模态模型，比如 qwen3.5-plus
- **工具**：需要联网搜索食谱，所以要用到web搜索工具，推荐Tavily
- **记忆**：短期记忆我们暂时使用Sqlite来实现

剩下就是提示词了：

```python
system_prompt = """
你是一名私人厨师。收到用户提供的食材照片或清单后，请按以下流程操作：
1.识别和评估食材：若用户提供照片，首先辨识所有可见食材。基于食材的外观状态，评估其新鲜度与可用量，整理出一份“当前可用食材清单”。
2.智能食谱检索：优先调用 web_search 工具，以“可用食材清单”为核心关键词，查找可行菜谱。
3.多维度评估与排序：从营养价值和制作难度两个维度对检索到的候选食谱进行量化打分，并根据得分排序，制作简单且营养丰富的排名靠前。
4.结构化方案输出：把排序后的食谱整理为一份结构清晰的建议报告，要包含食谱信息、得分、推荐理由、食谱的参考图片，帮助用户快速做出决策。

请严格按照流程，优先调用 web_search 工具搜索食谱，搜索不到的情况下才能自己发挥。
"""
```





# 2. 功能模拟（jupyter）



## 2.1 配置

`.env` 文件：

```
# 阿里百炼
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_API_KEY=sk-36b7386d28524af486314f6156842c0b


# tools
## Tavily工具
TAVILY_API_KEY=tvly-dev-3BW3YY-4xxxxxxxxxxxxxxxxxxxxxxxx
```



## 2.2 依赖

```toml
[project]
name = "food-recipe-recommender"
version = "0.1.0"
description = "AI-powered recipe recommender based on uploaded food images"
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
    "langchain>=0.3.0",
    "langchain-community>=0.3.0",
    "langchain-openai>=0.2.0",
    "langchain-core>=0.3.0",
    "streamlit>=1.40.0",
    "pillow>=11.0.0",
    "python-dotenv>=1.0.0",
    "tavily-python>=0.5.0",
    "langchain-tavily>=0.1.0",
    "fastapi>=0.109.0",
    "uvicorn>=0.27.0",
    "python-multipart>=0.0.6",
    "alibabacloud-oss-v2>=1.2.4",
    "langgraph-checkpoint-sqlite>=3.0.3",
]

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "black>=24.0.0",
]
```

## 2.3 功能验证

以下内容见：`2.7_实战.ipynb`













# 3.LangSmith 联调测试

LangChain的Agent底层是基于LangGraph实现的，而LangGraph提供了完整的后端部署功能，自带非常完善的API接口，无需我们额外处理。

同时，LangChain还提供了基于LangSmith的GUI控制台实现Agent的调试、监控、一键部署。

接下来我们就看看如何利用LangGraph在本地部署测试我们的Agent，并通过LangSmith做测试。



## 3.1 配置 LangSmith

LangSmith提供了对Agent的GUI管理界面，而且还支持一键云部署功能。通常在测试阶段，建议大家在Agent中引入Simth，方便做测试和调试。

首先，我们要注册LangSmith，开通服务，生成API_KEY。

注册地址：https://smith.langchain.com/



![image-20260416210304580](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416210304580.png)



```
# langsmith
LANGSMITH_API_KEY=
LANGSMITH_TRACING=true
```



## 3.2 开发 Agent

把刚才的代码集中到一个py文件中

![image-20260416212202493](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416212202493.png)

```python
from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
import os

# 1.加载环境变量
from dotenv import load_dotenv
load_dotenv()

# 2.web搜索工具，使用tavily作为web搜索工具
web_search = TavilySearch(
    max_results=5,
    topic="general"
)

# 3.多模态模型
model = init_chat_model(
    model="qwen3.5-plus",  # 模型名称，这里选择qwen3.5-plus，这是一个多模态模型，支持图片、文本、音频、视频
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)

# 4.Agent系统提示词
system_prompt = """
你是一名私人厨师。收到用户提供的食材照片或清单后，请按以下流程操作：
1.识别和评估食材：若用户提供照片，首先辨识所有可见食材。基于食材的外观状态，评估其新鲜度与可用量，整理出一份“当前可用食材清单”。
2.智能食谱检索：优先调用 web_search 工具，以“可用食材清单”为核心关键词，查找可行菜谱。
3.多维度评估与排序：从营养价值和制作难度两个维度对检索到的候选食谱进行量化打分，并根据得分排序，制作简单且营养丰富的排名靠前。
4.结构化方案输出：把排序后的食谱整理为一份结构清晰的建议报告，要包含食谱信息、得分、推荐理由、食谱的参考图片，帮助用户快速做出决策。

请严格按照流程，优先调用 web_search 工具搜索食谱，搜索不到的情况下才能自己发挥。
"""

# 5.创建Agent
agent = create_agent(
    model=model,  # 模型
    tools=[web_search],  # 工具
    system_prompt=system_prompt  # 系统提示词
)
```



## 3.3 本地部署

先安装LangGraph的依赖

`uv add langgraph-cli[inmem]`

在项目根目录添加一个langgraph配置文件

```json
{
    "dependencies": ["."],
    "graphs": {
        "chief_agent": "./app/agents/personal_chief.py:agent"
    },
    "env": ".env"
}
```

![image-20260416212724853](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416212724853.png)



打开Pycharm终端

使用LangGraph命令本地部署Agent

`uv run langgraph dev`

![image-20260416215235892](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416215235892.png)



![image-20260416215243195](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416215243195.png)





## 3.4 LangSmith Studio 测试

由于我们部署时配置了LangSmith，所以可以直接访问LangSmith提供的调试GUI界面：

https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024

这里可以非常方便的调试我们的Agent，查看我们Agent的运行细节：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/asynccode)

可以直接在界面中测试：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/asynccode)

也可以查看详细的调用过程：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/asynccode)

同时，LangSmith还提供了一键云部署功能，可以把Agent部署到云端：

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/asynccode)

但是要需要缴付昂贵的费用。。

所以，建议只在Agent测试阶段使用LangSmith吧~





# 4. 实战开发

Agent跑通了，但目前还存在几个问题：

- 目前的图片信息还是采用base64方式提交给模型，会占用大量内存，性能差
- 我们没有开发自己的前端，用户体验不好

在向模型提交多模态消息，比如：音频、视频、图片时，我们不建议直接发送文件数据（base64）给模型，这会大量占用内存和会话记忆。更常见的方案是：

- 先将多模态文件上传至通用的OSS服务，例如：阿里云OSS、腾讯云COS等
- 获取oss服务的文件url地址，组织多模态消息，发送给大模型

因此，我们需要单独开发一个文件上传的服务接口，让前端先上传好文件，再调用Agent.

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/asynccode)

我们的服务端需要具备以下接口：

- 对话接口：接收用户聊天消息，并调用Agent
- 会话管理接口：查询或删除会话历史
- 文件上传接口：调用OSS提供的客户端，实现文件上传授权，将来由前端完成文件上传，文件不经过服务器。



## 4.1 FastAPI 服务端

首先，安装一些依赖

`uv add fastapi alibabacloud-oss-v2`



一个基于FastAPI开发的基础网关：

```Bash
  app/
  ├── main.py                    # FastAPI 入口，配置路由和静态文件
  │
  ├── agents/
  │   └── personal_chief.py      # AI 代理核心逻辑
  │ 
  ├── api/
  │   └── v1/
  │       ├── chat.py             # 对话 API
  │       │   ├── POST /chat/stream     流式对话
  │       │   ├── GET  /chat/messages   获取历史
  │       │   └── DELETE /chat/messages 清空历史
  │       │
  │       └── oss.py              # OSS 上传签名 URL
  │
  ├── models/
  │   └── schemas.py              # Pydantic 数据模型，请求/响应数据结构定义  
  │
  ├── common/
  │   └── logger.py               # 日志配置
  │
  └── static/                     # Next.js 编译产出的静态网页 
      ├── index.html              # 前端入口
      ├── _next/                  # Next.js 构建资源
      └── ...                     # 其他静态资源
```



## 4.2 OSS 配置

这里我们以阿里云OSS为例来说明

### 注册阿里云

注册地址：

https://oss.console.aliyun.com/overview

注册登录成功后，访问链接：https://oss.console.aliyun.com/overview，即可看到oss控制台：

![image-20260421144833339](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421144833339.png)



如果显示【**尚未开通**】，点击【**立即开通**】即可：

![image-20260421144900439](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421144900439.png)

默认为按量付费，价格非常便宜，几乎可以忽略不计：

![image-20260421144853710](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421144853710.png)

开通成功后，即可进入控制台页面：

![image-20260421144907570](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421144907570.png)

### 申请API_KEY

访问链接：https://ram.console.aliyun.com/overview?activeTab=workflow，进入RAM访问控制页面：

![image-20260421144918708](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421144918708.png)

点击：`用户`>`创建用户`，填写用户信息：

![image-20260421144928902](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421144928902.png)

创建完成后，一定要记住你的AccessKey的ID和Secret：

![image-20260421144942841](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421144942841.png)

然后，给新添加的用户《新增授权》：

![image-20260421144950276](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421144950276.png)

在授权页面，给新用户添加oss的绝对控制权限：

![image-20260421145007528](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421145007528.png)

### 开通OSS

访问链接：https://oss.console.aliyun.com/overview，进入oss控制台，选择**创建Bucket**：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YzU2NWYwZjgzZGI5OWQxYjcyZDFjZTNlNDg0MzIzZThfNEhEY0V1TEFWS0h3UDBha0JOd1lpUjdrOXluNk1sRXpfVG9rZW46QVhtVWJYZ0dCb2dwV1J4N3NwemNGTkoybnFlXzE3NzY3NTM5ODM6MTc3Njc1NzU4M19WNA)

填写bucket信息：

![image-20260421145036724](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421145036724.png)

### 设置权限

目前，新建的Bucket还是无法访问的，是私有的。为了方便测试，这里我们**暂时**将其设置为**公共读**。

**注意**：

- 实际开发中oss中的图片应该设置为**私有**！不可对外暴露！！由额外的CDN服务对外暴露！
- 本例中，我们为了方便暂时将bucket设置为公共读，测试完毕后**请及时关闭权限**！

首先，进入Bucket管理页面：

![image-20260421145053421](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421145053421.png)

进入具体的Bucket设置，关闭公共访问开关：

![image-20260421145101794](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421145101794.png)

设置权限为公共读：

![image-20260421145110379](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421145110379.png)

接着，我们要开启跨域访问权限：

![image-20260421145118596](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421145118596.png)

点击《**创建规则**》，填写跨域规则：

![image-20260421145136371](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421145136371.png)



### 配置API_KEY

```
# 阿里OSS
OSS_ACCESS_KEY_ID=xxxxxxxxxxx
OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
OSS_BUCKET=personal-chief-xvsf
```







## 4.3 添加 Checkpointer

完整的 personal_chief.py

```python
from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
import os
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# 1.加载环境变量
from dotenv import load_dotenv
load_dotenv()

# 2.web搜索工具，使用tavily作为web搜索工具
web_search = TavilySearch(
    max_results=5,
    topic="general"
)

# 3.多模态模型
model = init_chat_model(
    model="qwen3.5-plus",  # 模型名称，这里选择qwen3.5-plus，这是一个多模态模型，支持图片、文本、音频、视频
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)

# 4.初始化checkpointer
# 连接sqlite
connection = sqlite3.connect("../db/personal_chief.db", check_same_thread=False)
# 初始化checkpointer
checkpointer = SqliteSaver(connection)
# 自动建表
checkpointer.setup()

# 5.Agent系统提示词
system_prompt = """
你是一名私人厨师。收到用户提供的食材照片或清单后，请按以下流程操作：
1.识别和评估食材：若用户提供照片，首先辨识所有可见食材。基于食材的外观状态，评估其新鲜度与可用量，整理出一份“当前可用食材清单”。
2.智能食谱检索：优先调用 web_search 工具，以“可用食材清单”为核心关键词，查找可行菜谱。
3.多维度评估与排序：从营养价值和制作难度两个维度对检索到的候选食谱进行量化打分，并根据得分排序，制作简单且营养丰富的排名靠前。
4.结构化方案输出：把排序后的食谱整理为一份结构清晰的建议报告，要包含食谱信息、得分、推荐理由、食谱的参考图片，帮助用户快速做出决策。

请严格按照流程，优先调用 web_search 工具搜索食谱，搜索不到的情况下才能自己发挥。
"""

# 6.创建Agent
agent = create_agent(
    model=model,  # 模型
    tools=[web_search],  # 工具
    checkpointer=checkpointer,  # 记忆
    system_prompt=system_prompt  # 系统提示词
)
```

在app下创建一个db目录，用以存放Sqlite的db文件：

![image-20260421150537657](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421150537657.png)



## 4.4 开发接口

目前在`agents/personal_cheif.py`文件中虽然已经开发了Agent，但是外界还是无法访问，我们需要定义Restful的接口供前端使用。

其中，在`api/v1/chat.py`中定义了Restful的接口，等待我们实现功能：

```Python
from fastapi import APIRouter

router = APIRouter()

@router.post("/chat/stream")
async def chat_endpoint(request: ChatRequest):
    """流式聊天接口"""
    pass

@router.get("/chat/messages")
async def get_chat_messages(thread_id: str):
    """获取历史消息"""
    pass


@router.delete("/chat/messages")
async def clear_chat_messages(thread_id: str):
    """清空历史消息"""
    pass
```



### 4.4.1 功能实现

我们可以在`agents/personal_cheif.py`中基于agent开发所需的3个功能：

- 多模态聊天
- 获取会话历史
- 清空会话历史

`agents/personal_cheif.py`的完整代码如下：

```Python
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, AIMessageChunk, AIMessage
from langchain_core.tools import tool
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
from app.common.logger import logger
import os
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# 加载环境变量
from dotenv import load_dotenv

load_dotenv()

# web搜索工具，使用tavily作为web搜索工具
tavily = TavilySearch(
    max_results=5,
    topic="general"
)


# 多模态模型
model = init_chat_model(
    model="qwen3-omni-flash",  # 模型名称，这里选择qwen3.5-plus，这是一个多模态模型，支持图片、文本、音频、视频
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)


# 初始化checkpointer
checkpointer = SqliteSaver(sqlite3.connect("db/personal_chief.db", check_same_thread=False))
# 自动建表
checkpointer.setup()

# Agent系统提示词
system_prompt = """
你是一名私人厨师。收到用户提供的食材照片或清单后，请按以下流程操作：
1.识别和评估食材：若用户提供照片，首先辨识所有可见食材。基于食材的外观状态，评估其新鲜度与可用量，整理出一份“当前可用食材清单”。
2.智能食谱检索：优先调用 web_search 工具，以“可用食材清单”为核心关键词，查找可行菜谱。
3.多维度评估与排序：从营养价值和制作难度两个维度对检索到的候选食谱进行量化打分，并根据得分排序，制作简单且营养丰富的排名靠前。
4.结构化方案输出：把排序后的食谱整理为一份结构清晰的建议报告，要包含食谱信息、得分、推荐理由、食谱的参考图片，帮助用户快速做出决策。

请严格按照流程，优先调用 web_search 工具搜索食谱，搜索不到的情况下才能自己发挥。
"""

# 创建代理
agent = create_agent(
    model=model,  # 模型
    tools=[tavily],  # 工具
    checkpointer=checkpointer,  # 记忆
    system_prompt=system_prompt  # 系统提示词
)

# 流式对话
async def search_recipes(prompt: str, image: str, thread_id: str):
    """调用agent搜索食谱"""
    logger.info(f"[用户]: {prompt}, image: {image}, thread_id: {thread_id}")
    try:
        # 判断是否有图片，封装不同格式的消息
        if not image or image.strip() == "":
            message = HumanMessage(content=prompt)
        else:
            message = HumanMessage(content=[
                {"type": "image", "url": image},
                {"type": "text", "text": prompt}
            ])

        # 流式调用Agent
        for chunk, metadata in agent.stream(
            {"messages": [message]},
            {"configurable": {"thread_id": thread_id}},
            stream_mode="messages"
        ):
            if isinstance(chunk, AIMessageChunk) and chunk.content:
                yield chunk.content

    except Exception as e:
        logger.error(f"\n[错误]: {str(e)}")
        yield "信息检索失败，试试看手动输入食物列表？"

# 清空会话
def clear_messages(thread_id: str):
    """清空会话"""
    logger.info(f"清空历史消息，thread_id: {thread_id}")
    checkpointer.delete_thread(thread_id)

# 查询会话历史
def get_messages(thread_id: str) -> list[dict[str, str]]:
    """获取会话历史"""
    logger.info(f"获取历史消息，thread_id: {thread_id}")

    # 根据 thread_id 查询 checkpoint
    checkpoint = checkpointer.get({"configurable": {"thread_id": thread_id}})

    # 如果不存在，返回空列表
    if not checkpoint:
        return []

    # 安全获取 messages
    channel_values = checkpoint.get("channel_values")
    if not channel_values:
        return []

    messages = channel_values.get("messages", [])
    if not messages:
        return []

    # 转换消息格式
    result = []
    for msg in messages:
        if not msg.content:
            continue

        if isinstance(msg, HumanMessage):
            result.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            result.append({"role": "assistant", "content": msg.content})

    return result
```



### 4.4.2 完善接口

修改chat.py文件，导入`agents.personal_cheif`中的三个方法，完善接口：

```Python
from fastapi import APIRouter
from app.models.schemas import ChatRequest
from fastapi.responses import StreamingResponse
from app.agents.personal_chief import search_recipes, get_messages, clear_messages


router = APIRouter()


@router.post("/chat/stream")
async def chat_endpoint(request: ChatRequest):
    """流式对话"""
    return StreamingResponse(
        search_recipes(request.message, request.image_url, request.thread_id),
        media_type="text/event-stream"
    )


@router.get("/chat/messages")
async def get_chat_messages(thread_id: str):
    """获取历史消息"""
    messages = get_messages(thread_id)
    return {"messages": messages}


@router.delete("/chat/messages")
async def clear_chat_messages(thread_id: str):
    """清空历史消息"""
    clear_messages(thread_id)
    return {"success": True}
```



## 4.5 测试

![image-20260421150931779](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421150931779.png)



![image-20260421151021095](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421151021095.png)



![image-20260421151109887](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260421151109887.png)














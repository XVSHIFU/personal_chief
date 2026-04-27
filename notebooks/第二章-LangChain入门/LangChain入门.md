# 认识 LangChain

![image-20260414204157541](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414204157541.png)

https://www.langchain.com/

![image-20260414204251928](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414204251928.png)

# 什么是Agent

在人工智能领域，**Agent**（通常翻译为**智能体**或**代理**）是指一种能够**感知环境、进行推理、自主决策并采取行动**以实现特定目标的**智能系统**。

![image-20260414204702184](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414204702184.png)

![image-20260414204808306](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414204808306.png)



![image-20260414205143437](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414205143437.png)







# 快速入门 - 案例 - 天气查询智能体

![image-20260414205215661](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414205215661.png)





## Agent原理

### Agent 执行流程：

![image-20260414213626053](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414213626053.png)

流程如下：
1. 用户提问（Input）：杭州今天天气如何？
2. 模型分析（Reasoning）：用户询问杭州天气，我不知道，需要调用查询天气的工具`get_weather`
3. 调用工具（Action）：调用工具，`get_weather`，传入城市"杭州"
4. 分析结果（Observation）：工具返回结果，模型分析结果，判断是否足以回答用户问
   1. 是：整理生成响应结果
   2. 否：重复前面步骤
5. 生成结果（Output）：根据工具的结果生成响应给用户

### 模型是如何知道工具的信息的呢？
其实，在大模型提供的API接口中，有一个tools参数，描述了工具的详细信息：

![image-20260414214058262](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414214058262.png)

LangChain会帮助我们把tool的信息封装为此tool参数，与message一起发送给大模型，大模型就了解tool的详细信息，根据用户需求判断是否需要调用tool，需要调用哪个tool.

那么问题来了，当大模型决定调用某个tool时，该如何调用呢？毕竟，tool是我们定义的，模型是没有调用能力的。
模型确实不能直接调用tool，只能返回字符串。但是它可以把要调用的tool信息、参数信息都以Json格式返回：

![image-20260414214208784](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414214208784.png)

这样一来，LangChain就会帮我们解析响应结果中的Function信息，也就是tool信息，就知道了要调用哪个函数，以及参数是什么了。LangChain就会执行该函数，再把得到的结果再次发送给大模型。

![image-20260414214233705](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260414214233705.png)





# 模型（Models)

LangChain支持现在市面上大部分常见的大语言模型（LLM），并且提供了各个模型的对应依赖库。


![image-20260415134102386](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260415134102386.png)



Langchain1.0之后，改用`init_chat_model`自动识别并引入、创建对应的对象

![image-20260415134139305](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260415134139305.png)



## 开发步骤

### 引入依赖

`uv add langchain`

`uv add langchain-deepseek`

### 配置环境

`DEEPSEEK_API_KEY=sk-xxx`

### 初始化模型

```python
from langchain.chat_models import init_chat_model
model = init_chat_model(model="deepseek-chat")
```





## 其他内容见：2.2_models.ipynb





# 消息（Message）

## 消息类型

在LangChain中，发送给模型的消息、模型返回的消息都统一被封装为BaseMessage，并且准备了多个BaseMessage的子类对应不同角色类型的消息。



![image-20260415165623868](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260415165623868.png)









![image-20260415172208684](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260415172208684.png)







# 提示词（Prompts）











# Tools



![image-20260415203111615](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260415203111615.png)





![image-20260416141226554](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416141226554.png)







![image-20260416141727246](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416141727246.png)





![image-20260416142127299](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416142127299.png)





# 记忆（memory）



对于Agent而言，记忆至关重要，因为它能让代理记住之前的交互情况，从反馈中学习，并适应用户的偏好。随着代理处理的任务愈发复杂，涉及的用户交互也越来越多，这种能力对于提高效率和用户满意度而言变得不可或缺。



## 记忆分类

对于智能体而言，记忆分为了两类：

- 短期记忆（short-term memory）当前任务或会话的上下文（Working Memory 或 Session Memory）
- 长期记忆（long-term memory)   跨任务或会话的**经验与知识**（Persistent Memory）



![image-20260416151506837](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416151506837.png)



总结：

|            | **短期记忆**     | **长期记忆**           |
| :--------- | :--------------- | :--------------------- |
| 生命周期   | 当前会话（短暂） | 跨任务、跨会话（永久） |
| 内容       | 当前任务状态     | 知识、经验、用户偏好   |
| 是否跨任务 | ❌                | ✅                      |
| 存储       | Redis/内存       | DB/Vector DB           |



## 短期记忆

由于**短期记忆**通常生命周期是当前会话，所以我们也可以称为**会话记忆**。Agent的会话记忆通常包含三部分：

•对话历史

•查询结果

•任务状态





LangChain提供了自动化的记忆管理方案：

- 首先，LangChain把会话记忆（也就是Messages列表）记录为[**AgentState**](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState)的一部分

> `AgentState` 定义了智能体在运行过程中需要跟踪、存储和传递的所有数据结构
>
> **AgentState** 就像是智能体随身携带的一个**记事本**。每经过一个处理节点，智能体都会在笔记本上查看当前进度，并写下新的发现。没有这个“笔记本”，智能体就会变成“鱼的记忆”，无法处理复杂的长任务。
>
> ![image-20260416151954859](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416151954859.png)

- AgentState通过**Checkpointer**对象来保存，每一次与AI的交互都会生成一个快照，记录为一个checkpoint，把同一会话的所有checkpoint组合在一起，就是完整的会话历史了。

> **Checkpointer** 检查点管理器，相当于一个节点，将内容实时保存，防止丢失，也可以随时回退查看之前的记忆

- 为了区分不同的会话记忆，不同会话需要设定各自的`thread_id`，相同会话则使用相同`thread_id`

> Thread 线程，在智能体开发中，**Thread 是一个唯一标识符（`thread_id`）**，用于将一系列的状态快照（Checkpoints）归类到同一个时间轴上。
>
> 可以把 Thread 想象成一条**时间线**，而 Checkpoint 是这条线上的**刻度**

- 向Agent发起会话时必须指定自己的`thread_id`以唤起对应的会话记忆

![image-20260416152250125](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416152250125.png)

以 LangChain提供的基于内存的 Checkpointer 为例来演示会话记忆



### InMemorySaver

见 2.6_memory.ipynb



### 持久化 Memory

见 2.6_memory.ipynb





## 记忆管理策略

当历史会话超过上下文，就会出现上下文丢失、“注意力分散”的问题，模型的响应速度、回答质量会大大降低

https://docs.langchain.com/oss/python/langchain/short-term-memory#common-patterns

Common patterns 主要用于解决长对话超过 LLM 上下文窗口限制的问题

![ ](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416160126556.png)

### 修剪消息（Time messages）

修剪消息，在 AgentState 中的消息列表依然是完整的，只不过发送给 LLM 之前会进行修剪，删除最早的或多余的 N 条消息，只保留一部分消息

![image-20260416160819077](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/image-20260416160819077.png)



### 删除消息

使用 `RemoveMessage` 指令。这对于清理整个历史记录或删除不再需要的特定中间步骤（如过时的工具调用）非常有用。



### 总结消息

为了避免直接修剪导致的“记忆丢失”，总结模式提供了一种更智能的权衡。

使用另一个（通常是更小、更廉价的）模型对早期的对话进行摘要，然后用这个**摘要**替换掉那些原始的长篇消息。



LangChain 提供了 `SummarizationMiddleware`，可以配置触发条件（如超过 4000 Tokens 时触发）以及保留的消息数量。



用法测试：

见2.6_memory.ipynb




















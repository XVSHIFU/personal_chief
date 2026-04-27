

# 认识人工智能

**AI（Artificial Intelligence），使机器能够像人类一样思考、学习和解决问题的技术。**

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740498.png)





# 大模型原理

## AI 智能的来源

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739609.png)





## 神经网络与语言模型

![image-20260331131701111](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/202603311317169.png)

### 神经网络结构

AI 的核心是 **Transformer**，这是一种神经网络架构，本质就是在模拟人类大脑神经元。

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738328.png)

将千千万万个神经元连接起来，这就组成了**深度神经网络**

![img](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739595.png)

**深度神经网络**分成很多**层（Layer）**，是神经网路基本的计算单元，分为：

- 输入层（Input Layer）：入口，接收数据
- 隐藏层（Hidden Layer）：信息处理和学习。可以有很多层
- 输出层（Output Layer）：出口，产生结果



#### 单个神经元的工作流：

 ![image-20260413210709398](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221741608.png)



$y=g(\sum_{i=1}^{n} w_i x_i - b)$



$w_i$: 权重就是用来控制输入参数对模型结果的影响情况

$\sum_{i=1}^{n} w_i x_i$: 对输入的参数进行加权并求和，加权求和的结果决定了输入的值与目标的接近程度

$\sum_{i=1}^{n} w_i x_i - b$: b  被称为偏置量，有时候加权求和后得到的结果没有达到预期的值，所以要想达到阈值，就要减去偏置量

$g(\sum_{i=1}^{n} w_i x_i - b)$: $g()$就是一个处理函数，此函数用来约束输出的结果



### 模型训练

![image-20260413212502555](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740763.png)

1986年，DavidRumelhart（戴维·莱姆哈特）找到了一个教这个复杂神经网络学习的高效方法，叫做**反向传播（Backpropagation）**。

#### 反向传播基本流程：

- 前向传播：数据逐层加工，直到输出层产出结果
- 计算误差：计算产出结果与正确结果的误差（Loss)
- 反向追责：倒推计算每一层的每个连接对误差的贡献
- 调整权重：根据每个连接的误差贡献比例，调整其权重参数，使误差变小



###  大语言模型

![image-20260413213938093](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738631.png)

#### 词向量

**词向量（Word Embedding）**就是把词转为多维空间向量的一种技术。

- 首先，将人类自然语言文字拆分为一个个片段，称为Token（词）
- 每个Token都经过模型计算转为一个浮点数数组，作为向量坐标
- 目标：使词向量在多维空间中的不同方向表达不同的语义

![image-20260413214051925](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740755.png)



通过浮点数数组，作为向量坐标，在对应的坐标系画出向量

![image-20260413214327752](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739194.png)

以上只是二维向量、三维向量，而在真实的Token，可能就有成千上万个浮点数数组，那么将 词 转成这个多维空间的一个向量，最终我们要通过训练模型，不断调整这些词在向量空间中的一个坐标位置，也就是要达成**使词向量在多维空间中的不同方向表达不同的语义**的目标。

![image-20260413214655458](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739150.png)

词向量例子：

![image-20260413215758950](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738217.png)

![image-20260413215813094](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739501.png)



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221741687.png)

图片中，`E()` 都是已经训练好的向量，与紫色向量相同方向的这些向量之间会存在某些相似的关系，同时，与之垂直方向的向量也存在相似的关系。也就是说，经过训练，在这个二维空间中的某些向量有了具体的含义，同时呢，也就可以通过已知的某些向量，进行推理得出一些向量。



#### Transformer-注意力机制

![image-20260413215712018](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740830.png)

2017年Google发表的论文《AttentionisAllYouNeed》中提出了**Transformer** 模型，其中提出的自注意力机
制（self-attention）使模型能更高效的根据上下文信息处理token，理解token含义.



![image-20260413220922563](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738643.png)

首先知道这是一位*艺人*，当上下文有了更多的信息，*艺人*这个向量就开始一步步进行偏移，最终会偏向某个具体的人物。



词向量在 Transformer 中只是第一步，在这之后还有很多步骤：

![image-20260413221511021](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739962.png)

Attention: 基于上下文对词向量中的内容进行调整

MLP: 基于前面的分析，再进一步做深度的推理分析，进一步调整向量值。

在不断的调整中，将这个词向量最终计算出某个具体向量，最后呢，要将这个向量进行反向量化输出为 token 给用户。这个过程就是 softmax 函数来完成的。

> **SoftMax** 会根据模型计算出的向量结果得出下一个 token 的概率分布，然后基于概率的随机采样方式挑选一个作为结果。
> 这个概率受模型的 **Temperature** 参数影响，值越大，概率分布越均匀，模型生成结果的随机性越强；反之，结果越确定。



#### 示例：

![image-20260413222326091](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221741804.png)

当然他不可能只生成一个 token 就结束，而是将这个 token (推)，继续进行 Transformer 推理：

![image-20260413222613538](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221737454.png)

![image-20260413222626155](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739620.png)



#### 涌现（Emergent Abilities）

Transformer 本来是作为翻译用的，但当**模型规模**和**训l练数据量**增突破某个临界点时，模型像是突然拥有了智能，不仅可以理解人类语言，还能推理、分析。这种现象被称为**“涌现”（Emergent Abilities）**。这种超大规模的语言模型则被称为**大语言模型（Large Language Model).**

![image-20260413222952311](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738745.png)







# 大模型应用

GPT是OpenAI公司研发的一个基于Transformer架构的大语言模型。

![image-20260414133135527](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738885.png)

### 大语言模型

**大语言模型（Large Language Model, LLM）**是指模型的参数规模、训练数据量、训练成本、智能程度都远超普通模型的一种神经网络模型。



**对话机器人（ChatBot）**是指可以与用户聊天、答疑，而且具有记忆的大模型应用。例如：ChatGpt、通义干问。

![image-20260414133543101](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738632.png)





![image-20260414133649120](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738295.png)

###  大模型应用

**大模型应用**是基于**大模型**的推理、分析、生成能力，**结合传统编程**精确计算控制能力，开发出的各种应用。

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738511.png)

![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738712.png)



### 大模型应用结构

![image-20260414134339672](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738299.png)





### 小结

![image-20260414134626257](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738210.png)





# 大模型服务



## 大模型云服务



国内知名的云服务平台都提供了国内知名的大模型的API开放服务，只要花钱，无需部署就能访问。

|      云平台       |   公司   |                      地址                      |
| :---------------: | :------: | :--------------------------------------------: |
|     阿里百炼      | 阿里巴巴 |       https://bailian.console.aliyun.com       |
|    腾讯TI平台     |   腾讯   |      https://cloud.tencent.com/product/ti      |
|     干帆平台      |   百度   | https://console.bce.baidu.com/qianfan/overview |
|   SiliconCloud    | 硅基流动 |   https://siliconflow.cn/zh-cn/siliconcloud    |
| 火山方舟-火山引擎 | 字节跳动 |     https://www.volcengine.com/product/ark     |

国内还有很多模型厂商，提供了自家模型的API服务：

| 公司     | 模型     | 地址                           |
| -------- | -------- | ------------------------------ |
| 深度求索 | deepseek | https://platform.deepseek.com/ |
| 月之暗面 | kimi     | https://www.moonshot.cn/       |
| 智谱     | glm      | https://open.bigmodel.cn/      |



## 私有部署

本地部署最简单的一种方案就是使用**ollama**，官网地址：https://ollama.com



![image-20260414135335119](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739347.png)







# 模型部署


## Deepseek

### API key:

test: `sk-3xxxxxxxxx3`



### 接口文档：

https://api-docs.deepseek.com/zh-cn/



调用方式：

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'
```



```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-31bbc60d5513437c9f99c2dfbbc1f883" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'
```

![image-20260414140606746](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221738112.png)





## 阿里百炼

### API Key:

test: `sk-36b7386d28524af486314f6156842c0b`

### 接口文档：

https://bailian.console.aliyun.com/cn-beijing?tab=api#/api



```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "你是谁？"
        }
    ]
}'
```



```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer sk-36b7386d28524af486314f6156842c0b" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen-plus",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "你是谁？"
        }
    ]
}'
```

![image-20260414141507527](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739573.png)





## ollama

### 下载安装

在OllamaSetup.exe所在目录打开cmd命令行，然后命令如下： 

```bash
OllamaSetup.exe /DIR=你要安装的目录位置
```

配置一个环境变量，更改Ollama下载和部署模型的位置。环境变量如下：

```bash
OLLAMA_MODELS=你想要保存模型的目录
```

![image-20260414141944978](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739906.png)



### 搜索模型

https://ollama.com/search



![image-20260414142031998](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739161.png)

这些就是模型的参数大小，越大推理能力就越强，需要的算力也越高。671b版本就是最强的满血版deepseek-r1了。需要注意的是，Ollama提供的DeepSeek是量化压缩版本，对比官网的蒸馏版会更小，对显卡要求更低。对比如下：

![image-20260414142049446](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221741447.png)



- ollama也提供了供程序访问的HTTP接口，默认地址是http://127.0.0.1:11434/api/chat



```Bash
  ollama serve      # Start ollama
  ollama create     # Create a model from a Modelfile
  ollama show       # Show information for a model
  ollama run        # Run a model
  ollama stop       # Stop a running model
  ollama pull       # Pull a model from a registry
  ollama push       # Push a model to a registry
  ollama list       # List models
  ollama ps         # List running models
  ollama cp         # Copy a model
  ollama rm         # Remove a model
  ollama help       # Help about any command
```



### 测试 API

Ollama在本地部署时，会自动提供模型对应的Http接口，访问地址是：http://localhost:11434/api/chat

```bash
curl http://localhost:11434/api/chat \
  -d '{
    "model": "glm-5.1:cloud",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```



```bash
 curl http://localhost:11434/api/chat -d '{
    "model": "deepseek-r1:8b",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'
```

![image-20260414144338287](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740108.png)

![image-20260414142635968](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740246.png)





# 大模型API



## 接口规范



![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740299.png)



## 会话记忆

大模型提供的服务是无状态的，每一轮请求响应是一次会话，不同会话之间相互独立，并不具备会话记忆能力。



```bash
POST /chat/completions HTTP/1.1
Content-Type: application/json
Authorization: Bearer sk-
User-Agent: Mozilla/5.0 (SymbianOS/9.1; U; de) AppleWebKit/413 (KHTML, like Gecko) Safari/413
Accept: */*
Host: api.deepseek.com
Content-Length: 822

{
  "model": "deepseek-chat",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!你是谁？我是heima" },
    { "role": "assistant", "content": "你好，heima！我是DeepSeek，由深度求索公司创造的AI助手。很高兴认识你！😊\n\n我是一个纯文本模型，可以帮你解答各种问题、协助处理文档、进行对话交流等等。虽然我不支持多模态识别，但我可以处理你上传的文件（图像、txt、pdf、ppt、word、excel等），从中读取文字信息来帮助你。\n\n有什么我可以帮你的吗？无论是学习、工作还是日常问题，我都很乐意为你提供帮助！"},
    { "role": "user", "content": "你记得我是谁吗" }
  ],
  "stream": false
}

```



![image-20260414151313655](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739249.png)



## 环境准备

![image-20260414151440622](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740236.png)

https://docs.astral.sh/uv/

https://uv.doczh.com/



### 安装UV

https://uv.doczh.com/



### 添加镜像源

```Bash
setx UV_DEFAULT_INDEX "https://pypi.tuna.tsinghua.edu.cn/simple"
```

常见的国内镜像站点有：

**阿里云**

```Plain
https://mirrors.aliyun.com/pypi/simple/
```

**腾讯云**

```Plain
https://mirrors.cloud.tencent.com/pypi/simple/
```

**火山引擎**

```Plain
https://mirrors.volces.com/pypi/simple/
```

**华为云**

```Plain
https://mirrors.huaweicloud.com/repository/pypi/simple/
```

**清华大学**

```Plain
https://pypi.tuna.tsinghua.edu.cn/simple/
```

**中国科学技术大学**

```Plain
https://pypi.mirrors.ustc.edu.cn/simple/
```

### 创建项目

![image-20260414152216014](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221741742.png)



引入notebook依赖

```Bash
uv add notebook
```



![image-20260414152409322](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221739831.png)





### 测试



![image-20260414152903442](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740533.png)





## 编程调用大模型-OpenAI



![image-20260414153208732](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202604221740530.png)



### 准备工作

安装依赖 `uv add openai`



其他见：**notebooks/第一章-AI通识与基础/1.1_OpenAI.ipynb**














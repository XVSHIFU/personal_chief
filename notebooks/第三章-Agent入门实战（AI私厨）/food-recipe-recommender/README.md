# food-recipe-recommender

AI 私厨食谱推荐项目：上传食材图片或输入食材描述，后端调用大模型与检索能力生成个性化食谱推荐。

## 项目结构

- `app/`：FastAPI 后端、Agent、OSS 接口、静态文件服务
- `frontend/`：Vite + React 前端
- `db/`：LangGraph / SQLite 会话数据库挂载目录
- `README.md`：部署与运行说明

## 运行依赖

- Docker
- 访问阿里云 OSS / DashScope 所需的密钥
- Linux 服务器（推荐）或本地开发机

## 环境变量

运行时通过 `.env` 注入，**不要打进镜像**。

**关于env内容，在视频课中已经明确说明，如需立即使用请在笔记中寻找来源或者询问AI。**

```env
# 阿里百炼
DASHSCOPE_BASE_URL=
DASHSCOPE_API_KEY=


# tools
## Tavily工具
TAVILY_API_KEY=

# LangSmith
LANGSMITH_API_KEY=
LANGSMITH_TRACING=true

# project name
LANGSMITH_PROJECT=

# 阿里OSS
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=3cZXcWqoP5C1jmDrDiuDT5MX
OSS_BUCKET=

```

### 说明

- `DASHSCOPE_BASE_URL` / `DASHSCOPE_API_KEY`：大模型调用配置
- `OSS_ENDPOINT` / `OSS_BUCKET`：阿里云 OSS 上传配置
- `ALIBABA_CLOUD_ACCESS_KEY_ID` / `ALIBABA_CLOUD_ACCESS_KEY_SECRET`：OSS 签名所需凭证

## Docker 本地构建

在项目根目录执行：

```bash
docker build --network=host -t food-recipe-recommender:1.0.0 .
```

## Docker 本地运行

请先准备好 `.env` 文件，然后运行：

```bash
docker run -d \
  --name food-recipe-recommender \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file .env \
  -v /opt/food-recipe/db:/app/db \
  food-recipe-recommender:1.0.0
```

访问地址：`http://127.0.0.1:8001`

## 推送到阿里云 Registry

此处属于我个人的阿里云仓库，相关参数详情见官方文档：[容器镜像服务
](https://help.aliyun.com/zh/acr/getting-started/build-images-on-container-registry-enterprise-edition-instances?spm=a2c4g.11174283.help-menu-60716.d_1_0.5efa671bPg4c5u&scm=20140722.H_300068._.OR_help-T_cn~zh-V_1)
```bash
docker login --username=xvsf539 crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com
docker tag food-recipe-recommender:1.0.0 crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0
docker push crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0
```

## 云服务器部署

服务器上准备好：

- `/opt/food-recipe/.env`
- `/opt/food-recipe/db/`（用于持久化 SQLite 数据）

拉取并启动：

```bash
docker pull crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0

docker run -d \
  --name food-recipe-recommender \
  --restart unless-stopped \
  -p 8001:8001 \
  --env-file /opt/food-recipe/.env \
  -v /opt/food-recipe/db:/app/db \
  crpi-z2yvaep8ppb79obm.cn-hangzhou.personal.cr.aliyuncs.com/docker_fast_test/docker-a:1.0.0
```

## 常见问题

- `.env` 不要 `COPY` 到镜像里，运行时通过 `--env-file` 传入
- `db/` 建议挂载到宿主机，避免容器删除后丢失会话数据
- 如果拉取或构建依赖慢，`Dockerfile` 已配置国内 PyPI 镜像源

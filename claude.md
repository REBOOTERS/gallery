# Google AI Edge Gallery 项目梳理（Claude）

## 1. 项目整体定位

Google AI Edge Gallery 是一个以**端侧（On-device）生成式 AI**为核心的应用项目，强调离线推理、低延迟和隐私保护。仓库当前公开实现以 **Android** 为主，同时提供：

- Agent Skills 生态（技能包规范与示例）
- MCP（Model Context Protocol）接入说明
- 模型白名单与工程开发文档

---

## 2. 仓库模块总览

```text
gallery/
├── Android/                  # Android 工程入口与应用代码
│   └── src/
│       └── app/              # 单一 app module（Jetpack Compose + Hilt）
├── skills/                   # Skills 规范、内置与社区精选示例
├── mcp/                      # MCP 接入文档与示意截图
├── model_allowlist*.json     # 模型白名单配置
├── README.md                 # 项目介绍与能力概览
├── DEVELOPMENT.md            # 本地开发与配置说明
└── Function_Calling_Guide.md # 自定义 function calling 扩展指南
```

---

## 3. Android 核心架构（`Android/src/app`）

### 3.1 启动与应用层

- `MainActivity.kt`：应用入口、Splash 过渡、Deep Link 处理、埋点触发。
- `GalleryApplication.kt`：全局初始化（Hilt、DataStore 主题恢复、通知调度、Firebase 初始化）。
- `GalleryApp.kt`：顶层 Compose 容器，挂载导航主机。

### 3.2 导航与页面流

- `ui/navigation/GalleryNavGraph.kt`：
  - 主页（Home）
  - 任务模型列表（Model List）
  - 模型任务页（Model Page）
  - 全局模型管理（Global Model Manager）
  - 通知页（Notifications）
  - Benchmark 页
  - 统一处理 Deep Link（按 task/model 直达页面）

### 3.3 数据与状态层（`data/`）

- `Task` / `Category`：定义首页能力卡片与分类体系。
- `DataStoreRepository`：持久化设置、历史输入、技能列表、Benchmark 结果、ToS 状态、主题等。
- `DownloadRepository`：模型下载调度（WorkManager）、进度上报、下载通知、下载埋点。
- `Model` / `Config` / `Allowlist`：模型元数据、参数与能力映射。

### 3.4 推理运行时（`runtime/`）

- `LlmModelHelper.kt`、`ModelHelperExt.kt`：模型实例化/推理辅助。
- `runtime/aicore/AICoreModelHelper.kt`：AI Core 相关的模型辅助实现。

### 3.5 任务扩展层（`customtasks/`）

- `customtasks/common/CustomTask.kt`：自定义任务统一接口（任务元数据、模型初始化/清理、主界面）。
- 内置任务示例：
  - `agentchat/`：Agent Chat、技能管理、MCP 服务管理、tool 权限与 secret 输入。
  - `mobileactions/`：移动端动作调用（function calling 到本地动作执行）。
  - `tinygarden/`：Tiny Garden 任务与会话逻辑。
  - `examplecustomtask/`：自定义任务模板示例。

### 3.6 UI 组件层（`ui/`）

- `home/`：首页能力入口、设置、活动页（如 Gemma 4 promo）。
- `modelmanager/`：模型列表、导入、下载状态、全局管理。
- `llmchat/`、`llmsingleturn/`：多轮聊天与单轮 Prompt Lab。
- `benchmark/`：基准测试配置、执行与结果展示。
- `common/`：可复用 UI 组件（聊天气泡、Markdown 渲染、语音输入、模型卡片等）。
- `theme/`：主题与样式体系。

### 3.7 系统能力与后台

- `worker/DownloadWorker.kt`：前台服务化下载、断点续传、ZIP 解压。
- `notifications/`：通知接收、调度、点击跳转管理。
- `proto/`：DataStore 使用的 protobuf schema（settings、skills、mcp、benchmark 等）。
- `di/AppModule.kt`：依赖注入装配（Hilt）。

---

## 4. Skills 与 MCP 模块

### 4.1 Skills（`skills/`）

- `skills/README.md` 定义技能规范：
  - 文本技能（仅 `SKILL.md`）
  - JS 技能（`scripts/index.html`，通过隐藏 WebView 执行）
  - Native intent 技能（映射到 App 内置能力）
- `skills/built-in/`：内置样例（如 query-wikipedia、interactive-map、send-email）。
- `skills/featured/`：社区精选样例（如 mood-music、virtual-piano）。

### 4.2 MCP（`mcp/README.md`）

- 说明如何把外部 MCP Server 接入 Agent Chat。
- 覆盖本地 server（通过 supergateway/隧道暴露）与云端 server（Header 鉴权）两种路径。
- 当前标注为实验能力，并给出模型与上下文窗口限制说明。

---

## 5. 开发与扩展入口

- 本地构建说明：`DEVELOPMENT.md`
  - 关键依赖：HuggingFace OAuth 配置（`ProjectConfig.kt` + manifest scheme）
- 自定义 function calling：`Function_Calling_Guide.md`
  - 在 `mobileactions` 中新增 ActionType、Tool 定义和执行逻辑
- 自定义任务：实现 `CustomTask` 并通过 Hilt `IntoSet` 注册

---

## 6. 一句话总结

这是一个以 **Android 端侧 LLM 体验**为核心、同时围绕**模型管理、任务化能力、技能生态（Skills）和外部工具协议（MCP）**构建的完整应用工程。

# VeriFact — Knowledge Tracker 🛡️🔎

**揭示 AI 回答背后的真实知识**

VeriFact 是一个面向研究与工程的轻量级前端工具，利用 Google Gemini Grounding 能力追踪 LLM（大型语言模型）回答中的来源证据，自动抽取外部引用（URL / 标题）、可视化知识构成，并提示潜在的“知识盲点 / 幻觉”。

VeriFact — Knowledge Tracker is a lightweight React demo that uses Google Gemini grounding features to extract and visualize external evidence supporting LLM answers. It helps researchers and engineers spot unsupported claims (hallucinations) and verify facts quickly.

<div align="center">
  <img src="https://github.com/mire403/VeriFact-Knowledge-Tracker/blob/main/verifact---knowledge-tracker/picture/%E9%A1%B5%E9%9D%A2.png">
</div>

## 🚀 项目亮点（Why VeriFact）

**🧠 Grounding-aware**：调用 Gemini 的 grounding/search 工具，提取对回答有支持的网页片段（grounding chunks）。

**🔗 来源抽取**：自动去重并列出引用来源（URL、标题、站点），方便二次核验。

**📊 可视化仪表盘**：可信度评分、来源数量、知识构成饼图等一目了然。

**⚠️ 盲点提示**：当没有外部证据时给出“潜在幻觉警告”，降低盲目信任风险。

**🧾 查询历史**：保留最近多条查询记录，方便复查与比较。

<div align="center">
  <img src="https://github.com/mire403/VeriFact-Knowledge-Tracker/blob/main/verifact---knowledge-tracker/picture/%E5%AE%9E%E9%99%85%E4%BD%BF%E7%94%A8.png">
</div>

## 🧩 适用场景

学术/工程场景下验证 LLM 输出的事实依据

开发基于 LLM 的问答或知识库系统时做可信度管控

做 LLM 结果审计、可解释性分析、或教学演示


## 🗂️ 项目结构（简要）

```csharp
.
├─ public/              # 静态资源 (icons / screenshots)
├─ src/
│  ├─ App.tsx           # 主界面组件
│  ├─ index.tsx         # React 入口
│  ├─ types.ts          # TS 类型定义（AnalysisResult, GroundingMetadata...）
│  ├─ services/
│  │  └─ geminiService.ts  # 与 Gemini 的调用封装 (analyzeQuery)
│  └─ components/
│     ├─ AnalysisChart.tsx   # 可视化饼图（Recharts）
│     └─ SourceCard.tsx      # 单个来源卡片
├─ metadata.json        # (manifest / app metadata)
└─ README.md
```


## 🛠️ 快速启动（两种方式）
### 方式 A — 本地开发（推荐：Vite / React + TypeScript）

**1.初始化（如果还没初始化 repo）**：

```bash
npm init vite@latest verifact -- --template react-ts
cd verifact
npm install
```

**2.安装依赖（示例）**：

```bash
npm install @google/genai recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**3.把你的 src/ 文件复制到项目中（覆盖模板）并在 index.css 引入 Tailwind base/utilities。**

**4.在 .env 或系统环境中设置 API Key**：

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

然后在代码中读取（示例）：

```ts
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**5.启动**：

```bash
npm run dev
```

**6.打包**：

```bash
npm run build
```

### 方式 B — 直接用 index.html 的 ImportMap（快速 demo）

如果你只是想在浏览器中直接试验（无构建工具），可以使用你之前的 index.html + ImportMap 版本（注意 CORS/host 环境与依赖兼容）：

将 index.html 放到静态服务器下（比如 http-server）：

```bash
npm install -g http-server
http-server -c-1 .
```

打开浏览器访问 http://localhost:8080（端口可能不同）。

⚠️ 注意：直接在浏览器通过 ImportMap 加载 Gemini SDK 可能受限（API key 泄露风险 & CORS）。生产环境强烈建议通过后端代理或安全环境调用 API。

## 🔐 环境配置

API_KEY（或 VITE_GEMINI_API_KEY）：你的 Google / Gemini API Key，用于 services/geminiService.ts 中的 GoogleGenAI 客户端初始化。

推荐把密钥放在后端（或 serverless）中转，前端仅请求你的后端接口，避免泄漏。

示例（Node / Vite）：

```env
# .env
VITE_GEMINI_API_KEY=sk-xxxxxx
```

在 src/services/geminiService.ts 中：

```ts
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
// 或：process.env.API_KEY (在 Node 环境)
```

## 📡 Gemini 集成细节（实现说明）

使用 @google/genai 客户端，调用 ai.models.generateContent('gemini-2.5-flash', {...})（示例）。

在 generateContent 请求中启用 tools: [{ googleSearch: {} }] 以触发 grounding/web search。

从 result.text() 获取文本回答，从 result.groundingMetadata.groundingChunks 提取 web.uri / web.title 等来源并去重。

（你在 services/geminiService.ts 中已有实现，注意 SDK 版本差异与 API 返回结构，参见 types.ts 的 GroundingChunk / GroundingMetadata 设计。）

## 🧾 Usage（UI 指南）

在页面中输入问题或点击示例问题（例如：詹姆斯·韦伯望远镜最近有什么重大发现？）

等待分析完成：顶部会显示可信度评分（score）、来源数量、生成时间等元数据。

在右侧会列出所有检测到的来源（SourceCard），点击能在新标签页打开原始网页。

若未检测到任何来源，会出现橙色“潜在幻觉警告”的提示，建议人工核验。

## ✅ 可扩展/改进建议（Roadmap / TODO）

🔒 **后端代理**：把 Gemini 调用移到后端（Node/Express / Cloud Function）以保护 API Key。

🔍 **更深层的来源解析**：从 grounding chunks 抽取段落片段并在回答中高亮（highlightGroundedText）。

🧾 **来源可信度评分**：为每个来源计算可信度（站点权重、抓取时间、响应相似度等）。

♻️ **缓存 + 速率限制**：对相同查询做缓存，避免频繁消耗 API 配额。

🧪 **自动化测试**：对 services/geminiService.ts 的解析逻辑写单测（mock SDK 返回）。

🎨 **UI/UX**：实现移动端响应式、可折叠来源列表（Accordion）、来源预览浮层（hover preview）。

## 🧰 开发者说明（关键代码点）

App.tsx — UI 布局、状态管理（查询 / status / result / history）

services/geminiService.ts — 对接 Gemini，解析 groundingChunks → sources[]

components/AnalysisChart.tsx — 使用 recharts 绘制知识构成饼图

components/SourceCard.tsx — 展示单个来源（favicon / hostname / title / link）

types.ts — 类型定义（GroundingChunk / GroundingMetadata / AnalysisResult）

## 🐛 常见问题（Troubleshooting）

**页面没有显示 / 报错 root not found**：确认 index.html 中存在 <div id="root"></div>，且 index.tsx 正确 mount。

**Gemini 返回为空或字段不对**：确保使用的 @google/genai SDK 版本与代码片段匹配（result.text() vs result.text 差异）。

**CORS / API Key 泄露**：切勿把实际 API Key 写到前端生产代码；通过后端中转请求。

## 🧑‍🤝‍🧑 贡献 & 协作

欢迎 PR / Issue！你可以贡献：

增强 Grounding 解析（更多字段）

集成更多检索工具（例如 Bing / Custom search）

增强可视化（证据链、时间线、confidence heatmap）

## 🙏 致谢

感谢 Google Gemini（Grounding）提供强大的检索能力 🔎

参考并使用了 Recharts、Lucide、Tailwind 等优秀前端库 ✨

## ⭐ Star Support

如果你觉得这个项目对你有帮助，请给仓库点一个 ⭐ Star！
你的鼓励是我继续优化此项目的最大动力 😊

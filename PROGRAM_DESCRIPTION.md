# 《今天也很好 Mori Cabin》程序说明

## 1. 项目概述

《今天也很好 Mori Cabin》是一个 AI 驱动的生活记录、情绪回忆与决策辅助移动端 Web 应用。它面向希望低压力记录日常生活的用户，通过一句话输入、语音记录、图片上传、心情选择、地点记录和心动清单，将碎片化生活整理成可回忆、可分析、可推荐的个人生活档案。

项目核心目标不是做一个传统日记本，而是构建一个“温柔的生活记录空间”：用户每天只需要用很低的成本留下几条信息，系统就能帮助整理今日状态、生成温柔总结、沉淀月度回忆，并在用户不知道吃什么或喝什么时，基于历史偏好和心动清单给出推荐。

## 2. 产品定位

这是一个 AI-powered life logging system，核心能力包括：

- 低成本生活记录：一句话、语音、图片、心情、吃喝、穿搭、地点均可记录。
- AI 结构化解析：将自然语言日记拆解为心情、食物、饮品、地点等结构化字段。
- 情绪回忆系统：按月度和日期回顾情绪起伏、生活片段和语音记录。
- 决策辅助推荐：根据历史评分、最近未吃/未喝、心动清单和标签偏好推荐吃喝选择。
- 本地数据闭环：记录的数据保存在用户浏览器 localStorage 中，形成持续使用的个人生活轨迹。

## 3. 技术栈

### 前端

- React
- TypeScript
- Vite
- Tailwind CSS
- motion/react
- lucide-react

### 后端

- Express
- Node.js >= 20
- esbuild 打包后端入口
- dotenv 管理环境变量

### AI 服务

- 支持 DeepSeek / OpenAI-compatible API
- 通过 Express 后端代理调用，前端不直接暴露 API Key
- 本地提供 fallback 逻辑，AI 不可用时仍可体验核心流程

### 数据存储

- localStorage
- 当前主要存储 key：
  - `mori_records`
  - `mori_user`
  - `mori_theme`
  - 兼容旧版 legacy key

## 4. 项目结构

```text
mori-cabin/
├── index.html
├── package.json
├── vite.config.ts
├── server.ts
├── render.yaml
├── README.md
├── DEPLOY.md
├── PROGRAM_DESCRIPTION.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── index.ts
    ├── components/
    │   ├── HomeView.tsx
    │   ├── RecordView.tsx
    │   ├── MemoryView.tsx
    │   ├── RecommendView.tsx
    │   ├── SettingsView.tsx
    │   ├── home/
    │   ├── record/
    │   ├── memory/
    │   ├── recommend/
    │   ├── settings/
    │   ├── layout/
    │   └── ui/
    ├── pages/
    ├── utils/
    ├── hooks/
    ├── ai/
    ├── store/
    └── index.css
```

说明：

- `App.tsx` 是全局状态和页面路由控制中心。
- `components/*View.tsx` 是实际页面实现。
- `pages/*View.tsx` 目前主要作为转发层，导出对应的 `components` 页面。
- `server.ts` 同时承担静态资源服务和 AI/API 代理职责。
- `utils/recordItems.ts` 用于兼容旧数据结构并统一读取 food、drink、location、audio、wishlist 等数据。
- `utils/recommendation.ts` 实现本地推荐算法。

## 5. 页面与功能说明

### 5.1 生活小屋 HomeView

首页是应用的主入口，目标是让用户快速了解今日状态，并快速进入记录、回忆或推荐。

主要内容：

- 顶部问候语：显示用户昵称和今日问候。
- 小屋插画 Hero：作为核心情绪视觉入口。
- 今日进度状态条：显示今日完成进度，例如 `3/4`。
- 快捷入口：心情、食味、饮品、穿搭、地点。
- 推荐主卡：引导进入“今天选什么”。
- 点击小屋插画可打开今日总结弹窗。

移动端优化：

- Hero 高度经过压缩，避免首屏被大图完全占满。
- 快捷入口采用 3+2 分布。
- 大进度卡已替换为单行状态条。
- 首页保留一个主卡，减少信息堆叠。

### 5.2 今日小记 RecordView

记录页是应用的数据入口，目标是让用户低压力完成今日记录。

核心能力：

- AI 输入框：用户可以输入一句话，例如“今天喝了奶茶有点开心”。
- AI 解析：点击后调用 `/api/ai/parse-record`，自动填充心情、食物、饮品、地点等模块。
- 录音记录：支持浏览器录音，保存语音片段，便于以后回忆当时语气。
- 折叠模块：心情、食物、饮品、心动清单、穿搭、地点默认折叠。
- 图片上传：食物、饮品、穿搭、心动清单均支持图片。
- 多条记录：一天内可记录多个食物、多个饮品、多个地点。
- 固定底部保存按钮：保存今日记录并返回首页。

关键设计：

- 页面顶部只保留 AI 输入作为主入口。
- 所有记录模块默认折叠，点击后展开编辑。
- 保存逻辑不会覆盖当天已有记录，而是与当天旧记录合并。

### 5.3 生活回忆册 MemoryView

回忆册用于把生活数据转化为温柔的故事流和情绪轨迹。

包含两种模式：

- 统计回忆：按月查看整体状态。
- 每日手账：按具体日期查看当天记录。

统计回忆内容：

- AI 月度小结：作为页面主视觉。
- 单行轻信息条：例如“本月：😊温和为主 · ☕4杯饮品 · 📍4个地点”。
- 小型心情趋势图：展示最近心情波动。
- 足迹小地图：展示本月地点数量。

情绪详情页：

- 点击心情趋势图进入“情绪起伏”详情。
- 展示横向可滑动心情曲线。
- 移动端首屏可直接看到约 5 天心情记录。
- 下方展示每日生活日志，包括吃喝、地点、穿搭和录音。

日期选择：

- 统计回忆模式下选择年月。
- 每日手账模式下选择具体日期。
- 日期切换条做了移动端压缩，保证日期、年月/日期标签一行显示。

### 5.4 今天选什么 RecommendView

推荐页用于解决“今天吃什么/喝什么”的决策困难。

核心能力：

- 切换吃/喝推荐。
- 展示一个主推荐卡。
- 推荐理由压缩为一行，例如“因为你最近喜欢甜食 + 评分较高”。
- 固定底部按钮：
  - 换一个
  - 就它了

推荐来源：

- 历史食物/饮品记录。
- 用户评分。
- 最近是否重复。
- 心动清单中尚未兑现的想吃/想喝。

当用户点击“就它了”时，推荐结果会写入今日记录，形成记录闭环。

### 5.5 设置 SettingsView

设置页用于管理用户信息和主题。

主要能力：

- 修改用户资料。
- 切换主题。
- 从任意页面进入设置后，返回时回到来源页面。

## 6. 核心数据结构

### 6.1 JournalEntry

`JournalEntry` 是当前程序中最核心的生活记录对象。

主要字段：

- `id`：记录 ID，通常使用日期。
- `date`：记录日期。
- `mood`：心情 emoji。
- `moodText`：心情文本。
- `foodItems`：食物记录数组。
- `drinkItems`：饮品记录数组。
- `wishlistItems`：心动清单数组。
- `outfitImages`：穿搭图片。
- `outfitText`：穿搭描述。
- `locations`：地点数组。
- `audioNotes`：语音记录数组。
- `aiReflection`：AI 生成的温柔总结。
- `achievements`：今日完成与待完成事项。

### 6.2 FoodItem / DrinkItem

食物和饮品结构类似：

- `id`
- `name`
- `rating`
- `note`
- `image`
- `tags`

### 6.3 WishlistItem

心动清单用于记录“想吃但没吃”“想喝但没喝”的内容。

字段：

- `name`
- `type`: `food` 或 `drink`
- `note`
- `image`
- `status`: `pending` 或 `done`
- `createdAt`

推荐页会优先将 pending 状态的心动清单纳入候选，增强“意外惊喜”的体验。

### 6.4 LocationItem

地点记录字段：

- `name`
- `city`
- `lat`
- `lng`
- `tags`
- `createdAt`

记录页支持通过浏览器定位获取经纬度，并通过后端接口进行反向地理编码，尽量显示地点名称而不是裸经纬度。

### 6.5 AudioNote

语音记录字段：

- `dataUrl`
- `mimeType`
- `durationSeconds`
- `createdAt`

语音会以 data URL 的形式保存在 localStorage 中，适合 Demo 和个人轻量使用。

## 7. AI 接入说明

### 7.1 接入方式

前端不会直接调用 DeepSeek，也不会暴露 API Key。所有 AI 请求都通过 Express 后端代理。

主要接口：

- `POST /api/ai/parse-record`
- `POST /api/ai/daily-reflection`
- `POST /api/ai/monthly-summary`
- `POST /api/ai/recommend`
- `POST /api/get-recommendation`

### 7.2 环境变量

部署时需要配置：

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_key
AI_BASE_URL=https://api.deepseek.com/chat/completions
AI_MODEL=deepseek-chat
```

兼容字段：

```bash
AI_API_KEY
OPENAI_API_KEY
```

### 7.3 AI 解析流程

用户输入一句话后：

1. 前端发送文本到 `/api/ai/parse-record`。
2. 后端构造生活记录解析 prompt。
3. AI 返回结构化 JSON。
4. 前端将结果填入心情、食物、饮品、地点等模块。
5. 如果 AI 调用失败，程序使用本地 fallback 规则，保证功能可继续体验。

示例：

输入：

```text
我今天吃了披萨好吃，买了葡萄冰茶还喝了可乐，葡萄冰茶一般，可乐好喝，今天呆在学校了，今天还挺舒服的，开心
```

期望结构：

- mood：开心 / 舒心
- food：披萨
- drink：葡萄冰茶、可乐
- location：学校

## 8. 推荐系统说明

推荐系统由本地算法和 AI fallback 共同组成。

本地推荐逻辑位于：

```text
src/utils/recommendation.ts
```

推荐候选来源：

- 历史 foodItems
- 历史 drinkItems
- pending 状态的 wishlistItems

评分因素：

- 用户历史评分
- 是否最近没有吃/喝
- 标签匹配
- 心动清单加权
- 频率惩罚

推荐结果会生成：

- 名称
- 类型
- 评分
- 匹配度
- 标签
- 推荐理由
- 图片

## 9. 本地存储与数据闭环

用户数据保存在 localStorage 中，因此当前 Demo 不依赖数据库。

数据闭环：

```text
今日小记
  ↓
localStorage 保存 JournalEntry
  ↓
回忆册聚合月度数据
  ↓
推荐页读取历史偏好与心动清单
  ↓
推荐结果写回今日记录
  ↓
继续形成新的生活数据
```

同一天多次保存时，程序会合并记录，而不是直接覆盖：

- 食物数组合并。
- 饮品数组合并。
- 地点数组合并。
- 语音数组合并。
- 心动清单合并。
- 今日总结更新。

## 10. 移动端设计优化

本项目主要面向手机使用，因此后期对移动端进行了信息密度重构。

关键优化：

- 所有主页面减少大卡堆叠。
- 记录页所有模块默认折叠。
- 首页 Hero 缩小，快捷入口 3+2。
- 回忆册删除大统计卡，改为轻信息条。
- 推荐页压缩为“主推荐 + 一行理由 + 固定操作”。
- 情绪详情曲线压缩高度，并保证移动端首屏可看到约 5 天记录。
- 日期切换条压缩为单行显示，防止文字换行和标签溢出。

## 11. 部署说明

### 11.1 本地运行

```bash
npm install
npm run dev
```

访问：

```text
http://127.0.0.1:3000/
```

### 11.2 构建与启动

```bash
npm run lint
npm run build
npm start
```

健康检查：

```text
http://127.0.0.1:3000/api/health
```

### 11.3 Render 部署

项目包含 `render.yaml`，适合部署为 Web Service。

部署时需要在 Render 环境变量中配置 AI Key，不要把 `.env` 提交到 GitHub。

## 12. 安全与隐私说明

- API Key 只存在服务端环境变量中。
- 前端不直接暴露 DeepSeek Key。
- 用户记录数据默认保存在本地浏览器 localStorage。
- 当前 Demo 没有账号云同步，因此换设备后数据不会自动同步。
- 语音以 data URL 存储，适合 Demo，但长期产品化建议迁移到对象存储。

## 13. 当前已实现功能清单

- 用户资料初始化。
- 首页生活小屋入口。
- 今日总结弹窗。
- 一句话 AI 解析。
- 语音记录。
- 心情选择。
- 多食物记录。
- 多饮品记录。
- 图片上传。
- 心动清单。
- 地点定位与多地点记录。
- 当日记录合并保存。
- 月度回忆。
- 每日手账。
- 情绪趋势图。
- 情绪详情曲线。
- 本地推荐系统。
- 推荐结果写入今日记录。
- localStorage 数据持久化。
- DeepSeek API 代理接入。
- 移动端响应式优化。

## 14. 当前限制与后续优化方向

### 当前限制

- 数据只保存在当前浏览器，不支持跨设备同步。
- localStorage 不适合长期保存大量图片和语音。
- AI 解析依赖 prompt 和模型能力，复杂句子仍可能需要继续优化。
- 地点名称依赖浏览器定位和反向地理编码结果。
- 当前没有完整账号体系和服务端数据库。

### 后续优化方向

- 增加用户登录与云端同步。
- 使用数据库保存记录。
- 使用对象存储保存图片和音频。
- 增强 AI 解析 prompt，提升多食物、多饮品、多地点识别准确率。
- 增加 PWA 能力，让用户可以把网页添加到手机桌面。
- 增加导出月报功能。
- 增加隐私设置与数据清空功能。
- 增加推荐解释详情和偏好编辑。

## 15. 项目亮点

- 产品闭环完整：记录、存储、回忆、推荐、再记录形成循环。
- AI 使用克制：AI 不是噱头，而是用于降低记录成本和生成情绪化总结。
- 移动端体验优先：针对手机屏幕做了折叠、压缩和固定操作按钮设计。
- 数据结构可扩展：FoodItem、DrinkItem、LocationItem、WishlistItem、AudioNote 均可独立扩展。
- 部署友好：前后端统一由 Express 服务，适合 Render/Railway 直接部署。
- 作品集表达清晰：既有产品思考，也有工程实现和 AI 接入能力。

## 16. 一句话总结

《今天也很好 Mori Cabin》是一个将“生活碎片”转化为“情绪记忆”和“个性化推荐”的 AI 生活记录系统。它用低成本输入帮助用户记录当下，用 AI 和数据结构帮助用户回看生活，也在用户犹豫时给出温柔的选择建议。

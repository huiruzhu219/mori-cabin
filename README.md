# 今天也很好 Mori Cabin

AI 驱动的生活记录、情绪回忆与决策辅助 H5 应用。

核心体验：

- 低压力记录每日心情、吃喝、穿搭、地点、录音
- AI 将一句话日记解析为结构化记录
- 回忆册展示月度统计、情绪曲线、每日手账
- 推荐页基于历史记录和心动清单，帮用户决定今天吃什么/喝什么
- 数据使用 localStorage 保存在用户自己的浏览器中

## 技术栈

- React + Vite + TypeScript
- Tailwind CSS
- motion/react
- lucide-react
- Express API Proxy
- DeepSeek/OpenAI-compatible API

## 本地运行

```bash
npm install
cp .env.example .env
npm run dev
```

打开：

```text
http://127.0.0.1:3000/
```

## 生产构建

```bash
npm run lint
npm run build
npm start
```

健康检查：

```text
http://127.0.0.1:3000/api/health
```

## 环境变量

```bash
NODE_ENV=production
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_key
AI_BASE_URL=https://api.deepseek.com/chat/completions
AI_MODEL=deepseek-chat
```

不要提交 `.env`。部署时请在平台环境变量中配置 API Key。

## 部署

推荐使用 Render 或 Railway。详细步骤见 [DEPLOY.md](./DEPLOY.md)。

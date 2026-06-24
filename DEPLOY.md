# 今天也很好 Mori Cabin 部署说明

这是一个 React + Vite + Express 的 H5 应用。生产环境使用同一个 Node 服务同时提供前端页面和后端 API。

## 最快上线方式：Render

1. 在 GitHub 新建仓库，把本项目上传。
2. 打开 Render，选择 `New` -> `Blueprint`。
3. 选择这个 GitHub 仓库，Render 会读取 `render.yaml`。
4. 在环境变量里填写：
   - `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key
   - `AI_PROVIDER`: `deepseek`
   - `AI_BASE_URL`: `https://api.deepseek.com/chat/completions`
   - `AI_MODEL`: `deepseek-chat`
   - `NODE_ENV`: `production`
5. 部署完成后，Render 会给你一个 HTTPS 链接，可以直接发给别人体验。

## Railway 方式

1. 新建 Railway Project，选择 GitHub 仓库。
2. Build command 填：
   ```bash
   npm install && npm run build
   ```
3. Start command 填：
   ```bash
   npm start
   ```
4. Variables 填：
   ```bash
   NODE_ENV=production
   AI_PROVIDER=deepseek
   DEEPSEEK_API_KEY=你的新 key
   AI_BASE_URL=https://api.deepseek.com/chat/completions
   AI_MODEL=deepseek-chat
   ```

## 本地生产验证

```bash
npm install
npm run lint
npm run build
npm start
```

打开：

```text
http://127.0.0.1:3000/
```

健康检查：

```text
http://127.0.0.1:3000/api/health
```

## 上线前检查

- 不要提交 `.env` 文件。
- DeepSeek API Key 只能放在部署平台环境变量里。
- 浏览器定位功能上线后需要 HTTPS，Render/Railway 默认提供 HTTPS。
- 当前版本使用 localStorage，每个体验者的数据只保存在自己的浏览器里。
- 招聘展示建议准备一段 30 秒演示流程：
  - 首页 -> 记录一句话 -> 录音/定位/心动清单 -> 保存 -> 回忆页 -> 推荐页抽选。

## 重要安全提醒

如果 API Key 曾经出现在聊天、截图、文档或公开仓库里，建议到 DeepSeek 控制台删除旧 key，重新创建一个新 key 再部署。

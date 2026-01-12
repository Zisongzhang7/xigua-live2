<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 交互直播 2.0 (Live Interactive V2)

This project is a React-based interactive live streaming application with a Node.js companion server for data persistence.

## Features
- **Frontend**: React, Vite, TypeScript, Dexie.js (Client-side DB)
- **Backend**: Node.js (for synchronizing PRD notes/admin data)
- **Persistence**: Hybrid (Browser IndexedDB + Server JSON file)

## Getting Started

### Development
```bash
npm install
npm run dev:all
```

### 部署 (Google Cloud)
本项目包含一个 `deploy.sh` 脚本，用于自动部署到 Google Cloud Run 并处理数据持久化。

**前提条件:**
1. 安装 [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)。
2. 登录: `gcloud auth login`。

**操作步骤:**
1. 在终端运行部署脚本:
   ```bash
   ./deploy.sh
   ```
2. 按照提示输入您的 Google Cloud **Project ID**（项目ID）。
3. 脚本将自动执行以下操作:
   - 创建 Google Cloud Storage 存储桶用于数据持久化。
   - 将您本地的 `server/data/prd-notes.json` 上传到存储桶（迁移数据）。
   - 构建 Docker 镜像。
   - 部署到 Cloud Run，并将存储桶挂载为数据卷。

**关于数据持久化:**
- **服务端数据** (`prd-notes.json`) 会持久化存储在 GCS 存储桶中，即使服务重启数据也不会丢失。
- **客户端数据 (Dexie.js)** 存储在用户的浏览器中，**不会**自动迁移到线上环境。您访问线上网站时，将是一个全新的空白客户端数据库。

View your app in AI Studio: https://ai.studio/apps/drive/1LZynVtORQJtFmCkPHWCojk4zKMF4mh3V

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the PRD sync backend (stores PRD notes on disk, not in browser):
   `npm run server`
4. Run the app:
   `npm run dev`

### PRD 标注云端同步（重要）
- PRD 模式写的“说明/标注”默认会优先写入后端：`/api/prd-notes`，并落盘到 `server/data/prd-notes.json`
- 如果后端不可用，会自动回退到浏览器本地 Dexie（IndexedDB）
- 你可以通过右下角 PRD 悬浮球的“更多”按钮导出/导入 JSON 作为备份

#### 一键启动（macOS / Linux）
`npm run dev:all`

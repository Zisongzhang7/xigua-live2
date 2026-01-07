# 部署指南 (Deployment Guide)

本项目是一个基于 React + Vite 的静态应用，非常适合部署到 Vercel、Netlify 或任何静态网站托管服务。

配置已验证：`npm run build` 成功通过。

## 推荐方案 1: Vercel (最简单、最快)

Vercel 是 Next.js 的开发团队推出的平台，对 Vite 项目支持极佳。

### 方法 A: 使用 GitHub/GitLab (推荐)
1. 将你的代码推送到 GitHub/GitLab。
2. 登录 [Vercel.com](https://vercel.com)。
3. 点击 "Add New..." -> "Project"。
4. 导入你的 Git 仓库。
5. Framework Preset 会自动识别为 `Vite`。
6. 点击 "Deploy"。

### 方法 B: 使用命令行 (无需 Git 仓库)
虽然推荐使用 Git，但你也可以直接通过命令行部署：

1. 运行部署命令:
   ```bash
   npx vercel
   ```
2. 按照终端提示操作:
   - Set up and deploy? **Yes**
   - Which scope? **Select your account**
   - Link to existing project? **No**
   - Project name? **(按回车使用默认)**
   - In which directory is your code located? **./**
   - Want to modify these settings? **No** (自动检测配置通常是正确的)

## 推荐方案 2: Netlify

与 Vercel 类似，也是极佳的静态托管平台。

1. 登录 Netlify。
2. 拖拽 `dist` 文件夹到 Netlify 页面（手动部署）。
3. 或连接 GitHub 仓库进行自动部署。

---

## 方案 3: Docker (容器化部署)

如果你需要将应用部署到私有云或具体的服务器（如阿里云、腾讯云 CVM），可以使用 Docker + Nginx。

### 1. 创建 `Dockerfile`
在项目根目录创建名为 `Dockerfile` 的文件：

```dockerfile
# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 构建与运行
```bash
# 构建镜像
docker build -t live-app .

# 运行容器 (映射 80 端口)
docker run -d -p 80:80 live-app
```

## 方案 4: 传统 Nginx 部署

1. 在本地运行构建:
   ```bash
   npm run build
   ```
2. 将生成的 `dist` 目录上传到你的服务器。
3. 配置 Nginx 指向该目录:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/your/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

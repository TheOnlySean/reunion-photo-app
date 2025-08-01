# 聚会拍照助手 📸

一个专为聚会设计的拍照分享WebApp，支持倒计时拍照和二维码即时分享。

## ✨ 功能特点

- 📱 **触屏拍照**：轻触屏幕启动拍照
- ⏰ **倒计时拍摄**：5秒倒计时连拍3张
- 🖼️ **照片选择**：从3张照片中选择最满意的一张
- 📲 **二维码分享**：生成二维码，扫码即可获取照片
- 🔄 **智能下载**：
  - Android：扫码自动下载
  - iOS：扫码后长按保存或使用分享功能
- 💾 **云端存储**：使用Cloudflare R2确保照片安全存储

## 🚀 快速开始

### 环境变量配置

创建 `.env.local` 文件：

\`\`\`bash
# 数据库连接 (NEON)
DATABASE_URL="postgresql://neondb_owner:npg_8G3meXYdEyFR@ep-dark-meadow-afvel0ub-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# Firebase Storage 配置
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id",...}'
FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"

# 应用配置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="聚会拍照助手"

# 照片过期时间（小时）
PHOTO_EXPIRE_HOURS=24
\`\`\`

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

## 📦 技术栈

- **前端框架**：Next.js 14 + TypeScript
- **样式系统**：Tailwind CSS
- **数据库**：NEON (PostgreSQL)
- **文件存储**：Firebase Storage
- **部署平台**：Vercel

## 🏗️ 项目结构

\`\`\`
reunion-photo-app/
├── app/
│   ├── api/              # API路由
│   ├── photo/[id]/       # 照片下载页面
│   └── page.tsx          # 主页面
├── components/           # React组件
├── lib/                 # 工具库
└── public/              # 静态资源
\`\`\`

## 📱 使用流程

1. **打开应用**：在iPad或手机上打开WebApp
2. **开始拍照**：触摸拍照按钮
3. **倒计时拍摄**：5秒倒计时后连拍3张
4. **选择照片**：从3张照片中选择最佳的一张
5. **生成二维码**：应用自动生成分享二维码
6. **扫码获取**：在场人员扫码即可获取照片

## 🔧 部署到Vercel

1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 部署完成！

## 📄 许可证

MIT License
# 🚀 部署指南

## 环境变量配置

### 1. NEON 数据库（已准备就绪）
数据库已经创建并配置完成：
```
DATABASE_URL="postgresql://neondb_owner:npg_8G3meXYdEyFR@ep-dark-meadow-afvel0ub-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

### 2. Firebase Storage 配置
需要在 Firebase 中设置：

1. **创建 Firebase 项目**：
   - 访问 [Firebase Console](https://console.firebase.google.com)
   - 创建新项目
   - 启用 Storage 服务

2. **配置 Storage 规则**：
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true; // 允许公开访问
       }
     }
   }
   ```

3. **获取服务账号密钥**：
   - 进入项目设置 → 服务账号
   - 生成新的私钥（JSON格式）
   - 将整个JSON内容作为环境变量

### 3. Vercel 环境变量
在 Vercel 项目设置中添加以下环境变量：

```bash
# 数据库
DATABASE_URL=postgresql://neondb_owner:npg_8G3meXYdEyFR@ep-dark-meadow-afvel0ub-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id"...}
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# 应用配置
NEXT_PUBLIC_APP_URL=https://你的vercel域名.vercel.app
NEXT_PUBLIC_APP_NAME=聚会拍照助手
PHOTO_EXPIRE_HOURS=24
```

## 部署步骤

### 1. 连接 GitHub 到 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 `reunion-photo-app` 仓库
5. 点击 "Deploy"

### 2. 配置环境变量
在 Vercel 项目设置中：
1. 进入 "Settings" → "Environment Variables"
2. 添加上述所有环境变量
3. 重新部署项目

### 3. 测试部署
1. 访问部署的 URL
2. 测试相机功能
3. 测试拍照和上传
4. 测试二维码分享
5. 测试照片下载

## 本地开发

```bash
# 安装依赖
npm install

# 创建环境变量文件
cp .env.local.example .env.local
# 编辑 .env.local 填入真实配置

# 启动开发服务器
npm run dev
```

## 维护任务

### 清理过期会话
运行清理脚本：
```bash
node scripts/cleanup.js
```

建议设置定时任务每天运行一次清理。

## 故障排除

### 1. 相机无法访问
- 确保使用 HTTPS
- 检查浏览器权限设置
- 在移动设备上测试

### 2. 上传失败
- 检查 Firebase Storage 配置
- 验证服务账号密钥格式
- 确认 Storage 规则允许写入
- 查看浏览器网络面板错误

### 3. 数据库连接失败
- 验证 DATABASE_URL 正确性
- 检查 NEON 项目状态

## 性能优化

### 1. 图片压缩
当前设置为 90% JPEG 质量，可根据需要调整。

### 2. CDN 缓存
Firebase Storage 自动提供全球 CDN 加速。

### 3. 数据库索引
已创建必要的数据库索引以优化查询性能。

## 安全注意事项

1. **照片自动过期**：默认 24 小时后自动清理
2. **无需用户认证**：适合聚会等临时场景
3. **HTTPS 必需**：相机 API 要求 HTTPS
4. **环境变量保护**：敏感信息不要提交到代码库

## 扩展功能建议

1. **批量下载**：支持下载所有临时照片
2. **照片水印**：添加聚会日期/名称水印
3. **多语言支持**：支持英文等其他语言
4. **统计分析**：记录使用情况和热门时段
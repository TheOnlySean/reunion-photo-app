# 🔧 Vercel Blob 配置指南

## 1. 获取 Vercel Blob Token

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 点击 **Add New**
5. 创建变量：
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: 您的Vercel Blob token

## 2. 获取Token的步骤

### 方法1：通过Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 创建Blob store
vercel blob create

# 获取token
vercel env ls
```

### 方法2：通过Vercel Dashboard
1. 在项目设置中
2. 进入 **Storage** 选项卡
3. 点击 **Create Database** → **Blob**
4. 复制生成的 `BLOB_READ_WRITE_TOKEN`

## 3. 环境变量配置

在Vercel项目中添加：
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_GvZacS1zhqBA8QZQ_9dxdeLTVNP4jIpjhP7HhXPyQbWfPod
```

## 4. 本地开发

创建 `.env.local` 文件：
```bash
cp .env.local.example .env.local
```

然后填入您的实际token值。

## 5. 优势

✅ **简单配置**：无需复杂的Firebase设置
✅ **零CORS问题**：完美集成Vercel
✅ **自动CDN**：全球加速访问
✅ **直接下载**：支持移动设备一键保存
✅ **高性能**：与Next.js原生集成

## 6. 测试

部署后测试：
1. 拍摄照片
2. 选择照片
3. 扫描QR码
4. 照片应该直接下载到设备
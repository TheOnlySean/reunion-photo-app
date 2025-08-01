# 🎊 聚会拍照应用 - 部署指南

## 🚀 快速部署

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```bash
# Neon 数据库 (必需)
DATABASE_URL="your_neon_database_url"

# Vercel Blob 存储 (必需)
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

### 2. 数据库设置

**创建设备认证表**：
```sql
CREATE TABLE IF NOT EXISTS device_auth (
    id VARCHAR(50) PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL,
    device_name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_device_auth_device_id ON device_auth(device_id);
CREATE INDEX idx_device_auth_active ON device_auth(is_active);
```

### 3. 设备账户管理

访问 `你的域名/admin` 管理设备账户：
- 添加新设备 (设备ID + 密码 + 设备名)
- 启用/禁用设备
- 复制登录信息分发给用户

### 4. 应用功能

✅ **设备认证登录** - 安全的设备ID + 密码认证
✅ **拍照功能** - 3张照片拍摄 + 大头贴风格倒计时
✅ **照片选择** - 预览选择最佳照片
✅ **QR码生成** - 自动生成分享二维码
✅ **移动下载** - iOS/Android 优化的下载体验
✅ **日语界面** - 完整的日语用户界面

### 5. 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **认证**: JWT-like 设备认证系统
- **存储**: Vercel Blob (照片存储)
- **数据库**: Neon PostgreSQL
- **部署**: Vercel

### 6. 使用流程

1. **管理员**: 在 `/admin` 创建设备账户
2. **用户**: 使用设备ID和密码登录
3. **拍照**: 5-4-3-2-1 倒计时拍摄3张照片  
4. **选择**: 预览并选择最佳照片
5. **分享**: 生成QR码供他人扫描下载

---

**现在应用已完全准备就绪！** 🎉
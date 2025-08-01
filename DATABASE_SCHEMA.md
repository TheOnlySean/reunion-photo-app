# 数据库表结构

## 设备认证表 (device_auth)

需要在数据库中创建以下表来支持设备认证功能：

```sql
-- 设备认证表
CREATE TABLE IF NOT EXISTS device_auth (
    id VARCHAR(50) PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL, -- SHA256哈希
    device_name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_device_auth_device_id ON device_auth(device_id);
CREATE INDEX idx_device_auth_active ON device_auth(is_active);
```

## 示例数据

```sql
-- 插入示例设备认证数据
INSERT INTO device_auth (id, device_id, password, device_name, is_active) VALUES 
(
    'auth_' || EXTRACT(EPOCH FROM NOW())::text || floor(random() * 1000)::text,
    'DEVICE001', 
    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- 'password123' 的SHA256
    'パーティー会場iPad',
    true
),
(
    'auth_' || EXTRACT(EPOCH FROM NOW())::text || floor(random() * 1000)::text,
    'DEVICE002', 
    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- 'secret456' 的SHA256
    '受付カウンター端末',
    true
),
(
    'auth_' || EXTRACT(EPOCH FROM NOW())::text || floor(random() * 1000)::text,
    'DEVICE003', 
    '2c70e12b7a0646f92279f427c7b38e7334d8e5389cff167a1dc30e73f826b683', -- 'admin789' 的SHA256
    'スタッフ用タブレット',
    true
);
```

## 密码哈希生成

在Node.js中生成密码哈希：

```javascript
const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 示例
console.log('password123:', hashPassword('password123'));
console.log('secret456:', hashPassword('secret456'));
console.log('admin789:', hashPassword('admin789'));
```

## 环境变量

确保在 `.env.local` 或生产环境中配置：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@host:port/database"

# Vercel Blob存储（如果使用）
BLOB_READ_WRITE_TOKEN="你的Vercel Blob令牌"
```

## API路由

系统提供以下API端点：

- `POST /api/auth/login` - 设备登录
- `POST /api/auth/verify` - 验证token

## 设备管理

### 添加新设备

```sql
INSERT INTO device_auth (id, device_id, password, device_name, is_active) VALUES 
(
    'auth_' || EXTRACT(EPOCH FROM NOW())::text || floor(random() * 1000)::text,
    'YOUR_DEVICE_ID', 
    '你的密码的SHA256哈希',
    '设备显示名称',
    true
);
```

### 禁用设备

```sql
UPDATE device_auth SET is_active = false WHERE device_id = 'DEVICE_ID_TO_DISABLE';
```

### 重置密码

```sql
UPDATE device_auth 
SET password = '新密码的SHA256哈希' 
WHERE device_id = 'DEVICE_ID';
```

## 安全考虑

1. **密码哈希**: 使用SHA256哈希存储密码（生产环境建议使用bcrypt）
2. **Token过期**: Token有效期24小时，自动过期
3. **设备状态**: 可以随时禁用设备访问
4. **登录记录**: 记录最后登录时间用于审计

## 使用流程

1. 管理员创建设备记录（设备号+密码）
2. 将设备号和密码分发给用户
3. 用户在登录界面输入设备号和密码
4. 系统验证后生成token，存储在localStorage
5. 后续访问自动验证token有效性
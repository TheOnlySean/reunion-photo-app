import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT id, device_id, device_name, is_active, created_at, last_login
        FROM device_auth 
        ORDER BY created_at DESC
      `);
      
      // 注意：这里不返回密码哈希，密码将在前端本地存储
      const devices = result.rows.map(row => ({
        ...row,
        password: '••••••••' // 占位符，实际密码不从数据库返回
      }));
      
      return NextResponse.json({
        success: true,
        devices
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json({
      success: false,
      error: 'デバイス一覧の取得に失敗しました'
    }, { status: 500 });
  }
}
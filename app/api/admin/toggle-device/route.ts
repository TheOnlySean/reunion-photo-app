import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { deviceId, isActive } = await request.json();

    if (!deviceId || typeof isActive !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: '無効なパラメータです'
      });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'UPDATE device_auth SET is_active = $1 WHERE device_id = $2 RETURNING *',
        [isActive, deviceId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'デバイスが見つかりません'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: isActive ? 'デバイスを有効にしました' : 'デバイスを無効にしました'
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Toggle device error:', error);
    return NextResponse.json({
      success: false,
      error: 'デバイス状態の更新に失敗しました'
    }, { status: 500 });
  }
}
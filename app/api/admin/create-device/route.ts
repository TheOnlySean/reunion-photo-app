import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { deviceId, password, deviceName } = await request.json();

    // Validate input
    if (!deviceId || !password || !deviceName) {
      return NextResponse.json({
        success: false,
        error: '所有字段都是必填的'
      });
    }

    // Create device auth record
    const authId = await Database.createDeviceAuth(
      deviceId.trim(),
      password.trim(),
      deviceName.trim()
    );

    return NextResponse.json({
      success: true,
      authId,
      message: '设备创建成功'
    });

  } catch (error: any) {
    console.error('Create device error:', error);
    
    // Handle duplicate device ID error
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json({
        success: false,
        error: '设备ID已存在'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: '创建设备时发生错误'
    }, { status: 500 });
  }
}
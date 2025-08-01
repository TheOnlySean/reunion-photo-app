import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

// 用于在前端存储明文密码的临时存储
const devicePasswords = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const { deviceId, password, deviceName } = await request.json();

    // Validate input
    if (!deviceId || !password || !deviceName) {
      return NextResponse.json({
        success: false,
        error: 'すべての項目を入力してください'
      });
    }

    // Create device auth record
    const authId = await Database.createDeviceAuth(
      deviceId.trim(),
      password.trim(),
      deviceName.trim()
    );

    // 临时存储明文密码用于前端显示（实际使用中应该考虑安全性）
    devicePasswords.set(deviceId.trim(), password.trim());

    return NextResponse.json({
      success: true,
      authId,
      deviceId: deviceId.trim(),
      password: password.trim(), // 返回明文密码用于前端显示
      deviceName: deviceName.trim(),
      message: 'デバイスが正常に作成されました'
    });

  } catch (error: any) {
    console.error('Create device error:', error);
    
    // Handle duplicate device ID error
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json({
        success: false,
        error: 'デバイスIDは既に存在します'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'デバイスの作成に失敗しました'
    }, { status: 500 });
  }
}

// 获取设备密码的辅助API
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const deviceId = url.searchParams.get('deviceId');
  
  if (!deviceId) {
    return NextResponse.json({
      success: false,
      error: 'デバイスIDが必要です'
    });
  }

  const password = devicePasswords.get(deviceId);
  
  return NextResponse.json({
    success: true,
    password: password || '••••••••'
  });
}
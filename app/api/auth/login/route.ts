import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';
import { LoginRequest, LoginResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { deviceId, password } = body;

    // Validate input
    if (!deviceId || !password) {
      return NextResponse.json({
        success: false,
        error: '設備號とパスワードを入力してください'
      } as LoginResponse);
    }

    // Authenticate device
    const device = await Database.authenticateDevice(deviceId.trim(), password);

    if (!device) {
      return NextResponse.json({
        success: false,
        error: '設備號またはパスワードが正しくありません'
      } as LoginResponse);
    }

    // Generate auth token
    const token = await Database.generateAuthToken(deviceId);

    return NextResponse.json({
      success: true,
      token,
      deviceName: device.device_name
    } as LoginResponse);

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    } as LoginResponse, { status: 500 });
  }
}
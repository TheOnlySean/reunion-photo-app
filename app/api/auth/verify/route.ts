import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'トークンが提供されていません'
      });
    }

    const result = await Database.verifyAuthToken(token);

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'トークンが無効または期限切れです'
      });
    }

    return NextResponse.json({
      success: true,
      deviceId: result.deviceId
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'サーバーエラーが発生しました'
    }, { status: 500 });
  }
}
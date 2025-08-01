import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { sessionName } = await request.json();
    
    const sessionId = generateId();
    
    // 临时返回成功，暂时跳过数据库连接测试基本功能
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'テスト: セッションが作成されました'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'セッション作成に失敗しました' },
      { status: 500 }
    );
  }
}
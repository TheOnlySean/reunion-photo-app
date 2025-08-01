import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, selectedPhotoUrl } = await request.json();

    if (!sessionId || !selectedPhotoUrl) {
      return NextResponse.json(
        { success: false, error: 'セッションIDと選択された写真URLが必要です' },
        { status: 400 }
      );
    }

    // 生成测试分享URL
    const shareUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/photo/${sessionId}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      selectedPhotoUrl,
      message: 'テスト: 写真が選択され、QRコードが生成されました'
    });
  } catch (error) {
    console.error('Error selecting photo:', error);
    return NextResponse.json(
      { success: false, error: '写真の選択に失敗しました' },
      { status: 500 }
    );
  }
}
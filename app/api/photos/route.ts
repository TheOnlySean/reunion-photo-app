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

    // 直接使用Firebase照片URL作为分享链接，扫码即可下载
    const shareUrl = selectedPhotoUrl;

    return NextResponse.json({
      success: true,
      shareUrl,
      selectedPhotoUrl,
      message: 'QRコードが生成されました - 直接Firebase URLを使用'
    });
  } catch (error) {
    console.error('Error selecting photo:', error);
    return NextResponse.json(
      { success: false, error: '写真の選択に失敗しました' },
      { status: 500 }
    );
  }
}
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

    // 创建下载链接，指向我们的下载API端点
    const encodedPhotoUrl = encodeURIComponent(selectedPhotoUrl);
    
    // 获取正确的base URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const shareUrl = `${baseUrl}/api/download/${encodedPhotoUrl}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      selectedPhotoUrl,
      message: 'QRコードが生成されました - Vercel Blob + 直接下载'
    });
  } catch (error) {
    console.error('Error selecting photo:', error);
    return NextResponse.json(
      { success: false, error: '写真の選択に失敗しました' },
      { status: 500 }
    );
  }
}
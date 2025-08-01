import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'セッションIDが必要です' },
        { status: 400 }
      );
    }

    // 临时模拟上传成功，返回假的URLs
    const mockPhotos = [
      'https://via.placeholder.com/600x400/ff6b6b/ffffff?text=Photo+1',
      'https://via.placeholder.com/600x400/4ecdc4/ffffff?text=Photo+2', 
      'https://via.placeholder.com/600x400/45b7d1/ffffff?text=Photo+3'
    ];

    return NextResponse.json({
      success: true,
      photos: mockPhotos,
      message: 'テスト: 写真をアップロードしました'
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { success: false, error: '写真のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
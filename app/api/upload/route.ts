import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

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

    const uploadedPhotos: string[] = [];

    // 上传每张照片到Vercel Blob
    for (let i = 0; i < 3; i++) {
      const photoFile = formData.get(`photo${i}`) as File;
      if (photoFile) {
        try {
          const fileName = `sessions/${sessionId}/photo-${i}-${Date.now()}.jpg`;
          const blob = await put(fileName, photoFile, {
            access: 'public',
            contentType: 'image/jpeg',
            cacheControlMaxAge: 31536000, // 1年缓存
          });
          
          uploadedPhotos.push(blob.url);
        } catch (uploadError) {
          console.error(`Error uploading photo ${i}:`, uploadError);
          throw new Error(`Failed to upload photo ${i}`);
        }
      }
    }

    if (uploadedPhotos.length === 0) {
      return NextResponse.json(
        { success: false, error: '写真が見つかりません' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      photos: uploadedPhotos,
      message: `${uploadedPhotos.length}枚の写真をアップロードしました`
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { success: false, error: '写真のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
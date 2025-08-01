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
    const hasVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    console.log('Vercel Blob配置:', hasVercelBlob ? '已配置' : '未配置');

    // 上传每张照片
    for (let i = 0; i < 3; i++) {
      const photoFile = formData.get(`photo${i}`) as File;
      if (photoFile) {
        try {
          if (hasVercelBlob) {
            // 使用Vercel Blob上传
            const fileName = `sessions/${sessionId}/photo-${i}-${Date.now()}.jpg`;
            const blob = await put(fileName, photoFile, {
              access: 'public',
              contentType: 'image/jpeg',
              cacheControlMaxAge: 31536000, // 1年缓存
            });
            uploadedPhotos.push(blob.url);
            console.log(`照片 ${i} 上传到Vercel Blob: ${blob.url}`);
          } else {
            // 备用方案：转换为base64 data URL（仅用于测试）
            const buffer = await photoFile.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64}`;
            uploadedPhotos.push(dataUrl);
            console.log(`照片 ${i} 使用base64备用方案`);
          }
        } catch (uploadError) {
          console.error(`Error uploading photo ${i}:`, uploadError);
          throw new Error(`写真 ${i} のアップロードに失敗しました: ${uploadError.message}`);
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
      message: hasVercelBlob 
        ? `${uploadedPhotos.length}枚の写真をVercel Blobにアップロードしました`
        : `${uploadedPhotos.length}枚の写真を処理しました（Vercel Blob未設定のため一時的なデータURLを使用）`,
      usingFallback: !hasVercelBlob
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { success: false, error: `写真のアップロードに失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}
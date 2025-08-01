import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const photoId = params.photoId;
    const photoUrl = decodeURIComponent(photoId);
    
    console.log('下载请求:', photoUrl);
    
    // 获取User-Agent来检测设备类型
    const userAgent = request.headers.get('user-agent') || '';
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    try {
      let photoBuffer: ArrayBuffer;
      
      if (photoUrl.startsWith('data:image/jpeg;base64,')) {
        // 处理base64 data URL（备用方案）
        console.log('处理base64照片');
        const base64Data = photoUrl.split(',')[1];
        photoBuffer = Buffer.from(base64Data, 'base64').buffer;
      } else {
        // 从Vercel Blob获取照片数据
        console.log('从Vercel Blob获取照片');
        const response = await fetch(photoUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        photoBuffer = await response.arrayBuffer();
      }
      
      const headers = new Headers();
      
      // 设置内容类型
      headers.set('Content-Type', 'image/jpeg');
      headers.set('Content-Length', photoBuffer.byteLength.toString());
      
      // 根据设备类型设置不同的下载行为
      if (isMobile) {
        if (isAndroid) {
          // Android设备：触发直接下载
          headers.set('Content-Disposition', `attachment; filename="party-photo-${Date.now()}.jpg"`);
          headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          console.log('Android设备 - 触发下载');
        } else {
          // iOS设备：直接显示图片，用户可以长按保存
          headers.set('Content-Disposition', 'inline');
          headers.set('Cache-Control', 'public, max-age=3600');
          console.log('iOS设备 - 显示图片');
        }
      } else {
        // 桌面设备：触发下载
        headers.set('Content-Disposition', `attachment; filename="party-photo-${Date.now()}.jpg"`);
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        console.log('桌面设备 - 触发下载');
      }
      
      return new NextResponse(photoBuffer, { headers });
      
    } catch (fetchError) {
      console.error('Error fetching photo:', fetchError);
      return NextResponse.json(
        { error: `写真の取得に失敗しました: ${fetchError.message}` },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error in download endpoint:', error);
    return NextResponse.json(
      { error: `写真のダウンロードに失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}
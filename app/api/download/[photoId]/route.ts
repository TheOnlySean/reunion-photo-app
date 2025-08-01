import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const photoId = params.photoId;
    
    // 从数据库获取照片URL (这里需要根据实际数据库结构调整)
    // 暂时使用简单的方式：photoId就是完整的blob URL
    const photoUrl = decodeURIComponent(photoId);
    
    // 获取User-Agent来检测设备类型
    const userAgent = request.headers.get('user-agent') || '';
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    try {
      // 从Vercel Blob获取照片数据
      const response = await fetch(photoUrl);
      if (!response.ok) {
        throw new Error('Photo not found');
      }
      
      const photoBuffer = await response.arrayBuffer();
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
        } else {
          // iOS设备：直接显示图片，用户可以长按保存
          headers.set('Content-Disposition', 'inline');
          headers.set('Cache-Control', 'public, max-age=3600');
        }
      } else {
        // 桌面设备：触发下载
        headers.set('Content-Disposition', `attachment; filename="party-photo-${Date.now()}.jpg"`);
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      
      return new NextResponse(photoBuffer, { headers });
      
    } catch (fetchError) {
      console.error('Error fetching photo:', fetchError);
      return NextResponse.json(
        { error: '写真の取得に失敗しました' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error in download endpoint:', error);
    return NextResponse.json(
      { error: '写真のダウンロードに失敗しました' },
      { status: 500 }
    );
  }
}
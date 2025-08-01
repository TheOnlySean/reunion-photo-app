import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const hasToken = Boolean(blobToken);
    const tokenPreview = blobToken ? `${blobToken.substring(0, 20)}...` : 'None';
    
    return NextResponse.json({
      success: true,
      config: {
        BLOB_READ_WRITE_TOKEN: {
          configured: hasToken,
          preview: tokenPreview,
          length: blobToken?.length || 0
        },
        deployment: {
          time: new Date().toISOString(),
          vercel_url: process.env.VERCEL_URL || 'localhost',
          node_env: process.env.NODE_ENV || 'development'
        }
      },
      message: hasToken 
        ? 'Vercel Blob配置正确 ✅' 
        : 'BLOB_READ_WRITE_TOKEN未配置 ❌'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `配置检查失败: ${error.message}`
    }, { status: 500 });
  }
}
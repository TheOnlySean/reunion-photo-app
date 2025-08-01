import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'セッションIDが必要です' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // ダウンロード数を増加
      const result = await client.query(
        'UPDATE photo_sessions SET download_count = download_count + 1, updated_at = NOW() WHERE id = $1 RETURNING download_count',
        [sessionId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'セッションが見つかりません' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        downloadCount: result.rows[0].download_count,
        message: 'ダウンロード数が更新されました'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return NextResponse.json(
      { success: false, error: 'ダウンロード数の更新に失敗しました' },
      { status: 500 }
    );
  }
}
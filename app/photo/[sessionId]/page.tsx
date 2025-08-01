'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DownloadPage } from '@/components/DownloadPage';

interface SessionInfo {
  id: string;
  session_name: string;
  selected_photo_url: string;
  created_at: string;
  download_count: number;
}

export default function PhotoDownloadPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchSessionInfo();
  }, [sessionId]);

  const fetchSessionInfo = async () => {
    try {
      const response = await fetch(`/api/sessions?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setSessionInfo(data.session);
      } else {
        setError(data.error || 'セッションが見つかりません');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setError('セッション情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const incrementDownloadCount = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}/download`, {
        method: 'POST'
      });
      
      // ダウンロード数を更新
      if (sessionInfo) {
        setSessionInfo({
          ...sessionInfo,
          download_count: sessionInfo.download_count + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">写真を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionInfo?.selected_photo_url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-white mb-4">写真が見つかりません</h2>
          <p className="text-white/80 text-lg mb-6">
            {error || '写真がまだ選択されていないか、URLが無効です'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <DownloadPage
      sessionInfo={sessionInfo}
      onDownload={incrementDownloadCount}
    />
  );
}
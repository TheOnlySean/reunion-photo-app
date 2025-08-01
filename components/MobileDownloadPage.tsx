'use client';

import { useEffect, useState } from 'react';
import { Download, Share, Heart, ArrowLeft } from 'lucide-react';

interface MobileDownloadPageProps {
  photoUrl: string;
  sessionInfo?: {
    session_name: string;
    created_at: string;
    download_count: number;
  };
}

export function MobileDownloadPage({ photoUrl, sessionInfo }: MobileDownloadPageProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // 方法1：尝试使用Web Share API (iOS Safari支持)
      if ('share' in navigator && navigator.canShare) {
        try {
          const response = await fetch(photoUrl);
          const blob = await response.blob();
          const file = new File([blob], `party-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'パーティー写真',
              text: '素敵な思い出の写真です'
            });
            return;
          }
        } catch (shareError) {
          console.log('Web Share API failed, trying fallback');
        }
      }
      
      // 方法2：创建下载链接
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `party-photo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      // 如果下载失败，显示长按指引
      setShowInstructions(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLineShare = async () => {
    try {
      // Line分享URL scheme
      const text = 'パーティーの素敵な写真をシェアします！';
      const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text + ' ' + photoUrl)}`;
      window.open(lineUrl, '_blank');
    } catch (error) {
      console.error('Line share failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            📸 写真を保存
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            {sessionInfo && `${formatDate(sessionInfo.created_at)} のパーティー`}
          </p>
        </div>

        {/* Photo Display */}
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white/5">
              <img
                src={photoUrl}
                alt="パーティー写真"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-sm mx-auto space-y-4">
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-xl font-semibold text-lg transition-colors duration-200 shadow-lg"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                <span>写真を保存</span>
              </>
            )}
          </button>

          {/* Line Share Button */}
          <button
            onClick={handleLineShare}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-green-400 hover:bg-green-500 text-white rounded-xl font-semibold text-lg transition-colors duration-200 shadow-lg"
          >
            <Share className="w-6 h-6" />
            <span>LINEで共有</span>
          </button>
        </div>

        {/* Instructions for iOS users */}
        {showInstructions && (
          <div className="max-w-sm mx-auto mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <h3 className="text-white text-lg font-semibold mb-3 text-center">
                📱 保存方法
              </h3>
              <div className="space-y-3 text-white/90 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <p>上の写真を長押し</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <p>「写真に追加」または「画像を保存」を選択</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <p>写真がアルバムに保存されます</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - 移上来更紧凑 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center space-x-2 text-white/60">
            <Heart className="w-4 h-4" />
            <span className="text-sm">素敵なパーティーにご参加いただき、ありがとうございました</span>
            <Heart className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
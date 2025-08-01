'use client';

import { useEffect, useState } from 'react';
import { Download, Share2, Heart, Camera } from 'lucide-react';
import { detectDeviceType, canAutoDownload } from '@/lib/utils';

interface DownloadPageProps {
  photoUrl: string;
  sessionInfo?: {
    session_name: string;
    created_at: string;
    download_count: number;
  };
}

export function DownloadPage({ photoUrl, sessionInfo }: DownloadPageProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const device = detectDeviceType();
    setDeviceType(device);
    
    // Auto-download for supported devices
    if (canAutoDownload()) {
      setTimeout(() => {
        handleDownload();
      }, 1500);
    } else {
      // Show instructions for iOS
      setShowInstructions(true);
    }

    // Increment download count
    incrementDownloadCount();
  }, []);

  const incrementDownloadCount = async () => {
    try {
      // Extract session ID from current URL
      const sessionId = window.location.pathname.split('/').pop();
      if (sessionId) {
        await fetch(`/api/sessions?sessionId=${sessionId}`, {
          method: 'PUT',
        });
      }
    } catch (error) {
      console.error('Failed to increment download count:', error);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      if (deviceType === 'android' || deviceType === 'desktop') {
        // Direct download for Android/Desktop
        const link = document.createElement('a');
        link.href = photoUrl;
        link.download = `reunion-photo-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For iOS, just open the image
        window.open(photoUrl, '_blank');
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  const handleIOSShare = async () => {
    if ('share' in navigator) {
      try {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'reunion-photo.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          files: [file],
          title: '聚会照片',
          text: '来自聚会的美好回忆'
        });
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to showing long-press instructions
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🎉 素敵な思い出を永遠に
          </h1>
          <p className="text-white/80 text-lg">
            {sessionInfo && `${formatDate(sessionInfo.created_at)} のパーティーの思い出`}
          </p>
        </div>

        {/* Main Photo */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white/5">
              <img
                src={photoUrl}
                alt="聚会照片"
                className="w-full h-full object-cover"
                onContextMenu={(e) => deviceType === 'ios' ? undefined : e.preventDefault()}
              />
            </div>
            
            {/* Photo Info */}
            <div className="mt-4 text-center text-white/80">
              <p className="text-lg">
                {sessionInfo && `${sessionInfo.download_count} 人がこの写真を取得しました`}
              </p>
            </div>
          </div>
        </div>

        {/* Device-specific Content */}
        <div className="max-w-lg mx-auto">
          
          {/* Android/Desktop - Auto Download */}
          {(deviceType === 'android' || deviceType === 'desktop') && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              {isDownloading ? (
                <div className="space-y-4">
                  <div className="animate-spin mx-auto rounded-full h-12 w-12 border-b-2 border-white"></div>
                  <p className="text-white text-lg font-medium">
                    正在保存照片到您的设备...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                                      <p className="text-white text-xl font-medium mb-2">
                    写真のダウンロード完了！
                  </p>
                  <p className="text-white/80">
                    写真がダウンロードフォルダに保存されました
                  </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    再ダウンロード
                  </button>
                </div>
              )}
            </div>
          )}

          {/* iOS - Manual Save Instructions */}
          {deviceType === 'ios' && (
            <div className="space-y-4">
              
              {/* Share Button (iOS 13+) */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-4">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">
                  アルバムに一括保存
                </h3>
                <p className="text-white/80 mb-4">
                  iOS共有機能を使って写真を直接保存
                </p>
                <button
                  onClick={handleIOSShare}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 w-full"
                >
                  アルバムに保存
                </button>
              </div>

              {/* Manual Instructions */}
              {showInstructions && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-white text-xl font-semibold mb-4 text-center">
                    📱 手動保存方法
                  </h3>
                  <div className="space-y-4 text-white/90">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <p className="text-lg">上の写真を長押し</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <p className="text-lg">「写真に追加」または「画像を保存」を選択</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <p className="text-lg">写真がアルバムに保存されます</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center space-x-2 text-white/60">
            <Heart className="w-5 h-5" />
            <span className="text-lg">素敵なパーティーにご参加いただき、ありがとうございました</span>
            <Heart className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
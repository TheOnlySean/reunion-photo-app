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
            🎉 美好时光，永久珍藏
          </h1>
          <p className="text-white/80 text-lg">
            {sessionInfo && `来自 ${formatDate(sessionInfo.created_at)} 的聚会回忆`}
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
              <p className="text-sm">
                {sessionInfo && `已有 ${sessionInfo.download_count} 人获取了这张照片`}
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
                    <p className="text-white text-lg font-medium mb-2">
                      照片下载完成！
                    </p>
                    <p className="text-white/80 text-sm">
                      照片已保存到您的下载文件夹
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    重新下载
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
                <h3 className="text-white text-lg font-semibold mb-2">
                  一键保存到相册
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  使用 iOS 分享功能直接保存照片
                </p>
                <button
                  onClick={handleIOSShare}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 w-full"
                >
                  保存到相册
                </button>
              </div>

              {/* Manual Instructions */}
              {showInstructions && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-4 text-center">
                    📱 手动保存方法
                  </h3>
                  <div className="space-y-3 text-white/90">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <p className="text-sm">长按上方照片</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <p className="text-sm">选择"存储到照片"或"保存图片"</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <p className="text-sm">照片将保存到您的相册中</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center space-x-2 text-white/60 text-sm">
            <Heart className="w-4 h-4" />
            <span>感谢您参与这次美好的聚会</span>
            <Heart className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
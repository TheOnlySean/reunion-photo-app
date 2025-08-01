'use client';

import { useEffect, useState } from 'react';
import { Download, Share, Heart, Sparkles, Camera, Gift } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
      
      {/* Decorative Elements - 日本风格装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 樱花装饰 */}
        <div className="absolute top-10 left-4 text-pink-300/30 animate-pulse">
          <div className="text-4xl">🌸</div>
        </div>
        <div className="absolute top-32 right-8 text-pink-200/40 animate-bounce" style={{animationDelay: '1s'}}>
          <div className="text-3xl">🌸</div>
        </div>
        <div className="absolute bottom-40 left-8 text-purple-200/30 animate-pulse" style={{animationDelay: '2s'}}>
          <div className="text-2xl">✨</div>
        </div>
        <div className="absolute bottom-20 right-4 text-blue-200/40 animate-bounce" style={{animationDelay: '0.5s'}}>
          <div className="text-3xl">🎈</div>
        </div>
        
        {/* 柔和的圆形背景装饰 */}
        <div className="absolute top-1/4 -left-20 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        
        {/* Header - 日本APP风格 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
            フォト保存
          </h1>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <p className="text-base md:text-lg">
              {sessionInfo ? `${formatDate(sessionInfo.created_at)} の素敵な思い出` : '素敵な思い出'}
            </p>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        {/* Photo Display - 日本APP卡片风格 */}
        <div className="max-w-sm mx-auto mb-8">
          <div className="bg-white rounded-3xl p-2 shadow-2xl shadow-pink-200/50 hover:shadow-3xl hover:shadow-pink-300/60 transition-all duration-500 hover:-translate-y-1">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 relative group">
              <img
                src={photoUrl}
                alt="パーティー写真"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* 照片边框装饰 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <Heart className="w-4 h-4 text-pink-500" />
              </div>
            </div>
            
            {/* 照片底部装饰条 */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">あなたの素敵な瞬間</span>
              </div>
              <div className="text-2xl">💕</div>
            </div>
          </div>
        </div>

        {/* Action Buttons - 日本APP风格按钮 */}
        <div className="max-w-sm mx-auto space-y-4">
          
          {/* Download Button - 主按钮 */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-pink-300/50 hover:shadow-2xl hover:shadow-pink-400/60 hover:-translate-y-1 disabled:hover:translate-y-0 disabled:hover:shadow-xl"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                <span>保存中...</span>
                <div className="text-xl">✨</div>
              </>
            ) : (
              <>
                <Download className="w-6 h-6 group-hover:animate-bounce" />
                <span>フォトを保存</span>
                <div className="text-xl group-hover:animate-pulse">🎁</div>
              </>
            )}
          </button>

          {/* Line Share Button - 次要按钮 */}
          <button
            onClick={handleLineShare}
            className="group w-full flex items-center justify-center space-x-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 border-2 border-green-200 hover:border-green-300 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Share className="w-5 h-5 text-white" />
            </div>
            <span className="text-green-700">LINEで共有</span>
            <div className="text-xl group-hover:animate-bounce">💚</div>
          </button>
        </div>

        {/* Instructions for iOS users - 可爱的日本风格说明 */}
        {showInstructions && (
          <div className="max-w-sm mx-auto mt-8 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-blue-200/30 border border-blue-100">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mb-3">
                  <div className="text-2xl">📱</div>
                </div>
                <h3 className="text-gray-800 text-xl font-bold">
                  手動保存の手順
                </h3>
                <p className="text-gray-600 text-sm mt-1">簡単3ステップ ✨</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-pink-50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">上の写真を長押し</p>
                    <p className="text-gray-600 text-sm">指で写真を長めにタッチ</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-3 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">「写真に追加」を選択</p>
                    <p className="text-gray-600 text-sm">メニューから保存オプションを選ぶ</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">保存完了！</p>
                    <p className="text-gray-600 text-sm">カメラロールに保存されました 🎉</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - 日本风格感谢信息 */}
        <div className="mt-12 text-center">
          <div className="max-w-xs mx-auto bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="text-2xl">🌸</div>
              <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
              <div className="text-2xl">🌸</div>
            </div>
            <p className="text-gray-700 text-sm font-medium leading-relaxed">
              素敵なパーティーにご参加いただき<br />
              <span className="text-pink-600 font-bold">本当にありがとうございました</span>
            </p>
            <div className="flex items-center justify-center space-x-1 mt-3">
              <div className="text-lg">🎉</div>
              <div className="text-lg">💝</div>
              <div className="text-lg">✨</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
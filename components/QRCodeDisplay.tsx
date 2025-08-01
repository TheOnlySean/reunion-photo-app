'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Share2, Download, RotateCcw, Users } from 'lucide-react';
import { detectDeviceType } from '@/lib/utils';

interface QRCodeDisplayProps {
  shareUrl: string;
  selectedPhotoUrl: string;
  onStartOver: () => void;
  downloadCount?: number;
}

export function QRCodeDisplay({ 
  shareUrl, 
  selectedPhotoUrl, 
  onStartOver,
  downloadCount = 0 
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    setDeviceType(detectDeviceType());
    generateQRCode();
  }, [shareUrl]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setQrCodeGenerated(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You might want to add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const shareViaWebAPI = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: '聚会照片分享',
          text: '来自聚会的美好回忆，快来获取照片吧！',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy URL
        copyShareUrl();
      }
    } else {
      copyShareUrl();
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            🎉 写真が完成しました！
          </h2>
          <p className="text-xl text-gray-600">
            QRコードをシェアして<br/>
            みんなで素敵な思い出を共有しましょう
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Selected Photo Preview */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                選択した写真
              </h3>
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedPhotoUrl}
                  alt="選択した写真"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Download Stats */}
              <div className="flex items-center justify-center mt-4 text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span className="text-lg">{downloadCount} 人が写真を取得しました</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              
              {/* QR Code */}
              <div className="mb-6">
                <div className="inline-block p-4 bg-white rounded-xl shadow-inner">
                  <canvas
                    ref={canvasRef}
                    className={qrCodeGenerated ? 'block' : 'hidden'}
                  />
                  {!qrCodeGenerated && (
                    <div className="w-72 h-72 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  📱 QRコードで写真を取得
                </h3>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 text-lg">Android端末</p>
                      <p className="text-green-700">QRコード読み取り後、自動でダウンロードします</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800 text-lg">iPhone端末</p>
                      <p className="text-blue-700">QRコード読み取り後、写真を長押しして保存するか、共有機能をご利用ください</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={shareViaWebAPI}
                  className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  <Share2 className="w-6 h-6" />
                  <span>リンクを共有</span>
                </button>
                
                <button
                  onClick={copyShareUrl}
                  className="flex items-center justify-center space-x-2 px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  <Download className="w-6 h-6" />
                  <span>リンクをコピー</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onStartOver}
            className="flex items-center space-x-2 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-lg transition-colors duration-200"
          >
            <RotateCcw className="w-6 h-6" />
            <span>新しい写真を撮影</span>
          </button>
        </div>

        {/* Share URL Display */}
        <div className="mt-6 text-center">
          <div className="bg-gray-100 rounded-lg p-4 inline-block max-w-full">
            <p className="text-gray-600 mb-2">共有リンク:</p>
            <code className="text-sm text-gray-800 break-all">
              {shareUrl}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
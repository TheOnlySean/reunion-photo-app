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
            🎉 照片已准备好！
          </h2>
          <p className="text-lg text-gray-600">
            分享二维码，让在场的每个人都能获得这张美好的回忆
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Selected Photo Preview */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                选中的照片
              </h3>
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedPhotoUrl}
                  alt="选中的照片"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Download Stats */}
              <div className="flex items-center justify-center mt-4 text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span>已有 {downloadCount} 人获取了照片</span>
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
                  📱 扫码获取照片
                </h3>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Android 用户</p>
                      <p className="text-sm text-green-700">扫码后自动下载照片</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800">iPhone 用户</p>
                      <p className="text-sm text-blue-700">扫码后长按图片保存，或使用分享功能</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={shareViaWebAPI}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-200"
                >
                  <Share2 className="w-5 h-5" />
                  <span>分享链接</span>
                </button>
                
                <button
                  onClick={copyShareUrl}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
                >
                  <Download className="w-5 h-5" />
                  <span>复制链接</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onStartOver}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            <RotateCcw className="w-5 h-5" />
            <span>拍摄新照片</span>
          </button>
        </div>

        {/* Share URL Display */}
        <div className="mt-6 text-center">
          <div className="bg-gray-100 rounded-lg p-4 inline-block max-w-full">
            <p className="text-sm text-gray-600 mb-2">分享链接:</p>
            <code className="text-sm text-gray-800 break-all">
              {shareUrl}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
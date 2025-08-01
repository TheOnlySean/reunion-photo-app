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
        width: 400, // 增大QR码分辨率
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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - 紧凑设计 */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            🎉 写真が完成しました！
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            QRコードをスキャンして写真を保存
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          
          {/* Selected Photo Preview */}
          <div className="order-2 lg:order-1 flex flex-col">
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 text-center">
                選択した写真
              </h3>
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={selectedPhotoUrl}
                  alt="選択した写真"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Download Stats */}
              <div className="flex items-center justify-center mt-3 md:mt-4 text-gray-600">
                <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="text-sm md:text-base">{downloadCount} 人が写真を取得しました</span>
              </div>
            </div>
            
            {/* New Photo Button - 移到预览下方 */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={onStartOver}
                className="flex items-center space-x-2 px-6 md:px-8 py-3 md:py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-base md:text-lg transition-colors duration-200"
              >
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                <span>新しいフォトを撮影</span>
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 text-center">
              
              {/* QR Code - 三端响应式尺寸 */}
              <div className="mb-6 md:mb-8">
                <div className="inline-block p-3 md:p-4 lg:p-6 bg-white rounded-xl shadow-inner">
                  <canvas
                    ref={canvasRef}
                    className={qrCodeGenerated ? 'block w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80' : 'hidden'}
                  />
                  {!qrCodeGenerated && (
                    <div className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 lg:h-16 lg:w-16 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* 简化说明 */}
              <div className="mb-6 md:mb-8">
                              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
                📱 スキャンでフォト保存
              </h3>
              <p className="text-gray-600 text-base md:text-lg">
                QRコードをスキャンすると<br/>
                フォトダウンロード画面が開きます
              </p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
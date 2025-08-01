'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/components/Camera';
import { PhotoPreview } from '@/components/PhotoPreview';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { generateId } from '@/lib/utils';

type AppStep = 'home' | 'camera' | 'preview' | 'qrcode';

interface CapturedPhoto {
  dataUrl: string;
  blob: Blob;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [sessionId, setSessionId] = useState<string>('');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionName: `パーティー-${new Date().toLocaleDateString('ja-JP')}`
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
      } else {
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setError('初期化に失敗しました。ページを更新してください。');
    }
  };

  const handleStartCamera = () => {
    setCurrentStep('camera');
  };

  // ホーム画面
  if (currentStep === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
        <div className="safe-top bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              📸 パーティー写真アシスタント
            </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="text-center mb-12 max-w-md">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl">📷</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              みんなで記念撮影
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              タップして撮影開始<br/>
              5秒のカウントダウン後<br/>
              自動で3枚連続撮影します
            </p>
          </div>

          <div className="mb-8">
            <button
              onClick={handleStartCamera}  
              disabled={!sessionId}
              className="group relative w-48 h-48 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              <div className="relative flex flex-col items-center justify-center text-white">
                <span className="text-6xl mb-2">📸</span>
                <span className="text-xl font-bold">撮影開始</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}

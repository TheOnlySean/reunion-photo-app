'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/components/Camera';
import { PhotoPreview } from '@/components/PhotoPreview';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';

type AppStep = 'home' | 'camera' | 'preview' | 'qrcode';

interface CapturedPhoto {
  dataUrl: string;
  blob: Blob;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [sessionId, setSessionId] = useState<string>('');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionName: `パーティー-${new Date().toLocaleDateString('ja-JP')}` }),
        });
        const data = await res.json();
        if (data.success) setSessionId(data.sessionId);
        else throw new Error(data.error || 'Failed to create session');
      } catch (err) {
        console.error(err); setError('初期化に失敗しました。ページを更新してください。');
      }
    })();
  }, []);

  const handleStartCamera = () => setCurrentStep('camera');
  const handleStartOver = () => { setCurrentStep("home"); setCapturedPhotos([]); setSelectedPhotoUrl(""); setShareUrl(""); setIsUploading(false); setError(""); };

  const handlePhotoCapture = (photos: { dataUrl: string; blob: Blob }[]) => {
    setCapturedPhotos(photos); setCurrentStep('preview');
  };

  const handlePhotoSelect = async (index: number) => {
    if (!sessionId) return;
    try {
      setIsUploading(true);
      const form = new FormData(); 
      form.append('sessionId', sessionId);
      capturedPhotos.forEach((p, i) => form.append(`photo${i}`, new File([p.blob], `photo${i}.jpg`, { type: 'image/jpeg' })));
      const upRes = await fetch('/api/upload', { method: 'POST', body: form }); 
      const up = await upRes.json();
      if (!up.success) throw new Error(up.error || 'Upload failed');
      const selectedUrl = up.photos[index];
      const selRes = await fetch('/api/photos', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ sessionId, selectedPhotoUrl: selectedUrl }) 
      });
      const sel = await selRes.json();
      if (!sel.success) throw new Error(sel.error || 'Photo select failed');
      setShareUrl(sel.shareUrl || selectedUrl); 
      setSelectedPhotoUrl(selectedUrl); 
      setCurrentStep('qrcode');
    } catch (e) { console.error(e); setError('写真の処理に失敗しました'); }
    finally { setIsUploading(false); }
  };

  const handleCameraError = (msg: string) => setError(msg);

  if (error && (currentStep === 'home' || currentStep === 'camera'))
    return <div className="h-screen flex items-center justify-center p-6"><p className="text-red-600 text-xl">{error}</p></div>;

  if (currentStep === 'home')
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
          <div className="absolute bottom-32 left-20 w-40 h-40 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-20 right-10 w-28 h-28 bg-indigo-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        {/* 横版布局（电脑/iPad）- One Page设计 */}
        <div className="relative z-10 h-full hidden md:grid md:grid-cols-2 md:gap-12 md:p-8 md:items-center md:max-w-6xl md:mx-auto">
          {/* 左侧：标题和按钮 */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center animate-fade-in">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                  <span className="text-4xl">📸</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                写真撮影
              </h1>
              <h2 className="text-3xl font-bold text-white mb-4">
                みんなで記念撮影
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                タップして撮影開始<br/>
                5秒のカウントダウン後<br/>
                1秒間隔で3枚撮影します
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <button 
                onClick={handleStartCamera} 
                disabled={!sessionId}
                className="relative w-72 h-72 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group"
              >
                <div className="absolute inset-4 bg-white/10 rounded-full animate-ping group-hover:animate-none"></div>
                <div className="relative flex flex-col items-center text-white">
                  <span className="text-8xl mb-4 animate-bounce">📸</span>
                  <span className="text-2xl font-bold">撮影開始</span>
                </div>
              </button>
            </div>
          </div>

          {/* 右侧：使用说明 */}
          <div className="flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-lg animate-slide-up">
              <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <span className="mr-3">📋</span>
                ご利用方法
              </h3>
              <div className="space-y-4">
                {[
                  { icon: "1️⃣", text: "撮影ボタンをタップ" },
                  { icon: "2️⃣", text: "5秒間でポーズを決める" },
                  { icon: "3️⃣", text: "1秒間隔で3枚撮影" },
                  { icon: "4️⃣", text: "お気に入りの1枚を選択" },
                  { icon: "5️⃣", text: "QRコードで写真をシェア" }
                ].map((step, index) => (
                  <div key={index} className="flex items-center space-x-4 text-white/90 transform transition-all duration-300 hover:scale-105" style={{animationDelay: `${index * 100}ms`}}>
                    <span className="text-2xl">{step.icon}</span>
                    <span className="text-lg">{step.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-white/60 text-sm">
                  みんなの笑顔を素敵な思い出に ✨
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 竖版布局（手机）*/}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:hidden">
          <div className="text-center mb-8 animate-fade-in">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                <span className="text-5xl">📸</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              写真撮影
            </h1>
            <h2 className="text-2xl font-bold text-white mb-3">
              みんなで記念撮影
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              タップして撮影開始<br/>
              5秒のカウントダウン後<br/>
              1秒間隔で3枚撮影します
            </p>
          </div>

          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <button 
              onClick={handleStartCamera} 
              disabled={!sessionId}
              className="relative w-72 h-72 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group"
            >
              <div className="absolute inset-4 bg-white/10 rounded-full animate-ping group-hover:animate-none"></div>
              <div className="relative flex flex-col items-center text-white">
                <span className="text-8xl mb-4 animate-bounce">📸</span>
                <span className="text-2xl font-bold">撮影開始</span>
              </div>
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center">
              <span className="mr-2">📋</span>
              ご利用方法
            </h3>
            <div className="space-y-3">
              {[
                { icon: "1️⃣", text: "撮影ボタンをタップ" },
                { icon: "2️⃣", text: "5秒間でポーズを決める" },
                { icon: "3️⃣", text: "1秒間隔で3枚撮影" },
                { icon: "4️⃣", text: "お気に入りの1枚を選択" },
                { icon: "5️⃣", text: "QRコードで写真をシェア" }
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-3 text-white/90 transform transition-all duration-300 hover:scale-105" style={{animationDelay: `${index * 100}ms`}}>
                  <span className="text-lg">{step.icon}</span>
                  <span className="text-sm">{step.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-white/60 text-xs">
                みんなの笑顔を素敵な思い出に ✨
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="fixed top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-lg">{error}</span>
              <button onClick={() => setError('')} className="text-white hover:text-gray-200 ml-4 text-xl">
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );

  if (currentStep === 'camera')
    return <Camera onPhotoCapture={handlePhotoCapture} onError={handleCameraError} onBack={handleStartOver} />;

  if (currentStep === 'preview')
    return <PhotoPreview photos={capturedPhotos} onPhotoSelect={handlePhotoSelect} onRetake={() => setCurrentStep('camera')} isUploading={isUploading} />;

  if (currentStep === 'qrcode')
    return <QRCodeDisplay shareUrl={shareUrl} selectedPhotoUrl={selectedPhotoUrl} onStartOver={handleStartOver} />;

  return <div className="h-screen flex items-center justify-center">Loading...</div>;
}

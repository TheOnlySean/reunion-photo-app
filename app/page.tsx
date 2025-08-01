'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/components/Camera';
import { PhotoPreview } from '@/components/PhotoPreview';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { LoginForm } from '@/components/LoginForm';

type AppStep = 'login' | 'home' | 'camera' | 'preview' | 'qrcode';

interface CapturedPhoto {
  dataUrl: string;
  blob: Blob;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('login');
  const [sessionId, setSessionId] = useState<string>('');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [authToken, setAuthToken] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('');

  useEffect(() => {
    // Check for existing auth token on page load
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedDeviceName = localStorage.getItem('device_name');
      
      if (storedToken && storedDeviceName) {
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: storedToken }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            setAuthToken(storedToken);
            setDeviceName(storedDeviceName);
            setCurrentStep('home');
            
            // Initialize session after auth success
            await initializeSession();
          } else {
            // Invalid token, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('device_name');
            setCurrentStep('login');
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          setCurrentStep('login');
        }
      } else {
        setCurrentStep('login');
      }
    };

    checkAuth();
  }, []);

  const initializeSession = async () => {
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
      console.error(err); 
      setError('初期化に失敗しました。ページを更新してください。');
    }
  };

  const handleLoginSuccess = (token: string, deviceName: string) => {
    setAuthToken(token);
    setDeviceName(deviceName);
    setCurrentStep('home');
    initializeSession();
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('device_name');
    setAuthToken('');
    setDeviceName('');
    setCurrentStep('login');
    setSessionId('');
    setCapturedPhotos([]);
    setSelectedPhotoUrl('');
    setShareUrl('');
    setError('');
  };

  const handleStartCamera = () => setCurrentStep('camera');
  const handleStartOver = () => { 
    console.log('重新开始拍照');
    setCurrentStep("home"); 
    setCapturedPhotos([]); 
    setSelectedPhotoUrl(""); 
    setShareUrl(""); 
    setIsUploading(false); 
    setError(""); 
  };

  const handleRetake = () => {
    console.log('返回拍照界面');
    setCurrentStep('camera');
    setError(''); // 清除错误信息
  };

  const handlePhotoCapture = (photos: { dataUrl: string; blob: Blob }[]) => {
    setCapturedPhotos(photos); setCurrentStep('preview');
  };

  const handlePhotoSelect = async (index: number) => {
    if (!sessionId) return;
    try {
      setIsUploading(true);
      setError(''); // 清除之前的错误
      
      console.log('开始上传照片...');
      const form = new FormData(); 
      form.append('sessionId', sessionId);
      capturedPhotos.forEach((p, i) => form.append(`photo${i}`, new File([p.blob], `photo${i}.jpg`, { type: 'image/jpeg' })));
      
      const upRes = await fetch('/api/upload', { method: 'POST', body: form }); 
      const up = await upRes.json();
      console.log('上传结果:', up);
      
      if (!up.success) {
        throw new Error(up.error || 'Vercel Blob上传失败。请检查BLOB_READ_WRITE_TOKEN环境变量是否配置正确。');
      }
      
      const selectedUrl = up.photos[index];
      if (!selectedUrl) {
        throw new Error('选择的照片URL为空');
      }
      
      console.log('生成QR码...');
      const selRes = await fetch('/api/photos', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ sessionId, selectedPhotoUrl: selectedUrl }) 
      });
      const sel = await selRes.json();
      console.log('QR码生成结果:', sel);
      
      if (!sel.success) {
        throw new Error(sel.error || 'QRコード生成に失敗しました');
      }
      
      setShareUrl(sel.shareUrl || selectedUrl); 
      setSelectedPhotoUrl(selectedUrl); 
      setCurrentStep('qrcode');
      console.log('処理完了！');
      
    } catch (e) { 
      console.error('写真処理エラー:', e); 
      setError(e instanceof Error ? e.message : '写真の処理に失敗しました'); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleCameraError = (msg: string) => setError(msg);

  if (error && (currentStep === 'home' || currentStep === 'camera'))
    return <div className="h-screen flex items-center justify-center p-6"><p className="text-red-600 text-xl">{error}</p></div>;

  if (currentStep === 'home')
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Logout Button */}
        {currentStep === 'home' && (
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <span>🔓</span>
              <span>ログアウト</span>
            </button>
          </div>
        )}

        {/* Device Info */}
        {currentStep === 'home' && deviceName && (
          <div className="absolute top-4 left-4 z-30">
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium max-w-[calc(100vw-8rem)]">
              <span className="mr-2">📱</span>
              <span className="truncate">{deviceName}</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
          <div className="absolute bottom-32 left-20 w-40 h-40 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-20 right-10 w-28 h-28 bg-indigo-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        {/* 桌面端横版布局 */}
        <div className="relative z-20 h-full hidden lg:grid lg:grid-cols-2 lg:gap-8 lg:p-6 lg:items-center lg:max-w-7xl lg:mx-auto">
          {/* 左侧：标题和按钮 */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="text-center animate-fade-in">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                  <span className="text-4xl">📸</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                フォト撮影
              </h1>
              <h2 className="text-3xl font-bold text-white mb-4">
                みんなで記念撮影
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                タップして撮影開始<br/>
                5秒カウント後<br/>
                1秒間隔で3枚撮影
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
                  { icon: "2️⃣", text: "5秒でポーズを決める" },
                  { icon: "3️⃣", text: "1秒間隔で3枚撮影" },
                  { icon: "4️⃣", text: "ベストショット選択" },
                  { icon: "5️⃣", text: "QRコードでシェア" }
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

        {/* iPad端竖向布局 - 一屏显示完整优化 */}
        <div className="relative z-20 h-screen hidden md:flex md:flex-col lg:hidden md:items-center md:justify-center md:p-4">
          {/* 顶部间距 - 为设备信息预留空间 */}
          <div className="h-20 flex-shrink-0"></div>
          
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-6">
            {/* 标题区域 - 紧凑 */}
            <div className="text-center animate-fade-in flex-shrink-0">
              <div className="mb-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                  <span className="text-2xl">📸</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                フォト撮影
              </h1>
              <h2 className="text-lg font-bold text-white mb-2">
                みんなで記念撮影
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                タップして撮影開始・5秒カウント後・1秒間隔で3枚撮影
              </p>
            </div>

            {/* iPad撮影按钮 - 中等尺寸 */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <button 
                onClick={handleStartCamera} 
                disabled={!sessionId}
                className="relative w-40 h-40 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group"
              >
                <div className="absolute inset-4 bg-white/10 rounded-full animate-ping group-hover:animate-none"></div>
                <div className="relative flex flex-col items-center text-white">
                  <span className="text-4xl mb-2 animate-bounce">📸</span>
                  <span className="text-lg font-bold">撮影開始</span>
                </div>
              </button>
            </div>

            {/* iPad使用说明 - 紧凑横向布局 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-4 w-full max-w-lg flex-shrink-0 animate-slide-up">
              <h3 className="text-base font-bold text-white mb-3 text-center flex items-center justify-center">
                <span className="mr-2">📋</span>
                ご利用方法
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "1️⃣", text: "撮影ボタンをタップ" },
                  { icon: "2️⃣", text: "5秒でポーズを決める" },
                  { icon: "3️⃣", text: "1秒間隔で3枚撮影" },
                  { icon: "4️⃣", text: "ベストショット選択" },
                  { icon: "5️⃣", text: "QRコードでシェア" }
                ].slice(0, 4).map((step, index) => (
                  <div key={index} className="flex items-center space-x-2 text-white/90">
                    <span className="text-sm">{step.icon}</span>
                    <span className="text-xs">{step.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/90 mt-2">
                <span className="text-sm">5️⃣</span>
                <span className="text-xs">QRコードでシェア</span>
              </div>
            </div>
          </div>
        </div>

        {/* 手机端竖版布局 - 优化显示完整 */}
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-between md:hidden pt-safe-top pb-safe-bottom px-4 py-6">
          {/* 顶部间距 - 为设备信息预留空间 */}
          <div className="h-16 flex-shrink-0"></div>
          
          {/* 顶部内容区 */}
          <div className="flex-shrink-0">
            <div className="text-center mb-6 animate-fade-in">
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                  <span className="text-4xl">📸</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                フォト撮影
              </h1>
              <h2 className="text-lg font-bold text-white mb-2">
                みんなで記念撮影
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                タップして撮影開始<br/>
                5秒カウント後<br/>
                1秒間隔で3枚撮影
              </p>
            </div>
          </div>

          {/* 中间按钮区 */}
          <div className="flex-shrink-0 mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <button 
              onClick={handleStartCamera} 
              disabled={!sessionId}
              className="relative w-44 h-44 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group"
            >
              <div className="absolute inset-4 bg-white/10 rounded-full animate-ping group-hover:animate-none"></div>
              <div className="relative flex flex-col items-center text-white">
                <span className="text-5xl mb-2 animate-bounce">📸</span>
                <span className="text-xl font-bold">撮影開始</span>
              </div>
            </button>
          </div>

          {/* 底部说明区 */}
          <div className="flex-shrink-0 w-full max-w-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-4 animate-slide-up">
              <h3 className="text-base font-bold text-white mb-3 text-center flex items-center justify-center">
                <span className="mr-2">📋</span>
                ご利用方法
              </h3>
              <div className="space-y-2">
                {[
                                  { icon: "1️⃣", text: "撮影ボタンをタップ" },
                { icon: "2️⃣", text: "5秒でポーズを決める" },
                { icon: "3️⃣", text: "1秒間隔で3枚撮影" },
                { icon: "4️⃣", text: "ベストショット選択" },
                { icon: "5️⃣", text: "QRコードでシェア" }
                ].map((step, index) => (
                  <div key={index} className="flex items-center space-x-2 text-white/90">
                    <span className="text-sm">{step.icon}</span>
                    <span className="text-xs">{step.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <p className="text-white/60 text-xs">
                  みんなの笑顔を素敵な思い出に ✨
                </p>
              </div>
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

  // Show login form if not authenticated
  if (currentStep === 'login') {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentStep === 'camera')
    return <Camera onPhotoCapture={handlePhotoCapture} onError={handleCameraError} onBack={handleStartOver} />;

  if (currentStep === 'preview')
    return (
      <div>
        <PhotoPreview photos={capturedPhotos} onPhotoSelect={handlePhotoSelect} onRetake={handleRetake} isUploading={isUploading} />
        {error && (
          <div className="fixed top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-base">{error}</span>
              <button onClick={() => setError('')} className="text-white hover:text-gray-200 ml-4 text-xl">
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );

  if (currentStep === 'qrcode')
    return <QRCodeDisplay shareUrl={shareUrl} selectedPhotoUrl={selectedPhotoUrl} onStartOver={handleStartOver} />;

  return <div className="h-screen flex items-center justify-center">Loading...</div>;
}

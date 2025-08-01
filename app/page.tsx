'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/components/Camera';
import { PhotoPreview } from '@/components/PhotoPreview';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';

// App steps
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

  /** 初期化: セッション作成 */
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

  /* --- 画面遷移ハンドラ --- */
  const handleStartCamera = () => setCurrentStep('camera');
  const handleStartOver = () => { window.location.reload(); };

  /* 撮影完了 → プレビュー */
  const handlePhotoCapture = (photos: { dataUrl: string; blob: Blob }[]) => {
    setCapturedPhotos(photos); setCurrentStep('preview');
  };

  /* 1枚選択 → アップロード & QR */
  const handlePhotoSelect = async (index: number) => {
    if (!sessionId) return;
    try {
      setIsUploading(true);
      const form = new FormData(); form.append('sessionId', sessionId);
      capturedPhotos.forEach((p, i) => form.append(`photo${i}`, new File([p.blob], `photo${i}.jpg`, { type: 'image/jpeg' })));
      const upRes = await fetch('/api/upload', { method: 'POST', body: form }); const up = await upRes.json();
      if (!up.success) throw new Error(up.error || 'Upload failed');
      const selectedUrl = up.photos[index];
      const selRes = await fetch('/api/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, selectedPhotoUrl: selectedUrl }) });
      const sel = await selRes.json();
      if (!sel.success) throw new Error(sel.error || 'Photo select failed');
      setShareUrl(sel.shareUrl || selectedUrl); setSelectedPhotoUrl(selectedUrl); setCurrentStep('qrcode');
    } catch (e) { console.error(e); setError('写真の処理に失敗しました'); }
    finally { setIsUploading(false); }
  };

  /* --- エラーハンドラ --- */
  const handleCameraError = (msg: string) => setError(msg);

  /* -------- 画面レンダリング -------- */
  if (error && (currentStep === 'home' || currentStep === 'camera'))
    return <div className="h-screen flex items-center justify-center p-6"><p className="text-red-600 text-xl">{error}</p></div>;

  if (currentStep === 'home')
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <h1 className="text-3xl font-bold mb-8">📸 パーティー写真アシスタント</h1>
        <button onClick={handleStartCamera} disabled={!sessionId} className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed">撮影開始</button>
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

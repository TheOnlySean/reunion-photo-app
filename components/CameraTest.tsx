'use client';

import { useState, useRef } from 'react';

export function CameraTest() {
  const [status, setStatus] = useState('未開始');
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const testCamera = async () => {
    setStatus('開始測試...');
    setError('');
    
    try {
      // 檢查瀏覽器支持
      if (!navigator.mediaDevices) {
        throw new Error('navigator.mediaDevices 不支持');
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia 不支持');
      }
      
      setStatus('請求攝像頭權限...');
      console.log('🎥 開始請求攝像頭權限');
      
      // 請求攝像頭權限
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      console.log('✅ 攝像頭權限獲得成功');
      setStatus('攝像頭權限獲得成功！');
      
      // 設置視頻流
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStatus('攝像頭正在運行');
      }
      
    } catch (err: any) {
      console.error('❌ 攝像頭錯誤:', err);
      setError(`錯誤: ${err.name || 'Unknown'} - ${err.message}`);
      setStatus('測試失敗');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">攝像頭測試</h2>
      
      <div className="mb-4">
        <p className="font-medium">狀態: <span className="text-blue-600">{status}</span></p>
        {error && (
          <p className="text-red-600 text-sm mt-2 break-words">{error}</p>
        )}
      </div>
      
      <video
        ref={videoRef}
        className="w-full h-48 bg-gray-200 rounded mb-4"
        playsInline
        muted
        style={{ transform: 'scaleX(-1)' }}
      />
      
      <button
        onClick={testCamera}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium"
      >
        🎥 測試攝像頭
      </button>
      
      <div className="mt-4 text-xs text-gray-600">
        <p>瀏覽器: {navigator.userAgent.split(' ')[0]}</p>
        <p>協議: {location.protocol}</p>
        <p>域名: {location.hostname}</p>
      </div>
    </div>
  );
}
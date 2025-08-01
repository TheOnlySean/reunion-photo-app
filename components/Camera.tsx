'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, X } from 'lucide-react';

interface CameraProps {
  onPhotoCapture: (photos: { dataUrl: string; blob: Blob }[]) => void;
  onError: (error: string) => void;
}

export function Camera({ onPhotoCapture, onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<{ dataUrl: string; blob: Blob }[]>([]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: { ideal: 'user' } // Front camera for selfies
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onError('无法访问相机，请确保已授权相机权限');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const capturePhoto = (): Promise<{ dataUrl: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) {
        reject(new Error('Video or canvas not available'));
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the image data
      canvas.toBlob((blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve({ dataUrl, blob });
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const startCountdownCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    setCapturedPhotos([]);

    // Countdown from 5 to 1
    for (let i = 5; i >= 1; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Capture 3 photos with small delays
    const photos: { dataUrl: string; blob: Blob }[] = [];
    
    for (let i = 0; i < 3; i++) {
      try {
        const photo = await capturePhoto();
        photos.push(photo);
        setCapturedPhotos(prev => [...prev, photo]);
        
        // Small delay between captures
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error('Error capturing photo:', error);
        onError('拍照失败，请重试');
        setIsCapturing(false);
        setCountdown(0);
        return;
      }
    }

    setIsCapturing(false);
    setCountdown(0);
    onPhotoCapture(photos);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />
      
      {/* Hidden Canvas for Capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Camera Controls Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        
        {/* Top Status */}
        <div className="flex justify-between items-center">
          <div className="text-white">
            {isStreaming ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">相机已就绪</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">启动相机中...</span>
              </div>
            )}
          </div>
        </div>

        {/* Countdown Display */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-full w-32 h-32 flex items-center justify-center">
              <span className="text-6xl font-bold text-white animate-pulse">
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* Capture Progress */}
        {isCapturing && countdown === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="text-white text-lg">
                  拍摄中 {capturedPhotos.length}/3
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="flex justify-center">
          <button
            onClick={startCountdownCapture}
            disabled={!isStreaming || isCapturing}
            className="bg-white hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-full p-6 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <CameraIcon className="w-8 h-8 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      {!isCapturing && countdown === 0 && (
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <p className="text-white text-lg bg-black/50 backdrop-blur-sm rounded-lg py-2 px-4 mx-6">
            点击拍照按钮开始 5 秒倒计时连拍
          </p>
        </div>
      )}
    </div>
  );
}// 跳过虚拟摄像头功能已添加

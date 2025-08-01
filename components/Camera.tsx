'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, X } from 'lucide-react';

interface CameraProps {
  onPhotoCapture: (photos: { dataUrl: string; blob: Blob }[]) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export function Camera({ onPhotoCapture, onError, onBack }: CameraProps) {
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
      console.log('🎥 カメラ起動を開始...');
      console.log('🖥️ User Agent:', navigator.userAgent);
      console.log('🌐 Protocol:', location.protocol);
      console.log('🔒 Secure Context:', window.isSecureContext);
      console.log('📍 Hostname:', location.hostname);
      console.log('🌍 Origin:', location.origin);
      
      // ブラウザ対応チェック
      if (!navigator.mediaDevices) {
        console.error('❌ navigator.mediaDevices が利用できません');
        throw new Error('お使いのブラウザはカメラ機能をサポートしていません。最新版のChrome、Firefox、Safari、またはEdgeをお試しください。');
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        console.error('❌ getUserMedia が利用できません');
        throw new Error('getUserMedia APIが利用できません。ブラウザを更新してください。');
      }

      // 权限检查
      console.log('🔐 権限状態を確認中...');
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('📹 カメラ権限状態:', permissionStatus.state);
        
        if (permissionStatus.state === 'denied') {
          console.error('❌ カメラ権限が拒否されています');
          throw new Error('カメラ権限が拒否されています。ブラウザの設定でカメラアクセスを許可してください。');
        }
      } catch (permError) {
        console.warn('⚠️ 権限確認エラー:', permError);
      }

      // 设备检查
      console.log('📹 可用設備を確認中...');
      let videoDevices = [];
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log(`📹 発見された映像デバイス: ${videoDevices.length}個`);
        
        videoDevices.forEach((device, index) => {
          console.log(`📹 デバイス ${index + 1}:`, {
            label: device.label || `Camera ${index + 1}`,
            deviceId: device.deviceId.substring(0, 12) + '...',
            groupId: device.groupId?.substring(0, 8) + '...'
          });
        });

        if (videoDevices.length === 0) {
          console.error('❌ ビデオデバイスが見つかりません');
          throw new Error('カメラデバイスが見つかりません。カメラが接続されているか確認してください。');
        }
      } catch (enumError) {
        console.error('❌ デバイス列挙エラー:', enumError);
        throw new Error('カメラデバイスの検出に失敗しました。');
      }

      console.log('📞 カメラストリーム取得を開始...');
      
      // 🚫 强化虚拟摄像头检测
      console.log('🔍 全摄像头设备详情:');
      videoDevices.forEach((device, index) => {
        console.log(`📹 设备 ${index + 1}: "${device.label}" (ID: ${device.deviceId.substring(0, 12)}...)`);
      });
      
      // 更全面的虚拟摄像头关键词检测
      const virtualKeywords = /virtual|obs|snap|droidcam|cam twist|logitech capture|xsplit|streamlabs|wirecast|manycam|zoom virtual|teams virtual/i;
      
      const realCam = videoDevices.find(d => {
        const isVirtual = virtualKeywords.test(d.label);
        console.log(`🔍 检测 "${d.label}": ${isVirtual ? '❌ 虚拟摄像头' : '✅ 实体摄像头'}`);
        return !isVirtual;
      });
      
      if (realCam) {
        console.log(`🎯 选中实体摄像头: "${realCam.label}"`);
      } else {
        console.log('⚠️ 未发现实体摄像头，将使用降级策略');
      }
      
      // Chrome最佳实践：优先实体摄像头
      const configs: { name: string; constraints: MediaStreamConstraints }[] = realCam ? [
        {
          name: `🎯 实体摄像头: ${realCam.label}`,
          constraints: {
            video: { deviceId: { exact: realCam.deviceId } },
            audio: false
          }
        },
      ] : [];

      configs.push(
        {
          name: 'HD前置カメラ（理想）',
          constraints: {
            video: { 
              facingMode: { ideal: 'user' },
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 }
            },
            audio: false
          }
        },
        {
          name: 'VGA前置カメラ（標準）',
          constraints: {
            video: { 
              facingMode: { ideal: 'user' },
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false
          }
        },
        {
          name: '前置カメラ（基本）',
          constraints: {
            video: { facingMode: 'user' },
            audio: false
          }
        },
        {
          name: '任意のカメラ（フォールバック）',
          constraints: {
            video: true,
            audio: false
          }
        }
      );

      let stream = null;
      let lastError = null;

      for (let i = 0; i < configs.length; i++) {
        try {
          console.log(`🔄 [${i + 1}/${configs.length}] ${configs[i].name}を試行中...`);
          console.log('📋 制約:', JSON.stringify(configs[i].constraints, null, 2));
          
          stream = await navigator.mediaDevices.getUserMedia(configs[i].constraints);
          console.log(`✅ [${i + 1}/${configs.length}] ${configs[i].name}で成功！`);
          console.log('📊 取得されたストリーム:', {
            id: stream.id,
            active: stream.active,
            tracks: stream.getVideoTracks().length
          });
          
          // 获取到的轨道信息
          const tracks = stream.getVideoTracks();
          if (tracks.length > 0) {
            const track = tracks[0];
            console.log('🎬 ビデオトラック情報:', {
              label: track.label,
              kind: track.kind,
              enabled: track.enabled,
              readyState: track.readyState,
              settings: track.getSettings()
            });
          }
          
          break;
        } catch (err: any) {
          console.error(`❌ [${i + 1}/${configs.length}] ${configs[i].name}失敗:`, {
            name: err.name,
            message: err.message,
            constraint: err.constraint || 'unknown'
          });
          lastError = err;
          continue;
        }
      }

      if (!stream) {
        console.error('💥 全ての設定で失敗:', lastError);
        throw lastError || new Error('すべてのカメラ設定で失敗しました。');
      }

      console.log('✅ カメラストリーム取得成功！');
      console.log('Stream:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      
      if (videoRef.current) {
        console.log('🎬 ビデオ要素に流を設定中...');
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
          console.log('▶️ ビデオ再生開始');
          setIsStreaming(true);
        } catch (playError) {
          console.error('ビデオ再生エラー:', playError);
          // 再生エラーでも一度再試行
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play().then(() => {
                console.log('▶️ ビデオ再生開始（再試行成功）');
                setIsStreaming(true);
              });
            }
          }, 1000);
        }
      } else {
        console.error('❌ Video reference が利用できません');
        throw new Error('ビデオ要素が見つかりません');
      }
    } catch (error) {
      console.error('❌ カメラアクセスエラー:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      let errorMessage = `カメラエラー: ${error.message}`;
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'カメラの許可が拒否されました。ブラウザの設定を確认してください。';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'カメラが見つかりません。カメラが接続されているか確認してください。';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'お使いのブラウザまたはデバイスはカメラ機能をサポートしていません。';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'カメラが他のアプリケーションで使用中です。';
      }
      
      onError(errorMessage);
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

    // Capture 3 photos with 1 second delays (like photo booth)
    const photos: { dataUrl: string; blob: Blob }[] = [];
    
    for (let i = 0; i < 3; i++) {
      try {
        // Show capture notification
        setCountdown(-1); // Special state for "撮影中"
        
        const photo = await capturePhoto();
        photos.push(photo);
        setCapturedPhotos(prev => [...prev, photo]);
        
        // 1 second delay between captures for user to adjust pose
        if (i < 2) {
          setCountdown(-2); // Special state for "次の写真まで"
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error capturing photo:', error);
        onError('撮影に失敗しました。もう一度お試しください。');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      {/* ヘッダー */}
      <div className="safe-top bg-black/30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">📸 撮影モード</h1>
          <div className="w-10"></div> {/* スペーサー */}
        </div>
      </div>

      {/* カメラビュー */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }} // ミラー表示
        />
        
        {/* Hidden Canvas for Capture */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* カメラ状態表示 */}
        <div className="absolute top-4 left-4 z-10">
          {isStreaming ? (
            <div className="flex items-center space-x-2 bg-green-500/90 px-3 py-2 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">カメラ準備完了</span>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 bg-red-500/90 px-3 py-2 rounded-full">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">カメラ起動中...</span>
              </div>
              <button
                onClick={startCamera}
                className="bg-blue-500/90 hover:bg-blue-600/90 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors"
              >
                📹 手動で再試行
              </button>
            </div>
          )}
        </div>

        {/* カウントダウン表示 */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-gradient-to-r from-blue-500/90 to-purple-600/90 backdrop-blur-sm rounded-full w-48 h-48 flex items-center justify-center shadow-2xl">
              <span className="text-8xl font-bold text-white animate-bounce">
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* 撮影中表示 */}
        {countdown === -1 && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-green-500/80 backdrop-blur-sm rounded-2xl p-8 animate-pulse">
              <div className="flex flex-col items-center space-y-4">
                <div className="text-6xl animate-ping">📸</div>
                <span className="text-white text-2xl font-bold">
                  撮影中...
                </span>
                <span className="text-white text-lg">
                  {capturedPhotos.length + 1}/3枚目
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 次の撮影まで */}
        {countdown === -2 && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-blue-500/80 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="text-4xl">✨</div>
                <span className="text-white text-xl font-bold">
                  素敵です！
                </span>
                <span className="text-white text-lg">
                  次のポーズを決めてください
                </span>
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < capturedPhotos.length ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 撮影進行状況（通常） */}
        {isCapturing && countdown === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                <span className="text-white text-2xl font-bold">
                  撮影中 {capturedPhotos.length}/3
                </span>
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < capturedPhotos.length ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* グリッドライン（構図補助） */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-white/20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* 下部コントロール */}
      <div className="bg-black/30 backdrop-blur-sm px-6 py-8">
        {/* 撮影ボタン */}
        <div className="flex justify-center mb-4">
          <button
            onClick={startCountdownCapture}
            disabled={!isStreaming || isCapturing}
            className="group relative w-24 h-24 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 rounded-full shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <CameraIcon className="w-8 h-8 text-red-500 group-disabled:text-gray-500" />
            </div>
            {!isCapturing && !countdown && (
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            )}
          </button>
        </div>

        {/* 説明テキスト */}
        {!isCapturing && countdown === 0 && isStreaming && (
          <div className="text-center">
            <p className="text-white text-lg font-medium mb-2">
              大きなボタンをタップして撮影開始
            </p>
            <p className="text-white/80 text-sm">
              5秒間でポーズを決めてください<br/>
              自動で3枚連続撮影します
            </p>
          </div>
        )}

        {countdown > 0 && (
          <div className="text-center">
            <p className="text-white text-2xl font-bold">
              ポーズを決めてください！
            </p>
          </div>
        )}

        {isCapturing && countdown === 0 && (
          <div className="text-center">
            <p className="text-white text-xl font-bold">
              素晴らしい笑顔です！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
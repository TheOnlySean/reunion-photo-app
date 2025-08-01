'use client';

import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoPreviewProps {
  photos: { dataUrl: string; blob: Blob }[];
  onPhotoSelect: (selectedIndex: number, photoData: { dataUrl: string; blob: Blob }) => void;
  onRetake: () => void;
  isUploading?: boolean;
}

export function PhotoPreview({ photos, onPhotoSelect, onRetake, isUploading = false }: PhotoPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePhotoSelect = (index: number) => {
    if (isUploading) return;
    
    setSelectedIndex(index);
    onPhotoSelect(index, photos[index]);
  };

  return (
    <div className="w-full h-full bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            お気に入りの写真を選択 📸
          </h2>
          <p className="text-gray-600 text-lg">
            撮影した3枚の写真から<br/>
            シェアしたい1枚をお選びください
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={cn(
                "relative cursor-pointer transform transition-all duration-300 hover:scale-105",
                selectedIndex === index 
                  ? "ring-4 ring-blue-500 shadow-xl" 
                  : "hover:shadow-lg",
                isUploading && "pointer-events-none opacity-50"
              )}
              onClick={() => handlePhotoSelect(index)}
            >
              {/* Photo */}
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={photo.dataUrl}
                  alt={`写真 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Selection Indicator */}
              {selectedIndex === index && (
                <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-2">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Photo Number */}
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              {/* Selection Overlay */}
              <div className={cn(
                "absolute inset-0 rounded-lg transition-all duration-300",
                selectedIndex === index
                  ? "bg-blue-500/20"
                  : "hover:bg-blue-500/10"
              )} />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          
          {/* Retake Button */}
          <button
            onClick={onRetake}
            disabled={isUploading}
            className="flex items-center space-x-2 px-8 py-4 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors duration-200"
          >
            <RotateCcw className="w-6 h-6" />
            <span>撮り直し</span>
          </button>

          {/* Confirm Button */}
          <button
            onClick={() => selectedIndex !== null && handlePhotoSelect(selectedIndex)}
            disabled={selectedIndex === null || isUploading}
            className={cn(
              "flex items-center space-x-2 px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200",
              selectedIndex !== null && !isUploading
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>アップロード中...</span>
              </>
            ) : (
              <>
                <Check className="w-6 h-6" />
                <span>この写真に決定</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-blue-800 text-lg">
              💡 <strong>操作方法：</strong>写真をタップして選択し、「この写真に決定」ボタンを押してください
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-blue-800 font-medium text-lg">
                  写真をアップロード中です...<br/>
                  QRコードを生成しています
                </span>
              </div>
              <div className="mt-4 bg-blue-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
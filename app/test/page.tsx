'use client';

import { CameraTest } from '@/components/CameraTest';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🔧 攝像頭診斷工具
          </h1>
          <p className="text-gray-600">
            用於診斷攝像頭權限和瀏覽器兼容性問題
          </p>
        </div>
        
        <CameraTest />
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 測試步驟：</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. 點擊「測試攝像頭」按钮</li>
            <li>2. 如果彈出權限請求，選擇「允許」</li>
            <li>3. 查看狀態消息和錯誤信息</li>
            <li>4. 打開開發者工具查看Console日志</li>
          </ol>
        </div>
        
        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← 返回主應用
          </a>
        </div>
      </div>
    </div>
  );
}
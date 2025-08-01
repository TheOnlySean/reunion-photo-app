'use client';

import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Check, X, Loader2, RefreshCw } from 'lucide-react';

interface DeviceRecord {
  id: string;
  device_id: string;
  password: string; // 明文密码（仅用于显示）
  device_name: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export default function AdminPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [formData, setFormData] = useState({
    deviceId: '',
    password: '',
    deviceName: ''
  });
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 创建的设备密码临时存储
  const [createdDevicePasswords, setCreatedDevicePasswords] = useState<{[key: string]: string}>({});

  // 加载设备列表
  const loadDevices = async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch('/api/admin/devices');
      const result = await response.json();
      
      if (result.success) {
        // 为每个设备设置密码显示（新创建的显示真实密码，已存在的显示占位符）
        const devicesWithPasswords = result.devices.map((device: any) => ({
          ...device,
          password: createdDevicePasswords[device.device_id] || '••••••••'
        }));
        setDevices(devicesWithPasswords);
      } else {
        setMessage({ type: 'error', text: result.error || 'デバイス一覧の取得に失敗しました' });
      }
    } catch (error) {
      console.error('Load devices error:', error);
      setMessage({ type: 'error', text: 'ネットワークエラーが発生しました' });
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // 添加设备
  const handleAddDevice = async () => {
    if (!formData.deviceId.trim() || !formData.password.trim() || !formData.deviceName.trim()) {
      setMessage({ type: 'error', text: 'すべての項目を入力してください' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/create-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: formData.deviceId.trim(),
          password: formData.password.trim(),
          deviceName: formData.deviceName.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'デバイスが正常に追加されました' });
        
        // 保存新创建的设备密码用于显示
        setCreatedDevicePasswords(prev => ({
          ...prev,
          [result.deviceId]: result.password
        }));
        
        setFormData({ deviceId: '', password: '', deviceName: '' });
        await loadDevices(); // 重新加载列表
      } else {
        setMessage({ type: 'error', text: result.error || 'デバイスの追加に失敗しました' });
      }
    } catch (error) {
      console.error('Add device error:', error);
      setMessage({ type: 'error', text: 'ネットワークエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  // 切换设备状态
  const toggleDeviceStatus = async (deviceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/toggle-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, isActive: !currentStatus })
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: currentStatus ? 'デバイスを無効にしました' : 'デバイスを有効にしました' 
        });
        await loadDevices(); // 重新加载列表
      } else {
        setMessage({ type: 'error', text: result.error || 'デバイス状態の更新に失敗しました' });
      }
    } catch (error) {
      console.error('Toggle device error:', error);
      setMessage({ type: 'error', text: 'ネットワークエラーが発生しました' });
    }
  };

  // 复制登录信息
  const copyLoginInfo = async (deviceId: string, password: string) => {
    if (password === '••••••••') {
      setMessage({ 
        type: 'error', 
        text: '既存のデバイスのパスワードは表示できません。新しく作成したデバイスのみコピー可能です。' 
      });
      return;
    }
    
    const loginInfo = `デバイスID: ${deviceId}\nパスワード: ${password}`;
    try {
      await navigator.clipboard.writeText(loginInfo);
      setMessage({ type: 'success', text: 'ログイン情報をコピーしました' });
    } catch (error) {
      console.error('Copy failed:', error);
      setMessage({ type: 'error', text: 'コピーに失敗しました' });
    }
  };

  // 清除消息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔐 デバイス認証管理ツール
          </h1>
          <p className="text-white/80 text-lg">
            デバイスアカウントの作成と管理
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-400/30 text-green-300' 
              : 'bg-red-500/20 border border-red-400/30 text-red-300'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Add Device Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Plus className="mr-3" />
            新しいデバイスを追加
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-white font-medium mb-2">デバイスID</label>
              <input
                type="text"
                value={formData.deviceId}
                onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: DEVICE001"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">パスワード</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="パスワードを入力"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">デバイス名</label>
              <input
                type="text"
                value={formData.deviceName}
                onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: パーティー会場iPad"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button
            onClick={handleAddDevice}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>追加中...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>デバイスを追加</span>
              </>
            )}
          </button>
        </div>

        {/* Device List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              デバイス一覧 ({devices.length})
            </h2>
            <button
              onClick={loadDevices}
              disabled={isLoadingList}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
              <span>更新</span>
            </button>
          </div>

          {isLoadingList ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
              <p className="text-white/60">デバイス一覧を読み込み中...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">登録されているデバイスはありません</p>
            </div>
          ) : (
            <div className="space-y-6">
              {devices.map((device) => (
                <div key={device.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  
                  {/* Device Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      device.is_active 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-400/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        device.is_active ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      {device.is_active ? 'アクティブ' : '無効'}
                    </div>
                    <div className="text-white/60 text-sm">
                      作成日: {new Date(device.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  
                  {/* Device Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-white/60 text-sm mb-1">デバイスID</p>
                      <p className="text-white font-mono text-lg">{device.device_id}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">パスワード</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-mono text-lg">
                          {showPasswords[device.id] ? device.password : '•'.repeat(8)}
                        </p>
                        <button
                          onClick={() => setShowPasswords({...showPasswords, [device.id]: !showPasswords[device.id]})}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          {showPasswords[device.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">デバイス名</p>
                      <p className="text-white text-lg">{device.device_name}</p>
                    </div>
                  </div>

                  {/* Last Login */}
                  {device.last_login && (
                    <div className="mb-4">
                      <p className="text-white/60 text-sm mb-1">最終ログイン</p>
                      <p className="text-white/80">
                        {new Date(device.last_login).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => copyLoginInfo(device.device_id, device.password)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        device.password === '••••••••' 
                          ? 'bg-gray-500 hover:bg-gray-600 text-white/70 cursor-not-allowed' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      title={device.password === '••••••••' ? '既存デバイスのパスワードは表示できません' : ''}
                    >
                      <Check className="w-4 h-4" />
                      <span>ログイン情報をコピー</span>
                    </button>
                    
                    <button
                      onClick={() => toggleDeviceStatus(device.device_id, device.is_active)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        device.is_active
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {device.is_active ? (
                        <>
                          <X className="w-4 h-4" />
                          <span>無効にする</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>有効にする</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20">
          <h3 className="text-xl font-bold text-blue-300 mb-4">📋 使用方法</h3>
          <div className="space-y-2 text-blue-200">
            <p>1. 上のフォームでデバイスID、パスワード、デバイス名を入力</p>
            <p>2. 「デバイスを追加」をクリックしてデータベースに直接保存</p>
            <p>3. 「ログイン情報をコピー」でユーザーに配布する情報を取得</p>
            <p>4. ユーザーはデバイスIDとパスワードでアプリにログイン</p>
            <p>5. 必要に応じてデバイスを無効/有効に切り替え可能</p>
          </div>
        </div>

        {/* Back to App */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <span>📸</span>
            <span>フォトアプリに戻る</span>
          </a>
        </div>
      </div>
    </div>
  );
}
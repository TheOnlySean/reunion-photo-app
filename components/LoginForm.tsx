'use client';

import { useState } from 'react';
import { Smartphone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { LoginRequest, LoginResponse } from '@/lib/types';

interface LoginFormProps {
  onLoginSuccess: (token: string, deviceName: string) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginRequest>({
    deviceId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: LoginResponse = await response.json();

      if (result.success && result.token && result.deviceName) {
        // Store auth token in localStorage
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('device_name', result.deviceName);
        onLoginSuccess(result.token, result.deviceName);
      } else {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
              <span className="text-4xl">📸</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
            フォト撮影
          </h1>
          <h2 className="text-xl font-bold text-white mb-4">
            デバイス認証
          </h2>
          <p className="text-white/80 text-sm">
            設備號とパスワードを入力してください
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Device ID Field */}
            <div className="space-y-2">
              <label htmlFor="deviceId" className="block text-white font-semibold text-sm">
                設備號 (Device ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="deviceId"
                  type="text"
                  value={formData.deviceId}
                  onChange={(e) => handleInputChange('deviceId', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  placeholder="例: DEVICE001"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-white font-semibold text-sm">
                パスワード (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  placeholder="パスワードを入力"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-white/60 hover:text-white/80 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-white/60 hover:text-white/80 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-200 bg-red-500/20 backdrop-blur-sm rounded-lg p-3 border border-red-400/30">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.deviceId.trim() || !formData.password.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>認証中...</span>
                </>
              ) : (
                <>
                  <span>ログイン</span>
                  <span className="text-lg">🔓</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              管理者から提供された設備號とパスワードを入力してください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
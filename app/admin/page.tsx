'use client';

import { useState } from 'react';
import { Plus, Copy, Eye, EyeOff, Check, X } from 'lucide-react';

interface DeviceRecord {
  deviceId: string;
  password: string;
  deviceName: string;
  passwordHash: string;
  sqlStatement: string;
}

export default function AdminPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [formData, setFormData] = useState({
    deviceId: '',
    password: '',
    deviceName: ''
  });
  const [showPasswords, setShowPasswords] = useState<{[key: number]: boolean}>({});
  const [copiedStates, setCopiedStates] = useState<{[key: number]: boolean}>({});

  // 生成SHA256哈希
  const generateHash = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  // 添加设备
  const handleAddDevice = async () => {
    if (!formData.deviceId.trim() || !formData.password.trim() || !formData.deviceName.trim()) {
      alert('请填写完整信息');
      return;
    }

    // 检查设备ID是否重复
    if (devices.some(d => d.deviceId === formData.deviceId.trim())) {
      alert('设备ID已存在');
      return;
    }

    const passwordHash = await generateHash(formData.password.trim());
    const timestamp = Date.now();
    const id = `auth_${timestamp}_${Math.floor(Math.random() * 1000)}`;
    
    const sqlStatement = `INSERT INTO device_auth (id, device_id, password, device_name, is_active) VALUES ('${id}', '${formData.deviceId.trim()}', '${passwordHash}', '${formData.deviceName.trim()}', true);`;

    const newDevice: DeviceRecord = {
      deviceId: formData.deviceId.trim(),
      password: formData.password.trim(),
      deviceName: formData.deviceName.trim(),
      passwordHash,
      sqlStatement
    };

    setDevices([...devices, newDevice]);
    setFormData({ deviceId: '', password: '', deviceName: '' });
  };

  // 复制SQL语句
  const copySQL = async (index: number, sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedStates({ ...copiedStates, [index]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [index]: false });
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 复制所有SQL语句
  const copyAllSQL = async () => {
    const allSQL = devices.map(d => d.sqlStatement).join('\n\n');
    try {
      await navigator.clipboard.writeText(allSQL);
      alert('所有SQL语句已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 删除设备
  const removeDevice = (index: number) => {
    setDevices(devices.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔐 设备认证管理工具
          </h1>
          <p className="text-white/80 text-lg">
            生成设备账户和对应的数据库插入语句
          </p>
        </div>

        {/* Add Device Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Plus className="mr-3" />
            添加新设备
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-white font-medium mb-2">设备ID</label>
              <input
                type="text"
                value={formData.deviceId}
                onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: DEVICE001"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">密码</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="明文密码"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">设备名称</label>
              <input
                type="text"
                value={formData.deviceName}
                onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: パーティー会場iPad"
              />
            </div>
          </div>
          
          <button
            onClick={handleAddDevice}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            添加设备
          </button>
        </div>

        {/* Device List */}
        {devices.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">设备列表 ({devices.length})</h2>
              {devices.length > 1 && (
                <button
                  onClick={copyAllSQL}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>复制所有SQL</span>
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {devices.map((device, index) => (
                <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  
                  {/* Device Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">设备ID</p>
                      <p className="text-white font-mono text-lg">{device.deviceId}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">密码</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-mono text-lg">
                          {showPasswords[index] ? device.password : '•'.repeat(device.password.length)}
                        </p>
                        <button
                          onClick={() => setShowPasswords({...showPasswords, [index]: !showPasswords[index]})}
                          className="text-white/60 hover:text-white"
                        >
                          {showPasswords[index] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">设备名称</p>
                      <p className="text-white text-lg">{device.deviceName}</p>
                    </div>
                  </div>

                  {/* Password Hash */}
                  <div className="mb-4">
                    <p className="text-white/60 text-sm mb-2">密码哈希 (SHA256)</p>
                    <p className="text-green-400 font-mono text-sm bg-black/20 p-3 rounded-lg break-all">
                      {device.passwordHash}
                    </p>
                  </div>

                  {/* SQL Statement */}
                  <div className="mb-4">
                    <p className="text-white/60 text-sm mb-2">SQL插入语句</p>
                    <div className="relative">
                      <pre className="text-yellow-300 font-mono text-sm bg-black/20 p-4 rounded-lg overflow-x-auto">
                        {device.sqlStatement}
                      </pre>
                      <button
                        onClick={() => copySQL(index, device.sqlStatement)}
                        className={`absolute top-2 right-2 p-2 rounded-lg transition-all duration-200 ${
                          copiedStates[index] 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/20 text-white/80 hover:bg-white/30'
                        }`}
                      >
                        {copiedStates[index] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeDevice(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>删除</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20">
          <h3 className="text-xl font-bold text-blue-300 mb-4">📋 使用说明</h3>
          <div className="space-y-2 text-blue-200">
            <p>1. 在上面的表单中输入设备ID、明文密码和设备名称</p>
            <p>2. 点击"添加设备"自动生成密码哈希和SQL语句</p>
            <p>3. 复制SQL语句到你的数据库执行</p>
            <p>4. 将设备ID和明文密码分发给用户</p>
            <p>5. 用户使用设备ID和明文密码登录应用</p>
          </div>
        </div>

        {/* Back to App */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <span>📸</span>
            <span>返回拍照应用</span>
          </a>
        </div>
      </div>
    </div>
  );
}
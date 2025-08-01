// 摄像头权限测试脚本
window.testCamera = function() {
  console.log('🔧 摄像头测试开始');
  console.log('浏览器:', navigator.userAgent);
  console.log('协议:', location.protocol);
  console.log('域名:', location.hostname);
  
  if (!navigator.mediaDevices) {
    alert('此浏览器不支持 mediaDevices API');
    return;
  }
  
  if (!navigator.mediaDevices.getUserMedia) {
    alert('此浏览器不支持 getUserMedia');
    return;
  }
  
  navigator.mediaDevices.getUserMedia({
    video: { 
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  }).then((stream) => {
    console.log('✅ 摄像头权限获得成功');
    console.log('Stream:', stream);
    console.log('Video tracks:', stream.getVideoTracks());
    
    // 创建临时视频元素测试
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    alert('摄像头测试成功！\n请查看控制台以获取详细信息\n\n视频流已创建，3秒后自动关闭');
    
    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());
      console.log('📴 摄像头流已关闭');
    }, 3000);
    
  }).catch((error) => {
    console.error('❌ 摄像头错误:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    let message = '摄像头测试失败:\n\n';
    message += `错误类型: ${error.name}\n`;
    message += `错误信息: ${error.message}\n\n`;
    
    if (error.name === 'NotAllowedError') {
      message += '原因: 摄像头权限被拒绝\n';
      message += '解决: 点击地址栏的摄像头图标，选择"允许"';
    } else if (error.name === 'NotFoundError') {
      message += '原因: 找不到摄像头设备\n';
      message += '解决: 检查摄像头连接';
    } else if (error.name === 'NotSupportedError') {
      message += '原因: 浏览器或设备不支持\n';
      message += '解决: 使用Chrome、Safari或Firefox最新版本';
    } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      message += '原因: 可能需要HTTPS协议\n';
      message += '解决: 使用HTTPS链接访问';
    }
    
    alert(message);
  });
};

console.log('📱 摄像头测试脚本已加载');
console.log('💡 在控制台中运行 testCamera() 来测试摄像头权限');

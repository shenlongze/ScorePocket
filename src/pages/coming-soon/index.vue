<template>
  <view class="coming-soon-page">
    <view class="page-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="page-title">功能开发中</text>
      <view class="placeholder"></view>
    </view>
    
    <view class="content-area">
      <view class="icon-container">
        <text class="main-icon">{{ icon }}</text>
      </view>
      <view class="title-section">
        <text class="feature-title">{{ featureName }}</text>
        <text class="feature-desc">{{ featureDesc }}</text>
      </view>
      
      <view class="progress-section">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">开发进度: {{ progress }}%</text>
      </view>
      
      <view class="info-section">
        <view class="info-item">
          <text class="info-icon">👨‍💻</text>
          <text class="info-text">开发团队正在努力中...</text>
        </view>
        <view class="info-item">
          <text class="info-icon">⏰</text>
          <text class="info-text">预计上线时间: 敬请期待</text>
        </view>
      </view>
      
      <view class="action-btn" @tap="goBack">
        <text>返回首页</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const icon = ref('🚀')
const featureName = ref('功能开发中')
const featureDesc = ref('该功能正在紧张开发中，敬请期待！')
const progress = ref(30)

const featureMap: Record<string, { icon: string; name: string; desc: string; progress: number }> = {
  tournament: { icon: '🏆', name: '创建赛事', desc: '组织线下比赛功能正在开发中...', progress: 45 },
  match: { icon: '📊', name: '对局记录', desc: '查看历史战绩功能正在开发中...', progress: 60 },
  chaos: { icon: '🤝', name: '抓迷糊', desc: '多人混战玩法正在开发中...', progress: 20 },
  custom: { icon: '⚙️', name: '自定义', desc: '自由配置功能正在开发中...', progress: 35 },
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  const type = options.type || 'default'
  
  const feature = featureMap[type] || { icon: '🚀', name: '功能开发中', desc: '该功能正在紧张开发中，敬请期待！', progress: 30 }
  icon.value = feature.icon
  featureName.value = feature.name
  featureDesc.value = feature.desc
  progress.value = feature.progress
})

function goBack() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.coming-soon-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx;
  padding-top: calc(40rpx + env(safe-area-inset-top));
  background: rgba(0, 0, 0, 0.2);
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  text {
    font-size: 40rpx;
    color: #fff;
  }
}

.page-title {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.placeholder {
  width: 60rpx;
}

.content-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 30rpx;
}

.icon-container {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 140, 0, 0.2) 0%, rgba(255, 217, 61, 0.2) 100%);
  border-radius: 50%;
  margin-bottom: 40rpx;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.main-icon {
  font-size: 80rpx;
}

.title-section {
  text-align: center;
  margin-bottom: 50rpx;
}

.feature-title {
  display: block;
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.feature-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.progress-section {
  width: 100%;
  max-width: 500rpx;
  margin-bottom: 50rpx;
}

.progress-bar {
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 15rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff8c00 0%, #ffd93d 100%);
  border-radius: 6rpx;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.info-section {
  width: 100%;
  max-width: 500rpx;
  margin-bottom: 60rpx;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  margin-bottom: 15rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.info-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.action-btn {
  width: 100%;
  max-width: 400rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #ff8c00 0%, #ff6b35 100%);
  border-radius: 16rpx;
  text-align: center;
  
  text {
    font-size: 30rpx;
    color: #fff;
    font-weight: bold;
  }
}
</style>

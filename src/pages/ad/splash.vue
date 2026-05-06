<template>
  <view class="splash-page">
    <view class="splash-content">
      <view class="logo-section">
        <view class="logo-icon">🎱</view>
        <text class="app-title">台球计分</text>
        <text class="app-subtitle">专业线下计分工具</text>
      </view>
      
      <view class="ad-container">
        <view class="ad-placeholder">
          <text class="ad-label">开屏广告位</text>
          <text class="ad-countdown">{{ countdown }}s</text>
        </view>
      </view>
      
      <view class="skip-btn" @tap="skipSplash" v-if="countdown > 0">
        <text>跳过</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const countdown = ref(3)
let timer: number | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      goToHome()
    }
  }, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

function skipSplash() {
  if (timer) {
    clearInterval(timer)
  }
  goToHome()
}

function goToHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.splash-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  width: 100%;
  padding: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.app-title {
  display: block;
  color: #fff;
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.app-subtitle {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
}

.ad-container {
  width: 100%;
  margin-bottom: 60rpx;
}

.ad-placeholder {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 60rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ad-label {
  color: rgba(255, 255, 255, 0.4);
  font-size: 28rpx;
}

.ad-countdown {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  font-weight: bold;
}

.skip-btn {
  position: absolute;
  top: 100rpx;
  right: 30rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  
  text {
    color: #fff;
    font-size: 26rpx;
  }
}
</style>

<template>
  <view class="home-page">
    <view class="header">
      <view class="logo-section">
        <view class="logo-icon">🎱</view>
        <text class="app-title">台球计分</text>
      </view>
      <view class="user-info" @tap="goToProfile">
        <view class="avatar">
          <text>{{ userInfo.nickname.charAt(0) }}</text>
        </view>
        <text class="nickname">{{ userInfo.nickname }}</text>
      </view>
    </view>
    
    <view class="main-content">
      <view class="game-modes">
        <text class="section-title">选择玩法</text>
        
        <view class="mode-grid">
          <view class="mode-card" @tap="startGame('中式八球')">
            <view class="mode-icon">🎱</view>
            <text class="mode-name">中式八球</text>
            <text class="mode-desc">国标黑八</text>
          </view>
          
          <view class="mode-card" @tap="startGame('九球')">
            <view class="mode-icon">9️⃣</view>
            <text class="mode-name">九球</text>
            <text class="mode-desc">按序击打</text>
          </view>
          
          <view class="mode-card" @tap="startGame('六球')">
            <view class="mode-icon">🔶</view>
            <text class="mode-name">六球</text>
            <text class="mode-desc">快速对决</text>
          </view>
          
          <view class="mode-card" @tap="startGame('斯诺克')">
            <view class="mode-icon">🔴</view>
            <text class="mode-name">斯诺克</text>
            <text class="mode-desc">会员专属</text>
          </view>
          
          <view class="mode-card" @tap="startZambo">
            <view class="mode-icon">🤝</view>
            <text class="mode-name">抓迷糊</text>
            <text class="mode-desc">多人混战</text>
          </view>
          
          <view class="mode-card" @tap="startGame('自定义')">
            <view class="mode-icon">⚙️</view>
            <text class="mode-name">自定义</text>
            <text class="mode-desc">自由配置</text>
          </view>
        </view>
      </view>
      
      <view class="quick-actions">
        <view class="action-card" @tap="goToTournament">
          <view class="action-icon">🏆</view>
          <view class="action-content">
            <text class="action-title">创建赛事</text>
            <text class="action-desc">组织线下比赛</text>
          </view>
        </view>
        
        <view class="action-card" @tap="goToRecords">
          <view class="action-icon">📊</view>
          <view class="action-content">
            <text class="action-title">对局记录</text>
            <text class="action-desc">查看历史战绩</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/utils/auth'

const userInfo = ref({ nickname: '游客', avatar: '' })

onMounted(() => {
  userInfo.value = getUserInfo()
})

function goToProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

function startGame(gameType: string) {
  if (gameType === '中式八球') {
    uni.navigateTo({ url: '/pages/game/mode-select/index' })
    return
  }
  
  if (gameType === '九球' || gameType === '六球') {
    uni.navigateTo({ url: `/pages/game/nineball/config?gameType=${gameType}` })
    return
  }
  
  if (gameType === '斯诺克') {
    uni.navigateTo({ url: '/pages/game/snooker/config' })
    return
  }
  
  if (gameType === '自定义') {
    uni.navigateTo({ url: '/pages/coming-soon/index?type=custom' })
    return
  }
  
  uni.navigateTo({ url: `/pages/game/onevone/index?gameType=${encodeURIComponent(gameType)}` })
}

function startZambo() {
  uni.navigateTo({ url: '/pages/coming-soon/index?type=chaos' })
}

function goToTournament() {
  uni.navigateTo({ url: '/pages/coming-soon/index?type=tournament' })
}

function goToRecords() {
  uni.navigateTo({ url: '/pages/coming-soon/index?type=match' })
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 120rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 30rpx;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-icon {
  font-size: 56rpx;
  margin-right: 15rpx;
}

.app-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30rpx;
}

.avatar {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10rpx;
}

.avatar text {
  color: #fff;
  font-size: 22rpx;
}

.nickname {
  color: #fff;
  font-size: 26rpx;
}

.main-content {
  padding: 0 20rpx;
}

.game-modes {
  margin-bottom: 30rpx;
}

.section-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.mode-card {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2) 0%, rgba(45, 90, 138, 0.2) 100%);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2rpx solid rgba(74, 158, 255, 0.3);
}

.mode-icon {
  font-size: 50rpx;
  margin-bottom: 15rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-name {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.mode-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.action-card {
  flex: 1;
  background: linear-gradient(135deg, #2d3436 0%, #1a1a2e 100%);
  border-radius: 20rpx;
  padding: 25rpx;
  display: flex;
  align-items: center;
}

.action-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.action-content {
  display: flex;
  flex-direction: column;
}

.action-title {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.action-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}
</style>

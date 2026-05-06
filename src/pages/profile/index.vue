<template>
  <view class="profile-page">
    <view class="profile-header">
    <view class="user-card">
      <view class="avatar" v-if="!userInfo.avatar">
        <text>{{ userInfo.nickname.charAt(0) }}</text>
      </view>
      <image v-else class="avatar-img" :src="userInfo.avatar" mode="aspectFill" />
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname }}</text>
        <view class="member-badge" v-if="isMemberValue">
          <text>VIP会员</text>
        </view>
        <text v-else class="visitor-text" @tap="handleLogin">点击登录</text>
      </view>
    </view>
    
    <view class="member-expire" v-if="isMemberValue">
      <text>会员有效期至 {{ formatExpireDate() }}</text>
    </view>
  </view>
  
  <view class="stats-section">
    <text class="section-title">战绩统计</text>
    <view class="stats-grid">
      <view class="stat-item">
        <view class="stat-icon">💥</view>
        <text class="stat-value">{{ userInfo.stats.zhaQingCount }}</text>
        <text class="stat-label">炸清</text>
      </view>
      <view class="stat-item">
        <view class="stat-icon">🎯</view>
        <text class="stat-value">{{ userInfo.stats.jieQingCount }}</text>
        <text class="stat-label">接清</text>
      </view>
      <view class="stat-item">
        <view class="stat-icon">🏆</view>
        <text class="stat-value">{{ userInfo.stats.winCount }}</text>
        <text class="stat-label">胜场</text>
      </view>
      <view class="stat-item">
        <view class="stat-icon">📊</view>
        <text class="stat-value">{{ userInfo.stats.totalMatches }}</text>
        <text class="stat-label">总对局</text>
      </view>
    </view>
  </view>
    
    <view class="menu-section">
      <view class="menu-item" @tap="goToPay">
        <view class="menu-icon">💎</view>
        <text class="menu-text">开通会员</text>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @tap="goToSettings">
        <view class="menu-icon">⚙️</view>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @tap="goToHelp">
        <view class="menu-icon">❓</view>
        <text class="menu-text">帮助与反馈</text>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @tap="goToAbout">
        <view class="menu-icon">ℹ️</view>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" v-if="userInfo.nickname !== '游客'" @tap="handleLogout">
        <view class="menu-icon">🚪</view>
        <text class="menu-text">退出登录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <view class="feature-section">
      <text class="section-title">会员专属权益</text>
      
      <view class="feature-list">
        <view class="feature-item">
          <view class="feature-icon" :class="{ unlocked: isMemberValueValue }">🎱</view>
          <view class="feature-info">
            <text class="feature-name">全玩法解锁</text>
            <text class="feature-desc">斯诺克、自定义球数等专属玩法</text>
          </view>
          <view class="feature-status">
            <text v-if="isMemberValueValue">✓</text>
            <text v-else>🔒</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon" :class="{ unlocked: isMemberValueValue }">🤝</view>
          <view class="feature-info">
            <text class="feature-name">多人联机</text>
            <text class="feature-desc">房间码/NFC配对，实时同步</text>
          </view>
          <view class="feature-status">
            <text v-if="isMemberValueValue">✓</text>
            <text v-else>🔒</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon" :class="{ unlocked: isMemberValueValue }">🏆</view>
          <view class="feature-info">
            <text class="feature-name">赛事创建</text>
            <text class="feature-desc">创建赛事、可视化图谱</text>
          </view>
          <view class="feature-status">
            <text v-if="isMemberValueValue">✓</text>
            <text v-else>🔒</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon" :class="{ unlocked: isMemberValueValue }">📊</view>
          <view class="feature-info">
            <text class="feature-name">数据导出</text>
            <text class="feature-desc">对局记录导出、个人统计</text>
          </view>
          <view class="feature-status">
            <text v-if="isMemberValueValue">✓</text>
            <text v-else>🔒</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon" :class="{ unlocked: isMemberValueValue }">⏱️</view>
          <view class="feature-info">
            <text class="feature-name">击球计时</text>
            <text class="feature-desc">自定义限时、震动提醒</text>
          </view>
          <view class="feature-status">
            <text v-if="isMemberValueValue">✓</text>
            <text v-else>🔒</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon" :class="{ unlocked: isMemberValueValue }">🚫</view>
          <view class="feature-info">
            <text class="feature-name">无广告</text>
            <text class="feature-desc">全局屏蔽开屏/横幅广告</text>
          </view>
          <view class="feature-status">
            <text v-if="isMemberValueValue">✓</text>
            <text v-else>🔒</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="footer">
      <text class="version">版本 1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, isMember, getMemberExpireDays, wechatLogin, logout } from '@/utils/auth'

const userInfo = ref({ nickname: '游客', memberExpireTime: 0, avatar: '', stats: { zhaQingCount: 0, jieQingCount: 0, totalMatches: 0, winCount: 0 } })
const isMemberValue = ref(false)

onMounted(() => {
  userInfo.value = getUserInfo()
  isMemberValue.value = isMember()
})

function formatExpireDate(): string {
  if (!userInfo.value.memberExpireTime) return ''
  const date = new Date(userInfo.value.memberExpireTime)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

async function handleLogin() {
  if (userInfo.value.nickname === '游客') {
    try {
      uni.showLoading({ title: '登录中...' })
      const user = await wechatLogin()
      userInfo.value = user
      isMemberValue.value = isMember()
      uni.hideLoading()
      uni.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      uni.hideLoading()
      uni.showToast({ title: '登录失败', icon: 'none' })
      console.error('Login failed:', error)
    }
  }
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
        userInfo.value = {
          nickname: '游客',
          memberExpireTime: 0,
          avatar: '',
          stats: { zhaQingCount: 0, jieQingCount: 0, totalMatches: 0, winCount: 0 }
        }
        isMemberValue.value = false
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    }
  })
}

function goToPay() {
  uni.navigateTo({ url: '/pages/pay/index' })
}

function goToSettings() {
  uni.showToast({ title: '设置页面开发中', icon: 'none' })
}

function goToHelp() {
  uni.showToast({ title: '帮助页面开发中', icon: 'none' })
}

function goToAbout() {
  uni.showModal({
    title: '关于台球计分',
    content: '版本 1.0.0\n\n一款专业的线下台球计分工具，支持多种玩法，让您的台球之旅更加精彩！',
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 120rpx;
}

.profile-header {
  padding: 60rpx 30rpx 30rpx;
}

.user-card {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 25rpx;
  
  text {
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
  }
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 25rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.member-badge {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
  padding: 5rpx 20rpx;
  border-radius: 20rpx;
  display: inline-block;
  
  text {
    color: #fff;
    font-size: 22rpx;
    font-weight: bold;
  }
}

.visitor-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.member-expire {
  background: rgba(74, 158, 255, 0.1);
  padding: 15rpx 20rpx;
  border-radius: 15rpx;
  
  text {
    color: #4a9eff;
    font-size: 24rpx;
  }
}

.stats-section {
  padding: 0 20rpx;
  margin-bottom: 30rpx;
}

.section-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 25rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.stat-value {
  color: #4a9eff;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}

.menu-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  margin: 0 20rpx 30rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  color: #fff;
  font-size: 28rpx;
}

.menu-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 36rpx;
}

.feature-section {
  padding: 0 20rpx;
  margin-bottom: 30rpx;
}

.section-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.feature-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  overflow: hidden;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 20rpx 25rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
}

.feature-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 15rpx;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 32rpx;
  
  &.unlocked {
    background: rgba(74, 217, 100, 0.2);
  }
}

.feature-info {
  flex: 1;
}

.feature-name {
  display: block;
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 5rpx;
}

.feature-desc {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 22rpx;
}

.feature-status text {
  font-size: 32rpx;
}

.footer {
  text-align: center;
  padding: 30rpx;
}

.version {
  color: rgba(255, 255, 255, 0.3);
  font-size: 22rpx;
}
</style>

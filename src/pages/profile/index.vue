<template>
  <view class="profile-page">
    <view class="profile-header">
      <view class="user-card">
        <view class="avatar">
          <text>{{ userInfo.nickname.charAt(0) }}</text>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname }}</text>
        </view>
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
    </view>

    <view class="footer">
      <text class="version">版本 1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserInfo, type UserInfo as AuthUserInfo } from '@/utils/auth';

const userInfo = ref<AuthUserInfo>({
  id: '',
  nickname: '游客',
  avatar: '',
  stats: { zhaQingCount: 0, jieQingCount: 0, totalMatches: 0, winCount: 0 },
});

onMounted(() => {
  userInfo.value = getUserInfo();
});

function goToSettings() {
  uni.showToast({ title: '设置页面开发中', icon: 'none' });
}

function goToHelp() {
  uni.showToast({ title: '帮助页面开发中', icon: 'none' });
}

function goToAbout() {
  uni.showModal({
    title: '关于台球计分',
    content: '版本 1.0.0\n\n一款专业的线下台球计分工具，支持多种玩法，让您的台球之旅更加精彩！',
    showCancel: false,
  });
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

.footer {
  text-align: center;
  padding: 30rpx;
}

.version {
  color: rgba(255, 255, 255, 0.3);
  font-size: 22rpx;
}
</style>

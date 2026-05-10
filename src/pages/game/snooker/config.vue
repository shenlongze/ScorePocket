<template>
  <view class="config-page">
    <view class="config-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="page-title">比赛配置</text>
      <view class="save-btn" @tap="validateAndSaveConfig">保存</view>
    </view>

    <scroll-view scroll-y class="config-scroll">
      <view class="config-section">
        <view class="section-title">基础设置</view>
        
        <view class="config-item">
          <text class="item-label">选手数量</text>
          <view class="player-count-selector">
            <view 
              v-for="count in [2, 3, 4]" 
              :key="count"
              :class="['count-option', { active: config.playerCount === count }]"
              @tap="setPlayerCount(count)"
            >
              {{ count }}人
            </view>
          </view>
        </view>

        <view v-for="(_, index) in config.playerNames" :key="index" class="config-item">
          <text class="item-label">选手{{ index + 1 }}</text>
          <input 
            type="text" 
            class="name-input" 
            v-model="config.playerNames[index]"
            :placeholder="`选手${index + 1}`"
          />
        </view>

        <view class="config-item">
          <text class="item-label">比赛模式</text>
          <view class="radio-group">
            <view 
              :class="['radio-btn', { active: config.mode === 'single' }]"
              @tap="config.mode = 'single'"
            >单打</view>
            <view 
              :class="['radio-btn', { active: config.mode === 'double' }]"
              @tap="config.mode = 'double'"
            >双打</view>
          </view>
        </view>
      </view>

      <view class="config-section">
        <view class="section-title">局数设置</view>
        
        <view class="config-item">
          <text class="item-label">比赛局数</text>
          <input 
            type="number" 
            class="value-input" 
            v-model="gameRounds"
            placeholder="不限制"
          />
          <text class="item-unit">局</text>
        </view>
      </view>

      <view class="config-section">
        <view class="section-title">功能开关</view>
        
        <view class="config-item">
          <text class="item-label">单杆统计</text>
          <switch 
            :checked="config.enableBreakStats" 
            @change="config.enableBreakStats = !config.enableBreakStats"
            color="#ff8c00"
          />
        </view>

        <view class="config-item">
          <text class="item-label">犯规罚分</text>
          <switch 
            :checked="config.enableFoulPenalty" 
            @change="config.enableFoulPenalty = !config.enableFoulPenalty"
            color="#ff8c00"
          />
        </view>
      </view>

      <view class="config-section">
        <view class="section-title">时间设置</view>
        
        <view class="config-item">
          <text class="item-label">比赛时长</text>
          <input 
            type="number" 
            class="value-input" 
            v-model="gameTimeMinutes"
            placeholder="不限制"
          />
          <text class="item-unit">分钟</text>
        </view>
      </view>
    </scroll-view>

    <view class="start-btn" @tap="startGame">开始比赛</view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

interface SnookerConfig {
  playerCount: number;
  playerNames: string[];
  mode: 'single' | 'double';
  gameRounds: number | null;
  enableBreakStats: boolean;
  enableFoulPenalty: boolean;
  gameTimeMinutes: number | null;
}

const config = reactive<SnookerConfig>({
  playerCount: 2,
  playerNames: ['选手1', '选手2'],
  mode: 'single',
  gameRounds: null,
  enableBreakStats: true,
  enableFoulPenalty: true,
  gameTimeMinutes: null
});

const gameRounds = ref('');
const gameTimeMinutes = ref('');

function goBack() {
  uni.navigateBack();
}

function setPlayerCount(count: number) {
  config.playerCount = count;
  const names = config.playerNames;
  while (names.length < count) {
    names.push(`选手${names.length + 1}`);
  }
  while (names.length > count) {
    names.pop();
  }
}

function validateAndSaveConfig() {
  if (gameRounds.value) {
    config.gameRounds = parseInt(gameRounds.value);
  } else {
    config.gameRounds = null;
  }
  
  if (gameTimeMinutes.value) {
    config.gameTimeMinutes = parseInt(gameTimeMinutes.value);
  } else {
    config.gameTimeMinutes = null;
  }
  
  uni.setStorageSync('snooker_config', JSON.stringify(config));
  uni.showToast({ title: '配置已保存', icon: 'success' });
}

function startGame() {
  if (gameRounds.value) {
    config.gameRounds = parseInt(gameRounds.value);
  } else {
    config.gameRounds = null;
  }
  
  if (gameTimeMinutes.value) {
    config.gameTimeMinutes = parseInt(gameTimeMinutes.value);
  } else {
    config.gameTimeMinutes = null;
  }
  
  uni.setStorageSync('snooker_config', JSON.stringify(config));
  
  uni.navigateTo({ url: '/pages/game/snooker/index' });
}
</script>

<style lang="scss" scoped>
.config-page {
  min-height: 100vh;
  background: #1a1a2e;
  padding-bottom: 180rpx;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 30rpx 30rpx;
  background: #16213e;
}

.back-btn {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  
  text {
    color: #fff;
    font-size: 48rpx;
    font-weight: bold;
    line-height: 1;
  }
}

.page-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.save-btn {
  padding: 15rpx 30rpx;
  background: rgba(255, 140, 0, 0.2);
  border-radius: 20rpx;
  color: #ff8c00;
  font-size: 28rpx;
}

.config-scroll {
  height: calc(100vh - 180rpx);
  padding: 20rpx;
}

.config-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.section-title {
  color: #ff8c00;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 25rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.item-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  flex: 1;
}

.item-unit {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  margin-left: 10rpx;
}

.player-count-selector {
  display: flex;
  gap: 15rpx;
}

.count-option {
  width: 80rpx;
  height: 60rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
  transition: all 0.3s ease;
  
  &.active {
    background: #ff8c00;
    color: #fff;
  }
}

.name-input {
  flex: 1;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 0 20rpx;
  color: #fff;
  font-size: 28rpx;
}

.value-input {
  width: 150rpx;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  text-align: center;
  color: #fff;
  font-size: 28rpx;
}

.radio-group {
  display: flex;
  gap: 20rpx;
  flex: 1;
  justify-content: flex-end;
}

.radio-btn {
  padding: 15rpx 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  transition: all 0.3s;
}

.radio-btn.active {
  background: #ff8c00;
  color: #fff;
}

.start-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: linear-gradient(135deg, #ff8c00 0%, #ff6b35 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}
</style>

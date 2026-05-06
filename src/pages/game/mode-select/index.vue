<template>
  <view class="mode-select-page">
    <view class="page-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="page-title">选择比赛模式</text>
      <view class="placeholder"></view>
    </view>
    
    <view class="mode-list">
      <view class="mode-card" @tap="showRoundsInput = true">
        <view class="mode-icon">🏆</view>
        <view class="mode-info">
          <text class="mode-name">抢局赛</text>
          <text class="mode-desc">设定抢N局，先胜N局者获胜</text>
        </view>
        <view class="mode-arrow">›</view>
      </view>
      
      <view class="mode-card" @tap="selectMode('simple')">
        <view class="mode-icon">📝</view>
        <view class="mode-info">
          <text class="mode-name">纯记分</text>
          <text class="mode-desc">简单计分模式，无时间和局数限制</text>
        </view>
        <view class="mode-arrow">›</view>
      </view>
      
      <view class="mode-card" @tap="showTimeInput = true">
        <view class="mode-icon">⏱️</view>
        <view class="mode-info">
          <text class="mode-name">时间赛</text>
          <text class="mode-desc">设定比赛时长，倒计时结束后可加时</text>
        </view>
        <view class="mode-arrow">›</view>
      </view>
    </view>
  </view>
  
  <view class="modal-overlay" v-if="showTimeInput" @tap="showTimeInput = false">
    <view class="modal-content" @tap.stop>
      <text class="modal-title">设置比赛时间</text>
      <view class="input-section">
        <view class="time-options">
          <view 
            v-for="time in timeOptions" 
            :key="time" 
            class="time-option"
            :class="{ active: selectedTime === time }"
            @tap="selectedTime = time"
          >
            <text>{{ time }}分钟</text>
          </view>
        </view>
        <view class="custom-input">
          <text class="input-label">自定义时间（分钟）</text>
          <input 
            type="number" 
            v-model="customTime" 
            placeholder="请输入分钟数"
            class="input-field"
          />
        </view>
      </view>
      <view class="modal-actions">
        <view class="btn cancel" @tap="showTimeInput = false">取消</view>
        <view class="btn confirm" @tap="startTimeMatch">确认</view>
      </view>
    </view>
  </view>
  
  <view class="modal-overlay" v-if="showRoundsInput" @tap="showRoundsInput = false">
    <view class="modal-content" @tap.stop>
      <text class="modal-title">设置抢局数</text>
      <view class="input-section">
        <view class="round-options">
          <view 
            v-for="round in roundOptions" 
            :key="round" 
            class="round-option"
            :class="{ active: selectedRound === round }"
            @tap="selectedRound = round"
          >
            <text>抢{{ round }}</text>
          </view>
        </view>
        <view class="custom-input">
          <text class="input-label">自定义抢局数</text>
          <input 
            type="number" 
            v-model="customRound" 
            placeholder="请输入抢局数"
            class="input-field"
          />
        </view>
        <view class="round-info">
          <text>抢{{ selectedRound || customRound || 1 }}局 = {{ getTotalRounds(selectedRound || customRound || 1) }}局{{ selectedRound || customRound || 1 }}胜</text>
        </view>
      </view>
      <view class="modal-actions">
        <view class="btn cancel" @tap="showRoundsInput = false">取消</view>
        <view class="btn confirm" @tap="startRoundMatch">确认</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showTimeInput = ref(false)
const showRoundsInput = ref(false)
const selectedTime = ref(60)
const customTime = ref('')
const selectedRound = ref(7)
const customRound = ref('')

const timeOptions = [15, 30, 45, 60, 90, 120]
const roundOptions = [3, 5, 7, 9, 11]

function goBack() {
  uni.navigateBack()
}

function selectMode(mode: string) {
  uni.navigateTo({
    url: `/pages/game/chinese8/index?mode=${mode}`
  })
}

function startTimeMatch() {
  const time = customTime.value ? parseInt(customTime.value) : selectedTime.value
  uni.navigateTo({
    url: `/pages/game/chinese8/index?mode=timed&time=${time}`
  })
}

function startRoundMatch() {
  const round = customRound.value ? parseInt(customRound.value) : selectedRound.value
  uni.navigateTo({
    url: `/pages/game/chinese8/index?mode=rounds&round=${round}`
  })
}

function getTotalRounds(round: number): number {
  return round * 2 - 1
}
</script>

<style lang="scss" scoped>
.mode-select-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 60rpx;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 30rpx 30rpx;
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

.placeholder {
  width: 70rpx;
}

.mode-list {
  padding: 20rpx;
}

.mode-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
  
  &:active {
    background: rgba(74, 158, 255, 0.2);
  }
}

.mode-icon {
  font-size: 56rpx;
  margin-right: 25rpx;
}

.mode-info {
  flex: 1;
}

.mode-name {
  display: block;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.mode-desc {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}

.mode-arrow {
  color: rgba(255, 255, 255, 0.3);
  font-size: 40rpx;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 85%;
  background: #1e3a5f;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-title {
  display: block;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.input-section {
  margin-bottom: 30rpx;
}

.time-options, .round-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.time-option, .round-option {
  padding: 15rpx 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    background: rgba(74, 158, 255, 0.2);
    border-color: #4a9eff;
  }
  
  text {
    color: #fff;
    font-size: 26rpx;
  }
}

.custom-input {
  margin-bottom: 20rpx;
}

.input-label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-bottom: 15rpx;
}

.input-field {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 0 20rpx;
  color: #fff;
  font-size: 28rpx;
}

.round-info {
  background: rgba(74, 158, 255, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  
  text {
    color: #4a9eff;
    font-size: 26rpx;
  }
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  
  &.cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  &.confirm {
    background: #4a9eff;
    color: #fff;
  }
}
</style>

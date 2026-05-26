<template>
  <view class="mode-select-container">
    <view class="mode-select-page">
      <view class="page-header">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="page-title">比赛配置</text>
        <view class="placeholder"></view>
      </view>

      <view class="config-section">
        <text class="section-title">比赛模式</text>
        <view class="mode-options">
          <view
            class="mode-option"
            :class="{ active: selectedMode === 'rounds' }"
            @tap="selectMode('rounds')"
          >
            <view class="mode-icon">🏆</view>
            <view class="mode-text">
              <text class="mode-name">抢局赛</text>
              <text class="mode-desc">设定抢N局，先胜N局者获胜</text>
            </view>
          </view>

          <view
            class="mode-option"
            :class="{ active: selectedMode === 'simple' }"
            @tap="selectMode('simple')"
          >
            <view class="mode-icon">📝</view>
            <view class="mode-text">
              <text class="mode-name">纯记分</text>
              <text class="mode-desc">简单计分模式，无时间和局数限制</text>
            </view>
          </view>

          <view
            class="mode-option"
            :class="{ active: selectedMode === 'timed' }"
            @tap="selectMode('timed')"
          >
            <view class="mode-icon">⏱️</view>
            <view class="mode-text">
              <text class="mode-name">时间赛</text>
              <text class="mode-desc">设定比赛时长，倒计时结束后可加时</text>
            </view>
          </view>
        </view>

        <view class="sub-config" v-if="selectedMode === 'rounds'">
          <text class="config-label">抢局数</text>
          <view class="option-grid">
            <view
              v-for="round in roundOptions"
              :key="round"
              class="option-item"
              :class="{ active: selectedRound === round }"
              @tap="selectedRound = round"
            >
              <text>抢{{ round }}</text>
            </view>
            <view class="option-item custom" @tap="showCustomRound = true">
              <text>自定义</text>
            </view>
          </view>
          <text class="config-hint"
            >抢{{ selectedRound }}局 = {{ selectedRound * 2 - 1 }}局{{ selectedRound }}胜</text
          >
        </view>

        <view class="sub-config" v-if="selectedMode === 'timed'">
          <text class="config-label">比赛时长</text>
          <view class="option-grid">
            <view
              v-for="time in timeOptions"
              :key="time"
              class="option-item"
              :class="{ active: selectedTime === time }"
              @tap="selectedTime = time"
            >
              <text>{{ time }}分钟</text>
            </view>
            <view class="option-item custom" @tap="showCustomTime = true">
              <text>自定义</text>
            </view>
          </view>
        </view>

        <view class="players-section">
          <text class="section-title">参赛人数</text>
          <view class="player-count-options">
            <view
              v-for="count in playerCountOptions"
              :key="count"
              class="player-count-item"
              :class="{ active: playerCount === count }"
              @tap="playerCount = count"
            >
              <text>{{ count }}人</text>
            </view>
          </view>

          <text class="section-title mt-20">选手名称</text>
          <view class="players-list">
            <view class="player-item" v-for="i in playerCount" :key="i">
              <view class="player-avatar">{{ i }}</view>
              <view class="player-info">
                <input
                  type="text"
                  v-model="playerNames[i - 1]"
                  :placeholder="`选手${i}`"
                  class="player-input"
                />
              </view>
            </view>
          </view>
        </view>

        <view class="start-btn" :class="{ disabled: !selectedMode }" @tap="startMatch">
          <text>开始比赛</text>
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
            <text
              >抢{{ selectedRound || customRound || 1 }}局 =
              {{ getTotalRounds(selectedRound || customRound || 1) }}局{{
                selectedRound || customRound || 1
              }}胜</text
            >
          </view>
        </view>
        <view class="modal-actions">
          <view class="btn cancel" @tap="showRoundsInput = false">取消</view>
          <view class="btn confirm" @tap="startRoundMatch">确认</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showTimeInput = ref(false);
const showRoundsInput = ref(false);
const showCustomTime = ref(false);
const showCustomRound = ref(false);
const selectedTime = ref(60);
const customTime = ref('');
const selectedRound = ref(7);
const customRound = ref('');
const selectedMode = ref('rounds');
const playerCount = ref(2);
const playerNames = ref(['选手1', '选手2', '选手3', '选手4']);

const timeOptions = [15, 30, 45, 60, 90, 120];
const roundOptions = [3, 5, 7, 9, 11];
const playerCountOptions = [2, 3, 4];

function goBack() {
  uni.navigateBack();
}

function selectMode(mode: string) {
  selectedMode.value = mode;
}

function startMatch() {
  if (!selectedMode.value) {
    uni.showToast({ title: '请选择比赛模式', icon: 'none' });
    return;
  }

  let url = `/pages/game/chinese8/index?mode=${selectedMode.value}&count=${playerCount.value}`;

  if (selectedMode.value === 'rounds') {
    url += `&round=${selectedRound.value}`;
  } else if (selectedMode.value === 'timed') {
    url += `&time=${selectedTime.value}`;
  }

  for (let i = 0; i < playerCount.value; i++) {
    url += `&player${i + 1}=${encodeURIComponent(playerNames.value[i] || `选手${i + 1}`)}`;
  }

  uni.navigateTo({ url });
}

function startTimeMatch() {
  const time = customTime.value ? parseInt(customTime.value) : selectedTime.value;
  selectedTime.value = time;
  showCustomTime.value = false;
}

function startRoundMatch() {
  const round = customRound.value ? parseInt(customRound.value) : selectedRound.value;
  selectedRound.value = round;
  showCustomRound.value = false;
}

function getTotalRounds(round: number): number {
  return round * 2 - 1;
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

.time-options,
.round-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.time-option,
.round-option {
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

.config-section {
  padding: 20rpx;
}

.section-title {
  display: block;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.mode-option {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 25rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: rgba(74, 158, 255, 0.15);
    border-color: #4a9eff;
  }

  &:active {
    transform: scale(0.98);
  }
}

.mode-option .mode-icon {
  font-size: 50rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.mode-option .mode-text {
  flex: 1;
}

.mode-option .mode-name {
  display: block;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.mode-option .mode-desc {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 22rpx;
}

.sub-config {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.config-label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
  margin-bottom: 15rpx;
}

.option-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.option-item {
  padding: 15rpx 25rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    background: rgba(74, 158, 255, 0.2);
    border-color: #4a9eff;
  }

  &.custom {
    background: rgba(255, 140, 0, 0.1);
    border-color: rgba(255, 140, 0, 0.3);

    &.active {
      background: rgba(255, 140, 0, 0.2);
      border-color: #ff8c00;
    }
  }

  text {
    color: #fff;
    font-size: 24rpx;
  }
}

.config-hint {
  display: block;
  color: #4a9eff;
  font-size: 24rpx;
  text-align: center;
  margin-top: 10rpx;
}

.players-section {
  margin-bottom: 30rpx;
}

.player-count-options {
  display: flex;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.player-count-item {
  flex: 1;
  padding: 15rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  text-align: center;
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

.section-title.mt-20 {
  margin-top: 20rpx;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.player-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 15rpx;
  box-sizing: border-box;
}

.player-avatar {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #2d7dd2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  flex-shrink: 0;

  text {
    color: #fff;
    font-size: 24rpx;
    font-weight: bold;
  }
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-input {
  width: 100%;
  height: 55rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  padding: 0 15rpx;
  color: #fff;
  font-size: 24rpx;
  box-sizing: border-box;
}

.start-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #4a9eff 0%, #2d7dd2 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  transition: all 0.3s ease;

  &.disabled {
    background: rgba(255, 255, 255, 0.2);
    pointer-events: none;
  }

  &:active {
    transform: scale(0.98);
  }

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}
</style>

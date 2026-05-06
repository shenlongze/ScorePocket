<template>
  <view class="score-board">
    <view class="player-section">
      <view class="player-card" :class="{ active: currentPlayer === 0 }" @tap="switchToPlayer(0)">
        <view class="card-body">
          <view class="avatar-area">
            <view class="player-avatar">
              <text class="avatar-text">{{ player1.name.charAt(0) }}</text>
            </view>
          </view>
          <view class="score-area">
            <text class="player-score">{{ score1 }}</text>
          </view>
          <view class="actions-area">
            <view class="score-btn minus" @tap.stop="emit('subtractScore', 0)">-</view>
            <view class="score-btn plus" @tap.stop="emit('addScore', 0)">+</view>
          </view>
        </view>
        <view class="card-footer">
          <text class="player-name">{{ player1.name }}</text>
          <view class="stats-area">
            <view class="stat-item" @tap="emit('markZhaQing', 0)">
              <text class="stat-label">炸清:</text>
              <text class="stat-value">{{ player1ZhaQing }}</text>
            </view>
            <view class="stat-item" @tap="emit('markJieQing', 0)">
              <text class="stat-label">接清:</text>
              <text class="stat-value">{{ player1JieQing }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="vs-section">
      <text class="vs-text">VS</text>
    </view>
    
    <view class="player-section">
      <view class="player-card" :class="{ active: currentPlayer === 1 }" @tap="switchToPlayer(1)">
        <view class="card-body">
          <view class="avatar-area">
            <view class="player-avatar">
              <text class="avatar-text">{{ player2.name.charAt(0) }}</text>
            </view>
          </view>
          <view class="score-area">
            <text class="player-score">{{ score2 }}</text>
          </view>
          <view class="actions-area">
            <view class="score-btn minus" @tap.stop="emit('subtractScore', 1)">-</view>
            <view class="score-btn plus" @tap.stop="emit('addScore', 1)">+</view>
          </view>
        </view>
        <view class="card-footer">
          <text class="player-name">{{ player2.name }}</text>
          <view class="stats-area">
            <view class="stat-item" @tap="emit('markZhaQing', 1)">
              <text class="stat-label">炸清:</text>
              <text class="stat-value">{{ player2ZhaQing }}</text>
            </view>
            <view class="stat-item" @tap="emit('markJieQing', 1)">
              <text class="stat-label">接清:</text>
              <text class="stat-value">{{ player2JieQing }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Player {
  name: string
}

defineProps<{
  player1: Player
  player2: Player
  score1: number
  score2: number
  currentPlayer: number
  gameType: string
  player1ZhaQing: number
  player1JieQing: number
  player2ZhaQing: number
  player2JieQing: number
}>()

const emit = defineEmits<{
  switchPlayer: [playerIndex: number]
  addScore: [playerIndex: number]
  subtractScore: [playerIndex: number]
  markZhaQing: [playerIndex: number]
  markJieQing: [playerIndex: number]
}>()

function switchToPlayer(playerIndex: number) {
  emit('switchPlayer', playerIndex)
}
</script>

<style lang="scss" scoped>
.score-board {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  padding: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.player-section {
  width: 100%;
}

.vs-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  margin: 0 10rpx;
}

.vs-text {
  color: #4a9eff;
  font-size: 36rpx;
  font-weight: bold;
}

.player-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 25rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    background: rgba(74, 158, 255, 0.15);
    border-color: #4a9eff;
  }
}

.card-body {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar-area {
  flex-shrink: 0;
}

.player-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.score-area {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 20rpx;
}

.player-score {
  color: #4a9eff;
  font-size: 96rpx;
  font-weight: bold;
}

.actions-area {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.score-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &.plus {
    background: rgba(74, 217, 100, 0.2);
    color: #4ad964;
    border: 2rpx solid rgba(74, 217, 100, 0.5);
  }
  
  &.minus {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
    border: 2rpx solid rgba(255, 107, 107, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 15rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.player-name {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

.stats-area {
  display: flex;
  gap: 40rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
}

.stat-value {
  color: #4a9eff;
  font-size: 28rpx;
  font-weight: bold;
}

.vs-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
  padding: 25rpx 0;
  margin: 0 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
}

.score-display {
  color: #4a9eff;
  font-size: 48rpx;
  font-weight: bold;
}

.vs-text {
  color: #4a9eff;
  font-size: 36rpx;
  font-weight: bold;
}
</style>

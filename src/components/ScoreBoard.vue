<template>
  <view class="score-board" :class="getLayoutClass()">
    <view 
      v-for="player in players" 
      :key="player.id"
      :class="['player-card', { active: currentPlayerId === player.id }]"
      :style="{ '--player-color': playerColors[player.id - 1] }"
    >
      <view class="player-header" :style="{ background: playerColors[player.id - 1] }">
        <text class="player-name">{{ player.name }}</text>
        <view v-if="currentPlayerId === player.id" class="current-indicator">当前</view>
      </view>
      <view class="score-area">
        <text class="score-value">{{ player.score }}</text>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ player.stats.foul }}</text>
          <text class="stat-label">犯规</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ player.stats.bonus }}</text>
          <text class="stat-label">伴彩</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ player.stats.normalWin }}</text>
          <text class="stat-label">普胜</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ player.stats.bigGolden }}</text>
          <text class="stat-label">大金</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ player.stats.smallGolden }}</text>
          <text class="stat-label">小金</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ player.stats.goldenNine }}</text>
          <text class="stat-label">黄金九</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Player } from '@/data/types';

const props = defineProps<{
  players: Player[];
  currentPlayerId: number;
}>();

defineEmits<{
  switchPlayer: [playerIndex: number];
}>();

const playerColors = [
  '#1a5276',
  '#8b0000',
  '#2d5a27',
  '#8b7355',
  '#4a235a'
];

function getLayoutClass(): string {
  const count = props.players.length;
  switch (count) {
    case 2: return 'layout-2';
    case 3: return 'layout-3';
    case 4: return 'layout-4';
    case 5: return 'layout-5';
    default: return 'layout-2';
  }
}
</script>

<style lang="scss" scoped>
.score-board {
  padding: 20rpx;
  
  &.layout-2 {
    display: flex;
    gap: 15rpx;
    .player-card { width: calc(50% - 8rpx); }
  }
  
  &.layout-3 {
    display: flex;
    flex-wrap: wrap;
    gap: 15rpx;
    .player-card:nth-child(1), .player-card:nth-child(2) { width: calc(50% - 8rpx); }
    .player-card:nth-child(3) { width: 100%; }
  }
  
  &.layout-4 {
    display: flex;
    flex-wrap: wrap;
    gap: 15rpx;
    .player-card { width: calc(50% - 8rpx); }
  }
  
  &.layout-5 {
    display: flex;
    flex-wrap: wrap;
    gap: 15rpx;
    .player-card:nth-child(-n+3) { width: calc(33.33% - 10rpx); }
    .player-card:nth-child(n+4) { width: calc(50% - 8rpx); }
  }
}

.player-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  overflow: hidden;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    border-color: #ff8c00;
    box-shadow: 0 0 20rpx rgba(255, 140, 0, 0.3);
  }
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  
  .player-name {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.current-indicator {
  background: rgba(255, 255, 255, 0.2);
  padding: 5rpx 15rpx;
  border-radius: 10rpx;
  color: #fff;
  font-size: 22rpx;
}

.score-area {
  padding: 30rpx;
  display: flex;
  justify-content: center;
  background: #000;
}

.score-value {
  color: #ff8c00;
  font-size: 80rpx;
  font-weight: bold;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 15rpx 10rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}

.stat-num {
  color: #ff8c00;
  font-size: 28rpx;
  font-weight: bold;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20rpx;
}
</style>

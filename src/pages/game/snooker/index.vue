<template>
  <view class="game-page">
    <view class="game-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="game-title">斯诺克</text>
      <view class="header-actions">
        <view class="action-btn" @tap="undoAction">撤销</view>
        <view class="action-btn" @tap="resetGame">重置</view>
      </view>
    </view>
    
    <ScoreBoard
      :player1="player1"
      :player2="player2"
      :score1="score1"
      :score2="score2"
      :currentPlayer="currentPlayer"
      :gameType="'斯诺克'"
      :player1ZhaQing="player1ZhaQing"
      :player1JieQing="player1JieQing"
      :player2ZhaQing="player2ZhaQing"
      :player2JieQing="player2JieQing"
      @switch-player="handleSwitchPlayer"
      @add-score="handleAddScore"
      @subtract-score="handleSubtractScore"
      @mark-zha-qing="handleMarkGolden"
      @mark-jie-qing="handleMarkSmallGolden"
    />
    
    <view class="controls-section">
      <view class="control-grid">
        <view class="control-item" @tap="addScore(currentPlayer, 1)">
          <view class="control-icon">+1</view>
          <text>加1分</text>
        </view>
        <view class="control-item" @tap="addScore(currentPlayer, 2)">
          <view class="control-icon">+2</view>
          <text>加2分</text>
        </view>
        <view class="control-item" @tap="addScore(currentPlayer, 3)">
          <view class="control-icon">+3</view>
          <text>加3分</text>
        </view>
        <view class="control-item" @tap="addScore(currentPlayer, 4)">
          <view class="control-icon">+4</view>
          <text>加4分</text>
        </view>
        <view class="control-item" @tap="addScore(currentPlayer, 5)">
          <view class="control-icon">+5</view>
          <text>加5分</text>
        </view>
        <view class="control-item" @tap="addScore(currentPlayer, 6)">
          <view class="control-icon">+6</view>
          <text>加6分</text>
        </view>
        <view class="control-item" @tap="addScore(currentPlayer, 7)">
          <view class="control-icon">+7</view>
          <text>加7分</text>
        </view>
        <view class="control-item" @tap="subtractScore(currentPlayer)">
          <view class="control-icon">-1</view>
          <text>减分</text>
        </view>
        <view class="control-item" @tap="confirmWin">
          <view class="control-icon">🏆</view>
          <text>确认胜利</text>
        </view>
      </view>
    </view>
    
    <view class="banners-section">
      <view class="banner-ad">
        <text class="ad-text">广告位</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ScoreBoard from '@/components/ScoreBoard.vue'

const player1 = ref({ name: '选手1' })
const player2 = ref({ name: '选手2' })
const score1 = ref(0)
const score2 = ref(0)
const currentPlayer = ref(0)

const player1ZhaQing = ref(0)
const player1JieQing = ref(0)
const player2ZhaQing = ref(0)
const player2JieQing = ref(0)

onMounted(() => {
  uni.showModal({
    title: '开始对局',
    editable: true,
    placeholderText: '请输入选手1名称',
    success: (res) => {
      if (res.confirm && res.content) {
        player1.value = { name: res.content }
        uni.showModal({
          title: '开始对局',
          editable: true,
          placeholderText: '请输入选手2名称',
          success: (res2) => {
            if (res2.confirm && res2.content) {
              player2.value = { name: res2.content }
            }
          }
        })
      }
    }
  })
})

function goBack() {
  uni.navigateBack()
}

function undoAction() {
  uni.showToast({ title: '撤销功能开发中', icon: 'none' })
}

function resetGame() {
  score1.value = 0
  score2.value = 0
  currentPlayer.value = 0
  player1ZhaQing.value = 0
  player1JieQing.value = 0
  player2ZhaQing.value = 0
  player2JieQing.value = 0
  uni.showToast({ title: '已重置', icon: 'success' })
}

function addScore(player: number, points: number = 1) {
  if (player === 0) {
    score1.value += points
  } else {
    score2.value += points
  }
}

function subtractScore(player: number) {
  if (player === 0 && score1.value > 0) {
    score1.value--
  } else if (player === 1 && score2.value > 0) {
    score2.value--
  }
}

function handleAddScore(playerIndex: number) {
  addScore(playerIndex, 1)
}

function handleSubtractScore(playerIndex: number) {
  subtractScore(playerIndex)
}

function handleMarkGolden() {}
function handleMarkSmallGolden() {}

function handleSwitchPlayer(playerIndex: number) {
  if (playerIndex !== currentPlayer.value) {
    currentPlayer.value = playerIndex
    uni.showToast({ title: `${currentPlayer.value === 0 ? player1.value.name : player2.value.name}`, icon: 'none' })
  }
}

function confirmWin() {
  const winnerName = currentPlayer.value === 0 ? player1.value.name : player2.value.name
  uni.showModal({
    title: '确认胜利',
    content: `${winnerName} 获胜？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: `${winnerName} 获胜！`, icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.game-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 120rpx;
}

.game-header {
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

.game-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  padding: 15rpx 25rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  
  text {
    color: #fff;
    font-size: 26rpx;
  }
}

.controls-section {
  padding: 20rpx;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.control-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 25rpx 15rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  
  text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 24rpx;
  }
}

.control-icon {
  font-size: 40rpx;
}

.banners-section {
  padding: 20rpx;
}

.banner-ad {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
}

.ad-text {
  color: rgba(255, 255, 255, 0.3);
  font-size: 24rpx;
}
</style>

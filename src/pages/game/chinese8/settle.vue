<template>
  <view class="settle-page">
    <view class="settle-content">
      <view class="result-card">
        <view class="match-info">
          <view class="info-row">
            <text class="info-label">总局数</text>
            <text class="info-value">{{ totalRounds }} 局</text>
          </view>
          <view class="info-row">
            <text class="info-label">总时长</text>
            <text class="info-value">{{ totalTime }}</text>
          </view>
        </view>

        <view class="players-section">
          <view class="player-card" :class="{ winner: matchWinner === 0, draw: matchWinner === -1 }">
            <view class="player-header player-header-1">
              <text class="player-name">{{ matchData.player1Name }}</text>
            </view>
            <view class="player-total-wins">
              <text class="wins-label">总胜场</text>
              <text class="wins-value">{{ player1WinCount }}</text>
            </view>
            <view class="player-stats">
              <view class="stat-item">
                <text class="stat-value">{{ matchData.player1TotalZhaQing }}</text>
                <text class="stat-label">炸清</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ matchData.player1TotalJieQing }}</text>
                <text class="stat-label">接清</text>
              </view>
            </view>
          </view>

          <view class="vs-area">
            <text class="vs-text">VS</text>
          </view>

          <view class="player-card" :class="{ winner: matchWinner === 1, draw: matchWinner === -1 }">
            <view class="player-header player-header-2">
              <text class="player-name">{{ matchData.player2Name }}</text>
            </view>
            <view class="player-total-wins">
              <text class="wins-label">总胜场</text>
              <text class="wins-value">{{ player2WinCount }}</text>
            </view>
            <view class="player-stats">
              <view class="stat-item">
                <text class="stat-value">{{ matchData.player2TotalZhaQing }}</text>
                <text class="stat-label">炸清</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ matchData.player2TotalJieQing }}</text>
                <text class="stat-label">接清</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="records-card">
        <view class="records-header">
          <text class="records-title">比赛记录</text>
          <text class="records-count">共 {{ matchData.records?.length || 0 }} 局</text>
        </view>
        <view class="records-list" v-if="matchData.records && matchData.records.length > 0">
          <view class="record-item" v-for="(record, index) in matchData.records" :key="index">
            <view class="record-left">
              <view class="record-player-info">
                <text class="record-player">{{ record.player1Name }}</text>
                <view class="record-result" :class="{ winner: record.winner === 0, loser: record.winner === 1, draw: record.winner === -1 }">
                  <text>{{ record.winner === 0 ? '胜' : (record.winner === 1 ? '负' : '平') }}</text>
                </view>
              </view>
            </view>
            <view class="record-center-left">
              <text class="record-stats-item">炸清:{{ record.player1ZhaQing }}</text>
              <text class="record-stats-item">接清:{{ record.player1JieQing }}</text>
            </view>
            <view class="record-center">
              <text class="record-score">{{ record.player1Score }}:{{ record.player2Score }}</text>
              <text class="record-time">{{ record.time }}</text>
            </view>
            <view class="record-center-right">
              <text class="record-stats-item">炸清:{{ record.player2ZhaQing }}</text>
              <text class="record-stats-item">接清:{{ record.player2JieQing }}</text>
            </view>
            <view class="record-right">
              <view class="record-player-info">
                <view class="record-result" :class="{ winner: record.winner === 1, loser: record.winner === 0, draw: record.winner === -1 }">
                  <text>{{ record.winner === 1 ? '胜' : (record.winner === 0 ? '负' : '平') }}</text>
                </view>
                <text class="record-player">{{ record.player2Name }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-records" v-else>
          <text class="empty-text">暂无比赛记录</text>
        </view>
      </view>
    </view>

    <view class="settle-footer">
      <view class="footer-btn home-btn" @tap="goHome">
        <text>返回首页</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface MatchRecord {
  player1Name: string
  player2Name: string
  player1Score: number
  player2Score: number
  player1ZhaQing: number
  player1JieQing: number
  player2ZhaQing: number
  player2JieQing: number
  winner: number
  time: string
}

interface MatchData {
  player1Name: string
  player2Name: string
  player1Wins: number
  player2Wins: number
  player1TotalZhaQing: number
  player1TotalJieQing: number
  player2TotalZhaQing: number
  player2TotalJieQing: number
  lastRoundScore1: number
  lastRoundScore2: number
  lastRoundZq1: number
  lastRoundJq1: number
  lastRoundZq2: number
  lastRoundJq2: number
  matchTime: string
  gameMode: string
  winRounds: number
  records: MatchRecord[]
}

const matchData = ref<MatchData>({
  player1Name: '选手1',
  player2Name: '选手2',
  player1Wins: 0,
  player2Wins: 0,
  player1TotalZhaQing: 0,
  player1TotalJieQing: 0,
  player2TotalZhaQing: 0,
  player2TotalJieQing: 0,
  lastRoundScore1: 0,
  lastRoundScore2: 0,
  lastRoundZq1: 0,
  lastRoundJq1: 0,
  lastRoundZq2: 0,
  lastRoundJq2: 0,
  matchTime: '00:00',
  gameMode: 'simple',
  winRounds: 7,
  records: []
})

const player1WinCount = computed(() => {
  return matchData.value.records?.reduce((sum, r) => sum + r.player1Score, 0) || 0
})

const player2WinCount = computed(() => {
  return matchData.value.records?.reduce((sum, r) => sum + r.player2Score, 0) || 0
})

const totalRounds = computed(() => {
  return player1WinCount.value + player2WinCount.value
})

const totalTime = computed(() => {
  const records = matchData.value.records || []
  let totalSeconds = 0
  
  records.forEach(record => {
    const timeParts = record.time.split(':')
    if (timeParts.length === 2) {
      totalSeconds += parseInt(timeParts[0]) * 60 + parseInt(timeParts[1])
    }
  })
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const matchWinner = computed(() => {
  if (player1WinCount.value > player2WinCount.value) return 0
  if (player2WinCount.value > player1WinCount.value) return 1
  return -1
})

const winnerText = computed(() => {
  if (matchWinner.value === 0) return `${matchData.value.player1Name} 获胜！`
  if (matchWinner.value === 1) return `${matchData.value.player2Name} 获胜！`
  return '平局'
})

const gameModeLabel = computed(() => {
  switch (matchData.value.gameMode) {
    case 'timed':
      return '限时模式'
    case 'rounds':
      return `${matchData.value.winRounds * 2 - 1}局${matchData.value.winRounds}胜`
    default:
      return '普通模式'
  }
})

onMounted(() => {
  try {
    const data = uni.getStorageSync('matchSettleData')
    if (data) {
      matchData.value = JSON.parse(data)
      uni.removeStorageSync('matchSettleData')
    }
  } catch (e) {
    console.error('读取结算数据失败', e)
  }
})

function goHome() {
  uni.reLaunch({
    url: '/pages/index/index'
  })
}
</script>

<style lang="scss" scoped>
.settle-page {
  min-height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.settle-header {
  background: linear-gradient(90deg, #cc7000 0%, #4a9eff 100%);
  padding: 30rpx;
  text-align: center;
}

.page-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.settle-content {
  padding: 30rpx 20rpx;
}

.result-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.total-stat-title {
  background: linear-gradient(90deg, #cc7000 0%, #4a9eff 100%);
  padding: 30rpx;
  text-align: center;

  text {
    color: #fff;
    font-size: 36rpx;
    font-weight: bold;
    display: block;
  }
}

.total-stat-subtitle {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 26rpx !important;
  margin-top: 8rpx;
  display: block !important;
}

.players-section {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  gap: 20rpx;
}

.player-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  overflow: hidden;
  border: 3rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &.winner {
    border-color: #4ad964;
    box-shadow: 0 0 30rpx rgba(74, 217, 100, 0.3);
  }

  &.draw {
    border-color: #999;
  }
}

.player-header {
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-header-1 {
  background: #1a70cc;
}

.player-header-2 {
  background: #a52a2a;
}

.player-name {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

.player-result {
  background: rgba(74, 217, 100, 0.2);
  color: #4ad964;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: bold;

  &.lose {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
  }

  &.draw {
    background: rgba(255, 255, 255, 0.1);
    color: #999;
  }
}

.player-total-wins {
  padding: 20rpx;
  text-align: center;
}

.wins-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  display: block;
}

.wins-value {
  color: #cc7000;
  font-size: 56rpx;
  font-weight: bold;
}

.player-stats {
  display: flex;
  justify-content: space-around;
  padding: 15rpx 20rpx 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}

.stat-value {
  color: #4ad964;
  font-size: 28rpx;
  font-weight: bold;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20rpx;
}

.total-stat-title {
  padding: 20rpx 20rpx 10rpx;
  text-align: center;

  text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 26rpx;
  }
}

.vs-area {
  padding: 0 20rpx;
}

.vs-text {
  color: #cc7000;
  font-size: 36rpx;
  font-weight: bold;
}

.match-info {
  background: linear-gradient(90deg, #cc7000 0%, #4a9eff 100%);
  padding: 30rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}

.info-value {
  color: #fff;
  font-size: 26rpx;
}

.records-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  overflow: hidden;
}

.records-header {
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.records-title {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

.records-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.records-list {
  padding: 10rpx 20rpx 20rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);

  &:last-child {
    border-bottom: none;
  }
}

.record-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-center-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.record-center-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  align-items: flex-end;
}

.record-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: flex-end;
}

.record-player-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.record-player {
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
}

.record-result {
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;

  &.winner {
    color: #4ad964;
    background: rgba(74, 217, 100, 0.2);
  }

  &.loser {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.2);
  }

  &.draw {
    color: #999;
    background: rgba(255, 255, 255, 0.1);
  }
}

.record-stats {
  color: rgba(255, 255, 255, 0.5);
  font-size: 20rpx;
}

.record-center {
  padding: 0 15rpx;
  text-align: center;
}

.record-score {
  color: #cc7000;
  font-size: 28rpx;
  font-weight: bold;
  display: block;
}

.record-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 20rpx;
}

.record-stats-item {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.empty-records {
  padding: 60rpx 20rpx;
  text-align: center;
}

.empty-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 26rpx;
}

.settle-footer {
  padding: 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.9);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.footer-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.8;
  }

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.home-btn {
  background: linear-gradient(90deg, #4a9eff 0%, #cc7000 100%);
}
</style>
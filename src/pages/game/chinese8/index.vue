<template>
  <view class="game-page">
    <view class="game-header" v-if="!isLandscape">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="game-title">中式八球</text>
      <view class="header-actions">
        <view class="action-btn" @tap="undoAction">撤销</view>
        <view class="action-btn" @tap="resetGame">重置</view>
      </view>
    </view>
    
    <view class="timer-section" v-if="gameMode === 'timed' && showTimer">
      <view class="timer-display">
        <text class="timer-label">剩余时间</text>
        <text class="timer-value" :class="{ warning: remainingTime <= 300 }">{{ formatTime(remainingTime) }}</text>
      </view>
      <view class="timer-progress">
        <view class="progress-bar" :style="{ width: timerProgress + '%' }"></view>
      </view>
    </view>
    
    <view class="main-content">
      <view class="info-section" v-if="(gameMode === 'simple' || gameMode === 'rounds') && showTimer && !isLandscape">
        <view class="info-content">
          <text class="rounds-label" v-if="gameMode === 'rounds'">{{ winRounds * 2 - 1 }}局{{ winRounds }}胜制</text>
          <text class="info-divider" v-if="gameMode === 'rounds'">|</text>
          <text class="timer-label">比赛用时</text>
          <text class="timer-value">{{ formatTime(elapsedTime) }}</text>
        </view>
      </view>
      
      <view class="layout-portrait" v-if="!isLandscape">
        <view class="portrait-card" :class="{ active: currentPlayer === 0 }" @tap="handleSwitchPlayer(0)">
          <view class="portrait-row">
            <view class="portrait-left">
              <view class="portrait-avatar">
                <text>{{ player1.name.charAt(0) }}</text>
              </view>
              <view class="portrait-info">
                <text class="portrait-name">{{ player1.name }}</text>
              </view>
            </view>
            <view class="portrait-center">
              <view class="portrait-score">{{ score1 }}</view>
            </view>
            <view class="portrait-buttons">
              <view class="portrait-btn plus" @tap.stop="handleAddScore(0)">+</view>
              <view class="portrait-btn minus" @tap.stop="handleSubtractScore(0)">-</view>
            </view>
          </view>
          <view class="portrait-stats">
            <view class="stat-group">
              <view class="stat-btn" @tap.stop="handleSubtractZhaQing(0)">-</view>
              <view class="stat-item">
                <text class="stat-label">炸清:</text>
                <text class="stat-value">{{ player1ZhaQing }}</text>
              </view>
              <view class="stat-btn plus" @tap.stop="handleAddZhaQing(0)">+</view>
            </view>
            <text class="stats-divider">|</text>
            <view class="stat-group">
              <view class="stat-btn" @tap.stop="handleSubtractJieQing(0)">-</view>
              <view class="stat-item">
                <text class="stat-label">接清:</text>
                <text class="stat-value">{{ player1JieQing }}</text>
              </view>
              <view class="stat-btn plus" @tap.stop="handleAddJieQing(0)">+</view>
            </view>
          </view>
        </view>
        
        <view class="portrait-vs">
          <text>VS</text>
        </view>
        
        <view class="portrait-card" :class="{ active: currentPlayer === 1 }" @tap="handleSwitchPlayer(1)">
          <view class="portrait-row">
            <view class="portrait-left">
              <view class="portrait-avatar">
                <text>{{ player2.name.charAt(0) }}</text>
              </view>
              <view class="portrait-info">
                <text class="portrait-name">{{ player2.name }}</text>
              </view>
            </view>
            <view class="portrait-center">
              <view class="portrait-score">{{ score2 }}</view>
            </view>
            <view class="portrait-buttons">
              <view class="portrait-btn plus" @tap.stop="handleAddScore(1)">+</view>
              <view class="portrait-btn minus" @tap.stop="handleSubtractScore(1)">-</view>
            </view>
          </view>
          <view class="portrait-stats">
            <view class="stat-group">
              <view class="stat-btn" @tap.stop="handleSubtractZhaQing(1)">-</view>
              <view class="stat-item">
                <text class="stat-label">炸清:</text>
                <text class="stat-value">{{ player2ZhaQing }}</text>
              </view>
              <view class="stat-btn plus" @tap.stop="handleAddZhaQing(1)">+</view>
            </view>
            <text class="stats-divider">|</text>
            <view class="stat-group">
              <view class="stat-btn" @tap.stop="handleSubtractJieQing(1)">-</view>
              <view class="stat-item">
                <text class="stat-label">接清:</text>
                <text class="stat-value">{{ player2JieQing }}</text>
              </view>
              <view class="stat-btn plus" @tap.stop="handleAddJieQing(1)">+</view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="layout-landscape" v-else>
        <view class="landscape-top">
          <view class="landscape-actions-left">
            <view class="landscape-btn minus" @tap.stop="handleSubtractScore(0)">-</view>
            <view class="landscape-btn plus" @tap.stop="handleAddScore(0)">+</view>
          </view>
          
          <view class="landscape-player-score" :class="{ active: currentPlayer === 0 }">
            <view class="landscape-score">{{ score1 }}</view>
          </view>
          
          <view class="landscape-center">
            <text class="landscape-vs">V</text>
            <text class="landscape-vs">S</text>
          </view>
          
          <view class="landscape-player-score" :class="{ active: currentPlayer === 1 }">
            <view class="landscape-score">{{ score2 }}</view>
          </view>
          
          <view class="landscape-actions-right">
            <view class="landscape-btn minus" @tap.stop="handleSubtractScore(1)">-</view>
            <view class="landscape-btn plus" @tap.stop="handleAddScore(1)">+</view>
          </view>
        </view>
        
        <view class="landscape-bottom">
          <view class="landscape-player-info">
            <text class="landscape-name">{{ player1.name }}</text>
            <text class="landscape-stat">炸清: {{ player1ZhaQing }}</text>
            <text class="landscape-stat">接清: {{ player1JieQing }}</text>
          </view>
          <view class="landscape-divider">|</view>
          <view class="landscape-player-info">
            <text class="landscape-name">{{ player2.name }}</text>
            <text class="landscape-stat">炸清: {{ player2ZhaQing }}</text>
            <text class="landscape-stat">接清: {{ player2JieQing }}</text>
          </view>
        </view>
        
        <view class="landscape-info-bar" v-if="(gameMode === 'simple' || gameMode === 'rounds') && showTimer">
          <text class="landscape-rounds" v-if="gameMode === 'rounds'">{{ winRounds * 2 - 1 }}局{{ winRounds }}胜制</text>
          <text class="landscape-info-divider" v-if="gameMode === 'rounds'">|</text>
          <text class="landscape-timer-label">比赛用时</text>
          <text class="landscape-timer-value">{{ formatTime(elapsedTime) }}</text>
        </view>
      </view>
    </view>
    
    <view class="records-section" v-if="matchRecords.length > 0">
      <view class="records-header">
        <text class="records-title">比赛记录</text>
      </view>
      <view class="records-list">
        <view class="record-summary">
          <text class="summary-player">{{ player1.name }}</text>
          <text class="summary-score">{{ totalStats.player1Wins }}</text>
          <text class="summary-vs">VS</text>
          <text class="summary-score">{{ totalStats.player2Wins }}</text>
          <text class="summary-player">{{ player2.name }}</text>
        </view>
        <view class="record-divider-line"></view>
        <view class="record-item" v-for="(record, index) in matchRecords" :key="index">
          <view class="record-side" :class="{ winner: record.winner === 0 }">
            <text class="record-player">{{ record.player1Name }}</text>
            <text class="record-result" v-if="record.winner === 0">胜</text>
            <text class="record-result" v-else-if="record.winner === 1">负</text>
            <text class="record-result draw" v-else>平</text>
            <text class="record-stats">炸清:{{ record.player1ZhaQing }} 接清:{{ record.player1JieQing }}</text>
          </view>
          <view class="record-divider">
            <text class="divider-score">{{ record.player1Score }}:{{ record.player2Score }}</text>
            <text class="divider-time">{{ record.time }}</text>
          </view>
          <view class="record-side" :class="{ winner: record.winner === 1 }">
            <text class="record-stats">炸清:{{ record.player2ZhaQing }} 接清:{{ record.player2JieQing }}</text>
            <text class="record-result" v-if="record.winner === 1">胜</text>
            <text class="record-result" v-else-if="record.winner === 0">负</text>
            <text class="record-result draw" v-else>平</text>
            <text class="record-player">{{ record.player2Name }}</text>
          </view>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ScoreBoard from '@/components/ScoreBoard.vue'
import { incrementZhaQing, incrementJieQing } from '@/utils/auth'

const gameMode = ref('simple')
const matchTime = ref(60)
const winRounds = ref(7)
const isGameEnded = ref(false)

const player1 = ref({ name: '选手1' })
const player2 = ref({ name: '选手2' })
const score1 = ref(0)
const score2 = ref(0)
const currentPlayer = ref(0)
const showTimer = ref(false)
const remainingTime = ref(0)
const elapsedTime = ref(0)
const player1Wins = ref(0)
const player2Wins = ref(0)

const player1ZhaQing = ref(0)
const player1JieQing = ref(0)
const player2ZhaQing = ref(0)
const player2JieQing = ref(0)

const isLandscape = ref(false)

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

const matchRecords = ref<MatchRecord[]>([])

const totalStats = computed(() => {
  let player1Wins = 0
  let player2Wins = 0
  let player1TotalZhaQing = 0
  let player1TotalJieQing = 0
  let player2TotalZhaQing = 0
  let player2TotalJieQing = 0
  
  matchRecords.value.forEach(record => {
    if (record.winner === 0) {
      player1Wins++
    } else if (record.winner === 1) {
      player2Wins++
    }
    player1TotalZhaQing += record.player1ZhaQing
    player1TotalJieQing += record.player1JieQing
    player2TotalZhaQing += record.player2ZhaQing
    player2TotalJieQing += record.player2JieQing
  })
  
  return {
    player1Wins,
    player2Wins,
    player1TotalZhaQing,
    player1TotalJieQing,
    player2TotalZhaQing,
    player2TotalJieQing
  }
})

let timerInterval: number | null = null

function checkOrientation() {
  isLandscape.value = window.innerWidth > window.innerHeight
}

function handleResize() {
  checkOrientation()
}

const timerProgress = computed(() => {
  if (gameMode.value !== 'timed') return 100
  return (remainingTime.value / (matchTime.value * 60)) * 100
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  
  if (currentPage?.options?.mode) {
    gameMode.value = currentPage.options.mode
  }
  
  if (currentPage?.options?.time) {
    matchTime.value = parseInt(currentPage.options.time)
    remainingTime.value = matchTime.value * 60
    showTimer.value = true
    startTimer()
  }
  
  if (currentPage?.options?.round) {
    winRounds.value = parseInt(currentPage.options.round)
  }
  
  if (gameMode.value === 'simple' || gameMode.value === 'rounds') {
    showTimer.value = true
    startElapsedTimer()
  }
  
  checkOrientation()
  window.addEventListener('resize', handleResize)
  
  setTimeout(() => {
    showPlayerNameInput(1)
  }, 300)

function showPlayerNameInput(playerNum: number) {
  const placeholder = playerNum === 1 ? '请输入选手1名称' : '请输入选手2名称'
  uni.showModal({
    title: '开始对局',
    editable: true,
    placeholderText: placeholder,
    confirmText: '确定',
    cancelText: '使用默认',
    success: (res) => {
      if (res.confirm && res.content) {
        if (playerNum === 1) {
          player1.value = { name: res.content }
        } else {
          player2.value = { name: res.content }
        }
      }
      
      if (playerNum === 1) {
        setTimeout(() => {
          showPlayerNameInput(2)
        }, 200)
      }
    }
  })
}
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  window.removeEventListener('resize', handleResize)
})

function startTimer() {
  timerInterval = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      handleTimeUp()
    }
  }, 1000) as unknown as number
}

function startElapsedTimer() {
  timerInterval = setInterval(() => {
    elapsedTime.value++
  }, 1000) as unknown as number
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function handleTimeUp() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  isGameEnded.value = true
  
  uni.showModal({
    title: '时间到！',
    content: '比赛时间已结束',
    confirmText: '结束比赛',
    showCancel: false,
    success: (res) => {
      if (res.confirm) {
        saveMatchRecord()
      }
    }
  })
}

function saveMatchRecord() {
  let winner = -1
  if (score1.value > score2.value) {
    winner = 0
  } else if (score2.value > score1.value) {
    winner = 1
  }
  
  let matchTimeUsed = elapsedTime.value
  if (gameMode.value === 'timed') {
    matchTimeUsed = matchTime.value * 60 - remainingTime.value
  }
  
  const record: MatchRecord = {
    player1Name: player1.value.name,
    player2Name: player2.value.name,
    player1Score: score1.value,
    player2Score: score2.value,
    player1ZhaQing: player1ZhaQing.value,
    player1JieQing: player1JieQing.value,
    player2ZhaQing: player2ZhaQing.value,
    player2JieQing: player2JieQing.value,
    winner: winner,
    time: formatTime(matchTimeUsed)
  }
  
  matchRecords.value.unshift(record)
}

function endMatch() {
  saveMatchRecord()
  
  let result = ''
  
  if (gameMode.value === 'rounds') {
    if (player1Wins.value > player2Wins.value) {
      result = `${player1.value.name} 以 ${player1Wins.value}:${player2Wins.value} 获胜！`
    } else if (player2Wins.value > player1Wins.value) {
      result = `${player2.value.name} 以 ${player1Wins.value}:${player2Wins.value} 获胜！`
    } else {
      result = '平局！'
    }
  } else {
    if (score1.value > score2.value) {
      result = `${player1.value.name} 以 ${score1.value}:${score2.value} 获胜！`
    } else if (score2.value > score1.value) {
      result = `${player2.value.name} 以 ${score1.value}:${score2.value} 获胜！`
    } else {
      result = '平局！'
    }
  }
  
  uni.showModal({
    title: '比赛结束',
    content: result,
    confirmText: '返回',
    showCancel: false,
    success: (res) => {
      if (res.confirm) {
      }
    }
  })
}

function goBack() {
  if (!isGameEnded.value) {
    stopTimer()
    saveMatchRecord()
    isGameEnded.value = true
  }
  
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({
      delta: 1,
      fail: () => {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    })
  } else {
    uni.reLaunch({ url: '/pages/index/index' })
  }
}

function undoAction() {
  uni.showToast({ title: '撤销功能开发中', icon: 'none' })
}

function resetGame() {
  isGameEnded.value = false
  score1.value = 0
  score2.value = 0
  currentPlayer.value = 0
  player1ZhaQing.value = 0
  player1JieQing.value = 0
  player2ZhaQing.value = 0
  player2JieQing.value = 0
  player1Wins.value = 0
  player2Wins.value = 0
  
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  if (gameMode.value === 'timed') {
    remainingTime.value = matchTime.value * 60
    startTimer()
  } else {
    elapsedTime.value = 0
    startElapsedTimer()
  }
  
  uni.showToast({ title: '已重置', icon: 'success' })
}

function addScore(player: number, points: number = 1) {
  if (player === 0) {
    score1.value += points
  } else {
    score2.value += points
  }
  
  checkRoundWin()
}

function subtractScore(player: number) {
  if (player === 0 && score1.value > 0) {
    score1.value--
  } else if (player === 1 && score2.value > 0) {
    score2.value--
  }
}

function handleAddScore(playerIndex: number) {
  if (isGameEnded.value) return
  addScore(playerIndex)
}

function handleSubtractScore(playerIndex: number) {
  if (isGameEnded.value) return
  subtractScore(playerIndex)
}

function markZhaQing(playerIndex: number) {
  if (isGameEnded.value) return
  if (playerIndex === 0) {
    score1.value += 1
    player1ZhaQing.value++
  } else {
    score2.value += 1
    player2ZhaQing.value++
  }
  incrementZhaQing()
  uni.showToast({ title: '已标记炸清 +1分', icon: 'none' })
  
  checkRoundWin()
}

function handleMarkZhaQing(playerIndex: number) {
  if (isGameEnded.value) return
  markZhaQing(playerIndex)
}

function markJieQing(playerIndex: number) {
  if (isGameEnded.value) return
  if (playerIndex === 0) {
    score1.value += 1
    player1JieQing.value++
  } else {
    score2.value += 1
    player2JieQing.value++
  }
  incrementJieQing()
  uni.showToast({ title: '已标记接清 +1分', icon: 'none' })
  
  checkRoundWin()
}

function handleMarkJieQing(playerIndex: number) {
  if (isGameEnded.value) return
  markJieQing(playerIndex)
}

function handleAddZhaQing(playerIndex: number) {
  if (isGameEnded.value) return
  if (playerIndex === 0) {
    player1ZhaQing.value++
    score1.value++
  } else {
    player2ZhaQing.value++
    score2.value++
  }
  incrementZhaQing()
  uni.showToast({ title: '炸清 +1', icon: 'none' })
  checkRoundWin()
}

function handleSubtractZhaQing(playerIndex: number) {
  if (isGameEnded.value) return
  if (playerIndex === 0 && player1ZhaQing.value > 0) {
    player1ZhaQing.value--
    score1.value--
    uni.showToast({ title: '炸清 -1', icon: 'none' })
  } else if (playerIndex === 1 && player2ZhaQing.value > 0) {
    player2ZhaQing.value--
    score2.value--
    uni.showToast({ title: '炸清 -1', icon: 'none' })
  }
}

function handleAddJieQing(playerIndex: number) {
  if (isGameEnded.value) return
  if (playerIndex === 0) {
    player1JieQing.value++
    score1.value++
  } else {
    player2JieQing.value++
    score2.value++
  }
  incrementJieQing()
  uni.showToast({ title: '接清 +1', icon: 'none' })
  checkRoundWin()
}

function handleSubtractJieQing(playerIndex: number) {
  if (isGameEnded.value) return
  if (playerIndex === 0 && player1JieQing.value > 0) {
    player1JieQing.value--
    score1.value--
    uni.showToast({ title: '接清 -1', icon: 'none' })
  } else if (playerIndex === 1 && player2JieQing.value > 0) {
    player2JieQing.value--
    score2.value--
    uni.showToast({ title: '接清 -1', icon: 'none' })
  }
}

function handleSwitchPlayer(playerIndex: number) {
  if (playerIndex !== currentPlayer.value) {
    currentPlayer.value = playerIndex
    uni.showToast({ title: `${currentPlayer.value === 0 ? player1.value.name : player2.value.name}`, icon: 'none' })
  }
}

function showRoundSettingModal() {
  const roundOptions = [3, 5, 7, 9, 11]
  
  uni.showActionSheet({
    title: '设置抢局数',
    itemList: roundOptions.map(r => `抢${r}`),
    success: (res) => {
      const selectedRound = roundOptions[res.tapIndex]
      winRounds.value = selectedRound
      resetGame()
    },
    fail: () => {
      // 用户取消选择，不做任何操作
    }
  })
}

function checkRoundWin() {
  if (gameMode.value !== 'rounds') return
  if (isGameEnded.value) return
  
  if (score1.value >= winRounds.value) {
    isGameEnded.value = true
    stopTimer()
    saveMatchRecord()
    uni.showModal({
      title: '比赛结束',
      content: `${player1.value.name} 以 ${score1.value}:${score2.value} 赢得比赛！`,
      confirmText: '返回',
      cancelText: '再来一局',
      success: (res) => {
        if (res.cancel) {
          showRoundSettingModal()
        }
      }
    })
  } else if (score2.value >= winRounds.value) {
    isGameEnded.value = true
    stopTimer()
    saveMatchRecord()
    uni.showModal({
      title: '比赛结束',
      content: `${player2.value.name} 以 ${score2.value}:${score1.value} 赢得比赛！`,
      confirmText: '返回',
      cancelText: '再来一局',
      success: (res) => {
        if (res.cancel) {
          showRoundSettingModal()
        }
      }
    })
  }
}

function checkMatchWin() {}


function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.game-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 120rpx;
  overflow-x: hidden;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 0 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 30rpx 30rpx;
}

.game-header-landscape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 20rpx;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
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

.timer-section {
  background: rgba(74, 158, 255, 0.1);
  margin: 0 20rpx 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.timer-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}

.timer-value {
  color: #4a9eff;
  font-size: 48rpx;
  font-weight: bold;
  font-family: monospace;
  
  &.warning {
    color: #ff6b6b;
  }
}

.timer-progress {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff 0%, #4ad964 100%);
  transition: width 1s linear;
}

.info-section {
  background: rgba(74, 158, 255, 0.1);
  margin: 0 20rpx 12rpx;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
}

.info-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15rpx;
}

.rounds-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}

.info-divider {
  color: rgba(255, 255, 255, 0.3);
  font-size: 26rpx;
}

.rounds-progress {
  color: #4a9eff;
  font-size: 32rpx;
  font-weight: bold;
}

.layout-portrait {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 16rpx 20rpx;
}

.portrait-card {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20rpx;
  padding: 18rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.15) 0%, rgba(74, 217, 100, 0.1) 100%);
    border-color: rgba(74, 158, 255, 0.6);
    box-shadow: 0 8rpx 32rpx rgba(74, 158, 255, 0.2);
  }
}

.portrait-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
}

.portrait-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.portrait-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #4ad964 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(74, 158, 255, 0.4);
  
  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.portrait-info {
  display: flex;
  flex-direction: column;
}

.portrait-name {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  font-weight: 600;
}

.portrait-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portrait-score {
  color: #4a9eff;
  font-size: 110rpx;
  font-weight: bold;
  line-height: 1;
  text-shadow: 0 0 30rpx rgba(74, 158, 255, 0.5);
}

.portrait-buttons {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.portrait-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &.plus {
    background: rgba(74, 217, 100, 0.15);
    color: #4ad964;
    border: 2rpx solid rgba(74, 217, 100, 0.4);
    
    &:active {
      transform: scale(0.95);
      background: rgba(74, 217, 100, 0.3);
    }
  }
  
  &.minus {
    background: rgba(255, 107, 107, 0.15);
    color: #ff6b6b;
    border: 2rpx solid rgba(255, 107, 107, 0.4);
    
    &:active {
      transform: scale(0.95);
      background: rgba(255, 107, 107, 0.3);
    }
  }
}

.portrait-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding-top: 12rpx;
  margin-top: 12rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  transition: all 0.2s ease;
  
  &:active {
    background: rgba(74, 158, 255, 0.2);
    transform: scale(0.95);
  }
}

.stat-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 22rpx;
}

.stat-value {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  font-weight: 600;
}

.stats-divider {
  color: rgba(255, 255, 255, 0.25);
  font-size: 24rpx;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  border: 2rpx solid rgba(255, 107, 107, 0.4);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.9);
    background: rgba(255, 107, 107, 0.3);
  }
  
  &.plus {
    background: rgba(74, 217, 100, 0.15);
    color: #4ad964;
    border: 2rpx solid rgba(74, 217, 100, 0.4);
    
    &:active {
      background: rgba(74, 217, 100, 0.3);
    }
  }
}

.portrait-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16rpx;
  
  text {
    color: #4a9eff;
    font-size: 40rpx;
    font-weight: bold;
    text-shadow: 0 0 20rpx rgba(74, 158, 255, 0.6);
  }
}

.layout-landscape {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 8rpx 12rpx;
  height: auto;
  max-height: 700rpx;
}

.landscape-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
  padding: 2rpx 8rpx;
}

.landscape-actions-left,
.landscape-actions-right {
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.landscape-btn {
  width: 50rpx;
  height: 80rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  
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
}

.landscape-player-score {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;
  padding: 10rpx;
  height: 180rpx;
  
  &.active {
    background: rgba(74, 158, 255, 0.15);
    border-color: #4a9eff;
  }
}

.landscape-score {
  color: #4a9eff;
  font-size: 140rpx;
  font-weight: bold;
  line-height: 1;
}

.landscape-bottom {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2rpx 10rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6rpx;
  height: 60rpx;
}

.landscape-player-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}

.landscape-name {
  color: #fff;
  font-size: 20rpx;
  font-weight: bold;
}

.landscape-stat {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16rpx;
}

.landscape-divider {
  color: rgba(255, 255, 255, 0.3);
  font-size: 24rpx;
  margin: 0 20rpx;
}

.landscape-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 30rpx;
  padding: 0 3rpx;
  gap: 1rpx;
  min-width: 30rpx;
}

.landscape-vs {
  color: #4a9eff;
  font-size: 20rpx;
  font-weight: bold;
  line-height: 1.2;
}

.landscape-info-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 3rpx 10rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10rpx;
}

.landscape-rounds {
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
}

.landscape-info-divider {
  color: rgba(255, 255, 255, 0.4);
  font-size: 22rpx;
}

.landscape-timer-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20rpx;
}

.landscape-timer-value {
  color: #4a9eff;
  font-size: 28rpx;
  font-weight: bold;
}

.stats-row {
  display: flex;
  gap: 30rpx;
  
  .stat-item {
    color: rgba(255, 255, 255, 0.7);
    font-size: 24rpx;
  }
}

.vs-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15rpx 30rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12rpx;
}

.vs-text {
  color: #4a9eff;
  font-size: 48rpx;
  font-weight: bold;
}

@media screen and (min-width: 768px) {
  .game-area {
    flex-direction: row;
    align-items: stretch;
    gap: 20rpx;
  }
  
  .player-area {
    flex-direction: column;
    flex: 1;
    gap: 10rpx;
  }
  
  .action-buttons {
    flex-direction: row;
    justify-content: flex-end;
    padding-right: 20rpx;
  }
  
  .player-left .action-buttons {
    justify-content: flex-start;
    padding-left: 20rpx;
  }
  
  .player-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .vs-area {
    flex-direction: column;
    padding: 20rpx 30rpx;
  }
  
  .vs-text {
    font-size: 56rpx;
  }
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

.records-section {
  padding: 0 20rpx 20rpx;
}

.records-header {
  margin-bottom: 16rpx;
}

.records-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  font-weight: 600;
}

.records-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 12rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  }
}

.record-side {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  flex: 1;
  
  &.winner {
    .record-player {
      color: #4ad964;
    }
    
    .record-result {
      color: #4ad964;
      background: rgba(74, 217, 100, 0.15);
    }
  }
}

.record-player {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  font-weight: 600;
}

.record-result {
  color: #ff6b6b;
  font-size: 22rpx;
  font-weight: bold;
  padding: 4rpx 12rpx;
  background: rgba(255, 107, 107, 0.15);
  border-radius: 20rpx;
  
  &.draw {
    color: #999;
    background: rgba(255, 255, 255, 0.1);
  }
}

.record-stats {
  color: rgba(255, 255, 255, 0.55);
  font-size: 22rpx;
}

.record-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12rpx;
  gap: 4rpx;
}

.divider-line {
  color: rgba(255, 255, 255, 0.3);
  font-size: 28rpx;
}

.divider-score {
  color: #4a9eff;
  font-size: 24rpx;
  font-weight: bold;
}

.divider-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 20rpx;
}

.record-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 16rpx;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 12rpx;
  margin-bottom: 8rpx;
}

.summary-player {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  font-weight: 600;
}

.summary-score {
  color: #4a9eff;
  font-size: 48rpx;
  font-weight: bold;
}

.summary-vs {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
}

.record-divider-line {
  height: 1rpx;
  background: rgba(255, 255, 255, 0.1);
  margin: 8rpx 0;
}
</style>

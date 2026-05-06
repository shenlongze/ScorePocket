<template>
  <view class="bracket-page">
    <view class="page-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="page-title">赛事图谱</text>
      <view class="header-actions">
        <view class="action-btn" @tap="generatePoster">
          <text>生成海报</text>
        </view>
      </view>
    </view>
    
    <view class="tournament-info">
      <text class="tournament-name">2024春季台球公开赛</text>
      <text class="tournament-desc">中式八球 · 抢5局 · 单败淘汰 · 4人</text>
    </view>
    
    <scroll-view class="bracket-scroll" scroll-x scroll-y>
      <view class="bracket-container" :class="{ 'double-elimination': tournamentType === 'double' }">
        <view class="bracket-section winners-section" v-if="tournamentType === 'double'">
          <text class="section-label">胜者组</text>
          <view class="bracket-round" v-for="round in winnerRounds" :key="'winner-' + round.round">
            <text class="round-label">第{{ round.round }}轮</text>
            <view class="matches-column">
              <view 
                v-for="match in round.matches" 
                :key="match.id" 
                class="match-box"
                :class="{ completed: match.completed, selected: selectedMatch === match.id }"
                @tap="selectMatch(match)"
              >
                <view class="match-player" :class="{ winner: match.winner === 1 }">
                  <text>{{ match.player1 || '待抽签' }}</text>
                </view>
                <view class="match-score" v-if="match.completed">
                  <text>{{ match.score1 }} - {{ match.score2 }}</text>
                </view>
                <view class="match-player" :class="{ winner: match.winner === 2 }">
                  <text>{{ match.player2 || '待抽签' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="bracket-section main-section">
          <view class="bracket-round" v-for="round in rounds" :key="'round-' + round.round">
            <text class="round-label">第{{ round.round }}轮</text>
            <view class="matches-column">
              <view 
                v-for="match in round.matches" 
                :key="match.id" 
                class="match-box"
                :class="{ completed: match.completed, selected: selectedMatch === match.id }"
                @tap="selectMatch(match)"
              >
                <view class="match-player" :class="{ winner: match.winner === 1 }">
                  <text>{{ match.player1 || '待抽签' }}</text>
                </view>
                <view class="match-score" v-if="match.completed">
                  <text>{{ match.score1 }} - {{ match.score2 }}</text>
                </view>
                <view class="match-player" :class="{ winner: match.winner === 2 }">
                  <text>{{ match.player2 || '待抽签' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="bracket-section losers-section" v-if="tournamentType === 'double'">
          <text class="section-label">败者组</text>
          <view class="bracket-round" v-for="round in loserRounds" :key="'loser-' + round.round">
            <text class="round-label">第{{ round.round }}轮</text>
            <view class="matches-column">
              <view 
                v-for="match in round.matches" 
                :key="match.id" 
                class="match-box"
                :class="{ completed: match.completed, selected: selectedMatch === match.id }"
                @tap="selectMatch(match)"
              >
                <view class="match-player" :class="{ winner: match.winner === 1 }">
                  <text>{{ match.player1 || '待抽签' }}</text>
                </view>
                <view class="match-score" v-if="match.completed">
                  <text>{{ match.score1 }} - {{ match.score2 }}</text>
                </view>
                <view class="match-player" :class="{ winner: match.winner === 2 }">
                  <text>{{ match.player2 || '待抽签' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <view class="score-input-modal" v-if="showScoreInput">
      <view class="modal-content">
        <text class="modal-title">录入比分</text>
        <view class="score-input-section">
          <view class="score-row">
            <text class="player-name">{{ currentMatch?.player1 }}</text>
            <view class="score-controls">
              <view class="score-btn" @tap="adjustScore(1, -1)">-</view>
              <text class="score-value">{{ score1 }}</text>
              <view class="score-btn" @tap="adjustScore(1, 1)">+</view>
            </view>
          </view>
          <view class="score-divider">VS</view>
          <view class="score-row">
            <text class="player-name">{{ currentMatch?.player2 }}</text>
            <view class="score-controls">
              <view class="score-btn" @tap="adjustScore(2, -1)">-</view>
              <text class="score-value">{{ score2 }}</text>
              <view class="score-btn" @tap="adjustScore(2, 1)">+</view>
            </view>
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel" @tap="closeScoreInput">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" @tap="confirmScore">
            <text>确认</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Match {
  id: string
  player1: string
  player2: string
  score1: number
  score2: number
  winner: number | null
  completed: boolean
}

interface Round {
  round: number
  matches: Match[]
}

const tournamentType = ref<'single' | 'double'>('single')
const selectedMatch = ref('')
const showScoreInput = ref(false)
const score1 = ref(0)
const score2 = ref(0)

const currentMatch = ref<Match | null>(null)

const rounds = computed<Round[]>(() => {
  return [
    {
      round: 1,
      matches: [
        { id: 'r1m1', player1: '张三', player2: '李四', score1: 3, score2: 1, winner: 1, completed: true },
        { id: 'r1m2', player1: '王五', player2: '赵六', score1: 2, score2: 3, winner: 2, completed: true }
      ]
    },
    {
      round: 2,
      matches: [
        { id: 'r2m1', player1: '张三', player2: '赵六', score1: 0, score2: 0, winner: null, completed: false }
      ]
    }
  ]
})

const winnerRounds = computed<Round[]>(() => {
  return [
    {
      round: 1,
      matches: [
        { id: 'wr1m1', player1: '张三', player2: '李四', score1: 3, score2: 1, winner: 1, completed: true },
        { id: 'wr1m2', player1: '王五', player2: '赵六', score1: 3, score2: 2, winner: 1, completed: true }
      ]
    },
    {
      round: 2,
      matches: [
        { id: 'wr2m1', player1: '张三', player2: '王五', score1: 3, score2: 0, winner: null, completed: false }
      ]
    }
  ]
})

const loserRounds = computed<Round[]>(() => {
  return [
    {
      round: 1,
      matches: [
        { id: 'lr1m1', player1: '李四', player2: '赵六', score1: 1, score2: 3, winner: 2, completed: true }
      ]
    },
    {
      round: 2,
      matches: [
        { id: 'lr2m1', player1: '赵六', player2: '', score1: 0, score2: 0, winner: null, completed: false }
      ]
    }
  ]
})

function selectMatch(match: Match) {
  if (!match.completed) {
    selectedMatch.value = match.id
    currentMatch.value = match
    score1.value = match.score1
    score2.value = match.score2
    showScoreInput.value = true
  }
}

function adjustScore(player: number, delta: number) {
  if (player === 1) {
    score1.value = Math.max(0, score1.value + delta)
  } else {
    score2.value = Math.max(0, score2.value + delta)
  }
}

function confirmScore() {
  if (score1.value === 0 && score2.value === 0) {
    uni.showToast({ title: '请录入比分', icon: 'none' })
    return
  }
  
  if (score1.value > score2.value) {
    currentMatch.value!.winner = 1
  } else {
    currentMatch.value!.winner = 2
  }
  currentMatch.value!.score1 = score1.value
  currentMatch.value!.score2 = score2.value
  currentMatch.value!.completed = true
  
  closeScoreInput()
  uni.showToast({ title: '比分已录入', icon: 'success' })
}

function closeScoreInput() {
  showScoreInput.value = false
  selectedMatch.value = ''
  currentMatch.value = null
}

function generatePoster() {
  uni.showToast({ title: '海报生成功能开发中', icon: 'none' })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.bracket-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 30rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 20rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: #fff;
    font-size: 48rpx;
  }
}

.page-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  background: rgba(74, 158, 255, 0.2);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  
  text {
    color: #4a9eff;
    font-size: 24rpx;
  }
}

.tournament-info {
  padding: 20rpx 30rpx;
}

.tournament-name {
  display: block;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.tournament-desc {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

.bracket-scroll {
  height: calc(100vh - 200rpx);
  padding: 20rpx;
}

.bracket-container {
  display: flex;
  gap: 30rpx;
  padding-right: 20rpx;
  
  &.double-elimination {
    gap: 20rpx;
  }
}

.bracket-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.section-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  text-align: center;
  margin-bottom: 10rpx;
}

.bracket-round {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.round-label {
  color: #4a9eff;
  font-size: 22rpx;
  text-align: center;
  margin-bottom: 10rpx;
}

.matches-column {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.match-box {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 15rpx;
  border: 2rpx solid transparent;
  min-width: 280rpx;
  
  &.completed {
    background: rgba(74, 217, 100, 0.1);
  }
  
  &.selected {
    border-color: #4a9eff;
  }
}

.match-player {
  padding: 10rpx 15rpx;
  border-radius: 10rpx;
  
  &.winner {
    background: rgba(74, 217, 100, 0.2);
    
    text {
      color: #4cd964;
      font-weight: bold;
    }
  }
  
  text {
    color: #fff;
    font-size: 26rpx;
  }
}

.match-score {
  text-align: center;
  padding: 10rpx 0;
  
  text {
    color: #4a9eff;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.score-input-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1e3a5f 0%, #16213e 100%);
  padding: 40rpx;
  border-radius: 30rpx;
  width: 80%;
}

.modal-title {
  display: block;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.score-input-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.score-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-name {
  color: #fff;
  font-size: 28rpx;
  flex: 1;
}

.score-controls {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.score-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: #fff;
    font-size: 36rpx;
  }
}

.score-value {
  color: #4a9eff;
  font-size: 40rpx;
  font-weight: bold;
  min-width: 60rpx;
  text-align: center;
}

.score-divider {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
  padding: 10rpx 0;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.modal-btn {
  flex: 1;
  padding: 25rpx;
  border-radius: 30rpx;
  text-align: center;
  
  &.cancel {
    background: rgba(255, 255, 255, 0.1);
    
    text {
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  &.confirm {
    background: #4a9eff;
    
    text {
      color: #fff;
    }
  }
  
  text {
    font-size: 28rpx;
    font-weight: bold;
  }
}
</style>

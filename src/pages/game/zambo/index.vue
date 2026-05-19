<template>
  <view class="zambo-page">
    <view class="game-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="game-title">抓迷糊</text>
      <view class="room-code" v-if="roomCode">
        <text>{{ roomCode }}</text>
      </view>
    </view>
    
    <view class="setup-panel" v-if="!gameStarted">
      <view class="setup-item">
        <text class="setup-label">参与人数</text>
        <view class="number-selector">
          <view class="selector-btn" @tap="adjustPlayerCount(-1)">-</view>
          <text class="selector-value">{{ playerCount }}</text>
          <view class="selector-btn" @tap="adjustPlayerCount(1)">+</view>
        </view>
      </view>
      
      <view class="setup-item">
        <text class="setup-label">总球数</text>
        <view class="number-selector">
          <view class="selector-btn" @tap="adjustBallCount(-1)">-</view>
          <text class="selector-value">{{ totalBalls }}</text>
          <view class="selector-btn" @tap="adjustBallCount(1)">+</view>
        </view>
        <text class="setup-hint" v-if="!isMember">会员可自定义</text>
      </view>
      
      <view class="player-list">
        <text class="setup-label">选手列表</text>
        <view class="player-inputs">
          <view 
            v-for="(player, index) in players" 
            :key="index" 
            class="player-input-item"
          >
            <text class="player-index">{{ index + 1 }}</text>
            <input 
              v-model="player.name" 
              class="player-input" 
              :placeholder="`选手${index + 1}`"
            />
          </view>
        </view>
      </view>
      
      <view class="setup-actions">
        <view class="action-btn" @tap="createRoom">
          <text>创建房间</text>
        </view>
        <view class="action-btn primary" @tap="startGame">
          <text>开始游戏</text>
        </view>
      </view>
    </view>
    
    <view class="game-area" v-else>
      <view class="players-status">
        <view 
          v-for="(player, index) in players" 
          :key="index" 
          class="player-status-card"
          :class="{ active: currentPlayer === index, eliminated: player.eliminated }"
        >
          <view class="player-avatar">{{ player.name.charAt(0) }}</view>
          <view class="player-info">
            <text class="player-name">{{ player.name }}</text>
            <text class="player-balls">{{ player.balls.length }}颗专属球</text>
          </view>
          <view class="player-status-badge" v-if="player.eliminated">已淘汰</view>
          <view class="player-status-badge current" v-if="currentPlayer === index && !player.eliminated">当前</view>
        </view>
      </view>
      
      <view class="balls-area">
        <text class="area-title">台面球（点击标记进球）</text>
        <view class="balls-grid">
          <view 
            v-for="ball in allBalls" 
            :key="ball" 
            class="ball-item"
            :class="getBallStatus(ball)"
            @tap="hitBall(ball)"
          >
            <text class="ball-number">{{ ball }}</text>
            <view class="ball-owner" v-if="getBallOwner(ball) !== null">
              <text>{{ getBallOwnerName(getBallOwner(ball)!) }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="game-controls">
        <view class="control-btn" @tap="markFoul">
          <text>⚠️ 犯规</text>
        </view>
        <view class="control-btn" @tap="switchPlayer">
          <text>🔄 换击球</text>
        </view>
        <view class="control-btn danger" @tap="eliminateSelf">
          <text>💀 自己进球（淘汰）</text>
        </view>
      </view>
    </view>
    
    <view class="winner-modal" v-if="winner">
      <view class="modal-content">
        <text class="winner-icon">🏆</text>
        <text class="winner-text">{{ winner }} 获胜！</text>
        <view class="modal-btn" @tap="goBack">
          <text>确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { assignBalls } from '@/utils/gameLogic'

interface Player {
  name: string
  balls: number[]
  eliminated: boolean
}

const playerCount = ref(4)
const totalBalls = ref(15)
const roomCode = ref('')
const gameStarted = ref(false)
const currentPlayer = ref(0)
const winner = ref('')

const isMember = ref(false)

const players = computed(() => {
  const result: Player[] = []
  for (let i = 0; i < playerCount.value; i++) {
    result.push({
      name: `选手${i + 1}`,
      balls: [],
      eliminated: false
    })
  }
  return result
})

const allBalls = computed(() => {
  return Array.from({ length: totalBalls.value }, (_, i) => i + 1)
})

const remainingBalls = ref<number[]>([])
const playerBallsMap = ref<Map<number, number[]>>(new Map())

function adjustPlayerCount(delta: number) {
  const newCount = playerCount.value + delta
  if (newCount >= 3 && newCount <= 10) {
    playerCount.value = newCount
  }
}

function adjustBallCount(delta: number) {
  if (!isMember.value) return
  const newCount = totalBalls.value + delta
  if (newCount >= 3 && newCount <= 20) {
    totalBalls.value = newCount
  }
}

function createRoom() {
  roomCode.value = Math.random().toString(36).substring(2, 8).toUpperCase()
  uni.showToast({ title: `房间码: ${roomCode.value}`, icon: 'none' })
}

function startGame() {
  const validPlayers = players.value.filter(p => p.name.trim())
  if (validPlayers.length < 3) {
    uni.showToast({ title: '请至少输入3位选手', icon: 'none' })
    return
  }
  
  playerBallsMap.value = assignBalls(validPlayers.length, totalBalls.value)
  
  validPlayers.forEach((player, index) => {
    player.balls = playerBallsMap.value.get(index) || []
    player.eliminated = false
  })
  
  remainingBalls.value = [...allBalls.value]
  gameStarted.value = true
}

function getBallStatus(ball: number): string {
  if (!remainingBalls.value.includes(ball)) {
    return 'hit'
  }
  const owner = getBallOwner(ball)
  if (owner !== null) {
    return `owner-${owner}`
  }
  return ''
}

function getBallOwner(ball: number): number | null {
  for (const [playerIndex, balls] of playerBallsMap.value.entries()) {
    if (balls.includes(ball)) {
      return playerIndex
    }
  }
  return null
}

function getBallOwnerName(ownerIndex: number): string {
  const player = players.value[ownerIndex]
  return player ? player.name.charAt(0) : ''
}

function hitBall(ball: number) {
  if (players.value[currentPlayer.value].eliminated) {
    uni.showToast({ title: '当前选手已淘汰', icon: 'none' })
    return
  }
  
  const index = remainingBalls.value.indexOf(ball)
  if (index === -1) return
  
  remainingBalls.value.splice(index, 1)
  
  const owner = getBallOwner(ball)
  
  if (owner === currentPlayer.value) {
    uni.showToast({ title: '打进自己的球！', icon: 'none' })
    eliminateSelf()
    return
  }
  
  if (owner !== null) {
    players.value[owner].balls = players.value[owner].balls.filter(b => b !== ball)
    
    if (players.value[owner].balls.length === 0) {
      players.value[owner].eliminated = true
      uni.showToast({ title: `${players.value[owner].name} 被淘汰！`, icon: 'none' })
    }
  }
  
  checkWinCondition()
}

function eliminateSelf() {
  players.value[currentPlayer.value].eliminated = true
  uni.showToast({ title: `${players.value[currentPlayer.value].name} 被淘汰！`, icon: 'none' })
  
  switchPlayer()
  checkWinCondition()
}

function checkWinCondition() {
  const activePlayers = players.value.filter(p => !p.eliminated)
  
  if (activePlayers.length === 1) {
    winner.value = activePlayers[0].name
  }
}

function markFoul() {
  uni.showActionSheet({
    itemList: ['母球落袋', '空杆', '未碰球'],
    success: (res) => {
      uni.showToast({ title: '已标记犯规，换击球', icon: 'none' })
      switchPlayer()
    }
  })
}

function switchPlayer() {
  const total = players.value.length
  let next = (currentPlayer.value + 1) % total
  
  for (let i = 0; i < total; i++) {
    if (!players.value[next].eliminated) {
      currentPlayer.value = next
      uni.showToast({ title: `${players.value[next].name} 击球`, icon: 'none' })
      return
    }
    next = (next + 1) % total
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.zambo-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  /* #ifdef MP-WEIXIN */
  padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
  /* #endif */
  /* #ifndef MP-WEIXIN */
  padding-bottom: 120rpx;
  /* #endif */
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 20rpx;
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

.game-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.room-code {
  background: rgba(74, 158, 255, 0.2);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  
  text {
    color: #4a9eff;
    font-size: 24rpx;
    font-weight: bold;
  }
}

.setup-panel {
  padding: 30rpx;
}

.setup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.setup-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
}

.setup-hint {
  color: #ff9500;
  font-size: 22rpx;
}

.number-selector {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.selector-btn {
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

.selector-value {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  min-width: 80rpx;
  text-align: center;
}

.player-list {
  padding: 20rpx 0;
}

.player-inputs {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.player-input-item {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.player-index {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a9eff;
  font-size: 22rpx;
  font-weight: bold;
}

.player-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  padding: 15rpx 20rpx;
  border-radius: 15rpx;
  color: #fff;
  font-size: 28rpx;
}

.setup-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.action-btn {
  flex: 1;
  padding: 25rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
  
  &.primary {
    background: #4a9eff;
  }
  
  text {
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.game-area {
  padding: 20rpx;
}

.players-status {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.player-status-card {
  flex: 1;
  min-width: calc(50% - 10rpx);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid transparent;
  
  &.active {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.15);
  }
  
  &.eliminated {
    opacity: 0.5;
  }
}

.player-avatar {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  
  text {
    color: #fff;
    font-size: 22rpx;
    font-weight: bold;
  }
}

.player-info {
  flex: 1;
}

.player-name {
  display: block;
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.player-balls {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}

.player-status-badge {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  
  &.current {
    background: rgba(74, 158, 255, 0.2);
    color: #4a9eff;
  }
}

.balls-area {
  margin-bottom: 30rpx;
}

.area-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-bottom: 15rpx;
  display: block;
}

.balls-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  justify-content: center;
}

.ball-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &.hit {
    opacity: 0.3;
  }
  
  &.owner-0 {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  }
  
  &.owner-1 {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  }
  
  &.owner-2 {
    background: linear-gradient(135deg, #ffe66d 0%, #ffd93d 100%);
    .ball-number { color: #000; }
  }
  
  &.owner-3 {
    background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  }
  
  &.owner-4 {
    background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  }
  
  &.owner-5 {
    background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  }
  
  &.owner-6 {
    background: linear-gradient(135deg, #e17055 0%, #fdcb6e 100%);
    .ball-number { color: #000; }
  }
  
  &.owner-7 {
    background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  }
  
  &.owner-8 {
    background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
  }
  
  &.owner-9 {
    background: linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%);
    .ball-number { color: #000; }
  }
}

.ball-number {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.ball-owner {
  position: absolute;
  bottom: 5rpx;
  font-size: 16rpx;
  color: rgba(255, 255, 255, 0.9);
}

.game-controls {
  display: flex;
  gap: 15rpx;
}

.control-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
  
  &.danger {
    background: rgba(255, 59, 48, 0.2);
  }
  
  text {
    color: #fff;
    font-size: 26rpx;
  }
}

.winner-modal {
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
  padding: 60rpx;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.winner-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.winner-text {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.modal-btn {
  background: #4a9eff;
  padding: 20rpx 60rpx;
  border-radius: 30rpx;
  
  text {
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
  }
}
</style>

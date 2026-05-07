<template>
  <view class="scoreboard-page">
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="game-title">中式九球</text>
      </view>
      <view class="header-actions">
        <view class="action-btn" @tap="undoLastAction">撤销</view>
        <view class="action-btn" @tap="viewRecords">记录</view>
        <view class="action-btn" @tap="resetGame">重置</view>
      </view>
    </view>

    <view class="players-section">
      <view 
        v-for="player in players" 
        :key="player.id"
        :class="['player-card', { active: currentPlayerId === player.id }]"
        :style="{ '--player-color': PLAYER_COLORS[player.id - 1] }"
      >
        <view class="player-header" :style="{ background: PLAYER_COLORS[player.id - 1] }">
          <view class="order-indicator">第{{ playOrder.indexOf(player.id) + 1 }}位</view>
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
            <text class="stat-num">{{ player.stats.normalWin }}</text>
            <text class="stat-label">普胜</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ player.stats.smallGolden }}</text>
            <text class="stat-label">小金</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ player.stats.bigGolden }}</text>
            <text class="stat-label">大金</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ player.stats.goldenNine }}</text>
            <text class="stat-label">黄金九</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ player.stats.bonus }}</text>
            <text class="stat-label">半彩</text>
          </view>
        </view>
      </view>
    </view>

    <view class="timer-area">
      <view class="timer-display">
        <text class="timer-value">{{ formattedTime }}</text>
        <text class="timer-label">{{ timerLabel }}</text>
      </view>
      <view class="round-display">
        <text class="round-value">{{ roundText }}</text>
      </view>
      <view v-if="!isTimerRunning" class="timer-btn" @tap="startTimer">
        开始计时
      </view>
      <view v-else class="timer-btn stop-btn" @tap="stopTimer">
        停止计时
      </view>
    </view>

    <view class="play-order-section">
      <text class="order-label">击球顺序：</text>
      <view class="order-list">
        <view 
          v-for="(playerId, index) in playOrder" 
          :key="playerId"
          :class="['order-item', { active: currentPlayerId === playerId }]"
        >
          <text class="order-player">{{ getPlayerName(playerId) }}</text>
          <text v-if="index < playOrder.length - 1" class="order-arrow">→</text>
        </view>
      </view>
    </view>

    <view class="controls-section">
      <view class="control-btn switch-player-btn" @tap="switchPlayer">
        <text class="btn-icon">🔄</text>
        <text class="btn-text">换选手</text>
      </view>
      <view class="control-btn" @tap="handleFoul">
        <text class="btn-icon">⛔</text>
        <text class="btn-text">犯规</text>
      </view>
      <view class="control-btn" @tap="handleNormalWin">
        <text class="btn-icon">🏆</text>
        <text class="btn-text">普胜</text>
      </view>
      <view class="control-btn" @tap="handleSmallGolden">
        <text class="btn-icon">🥈</text>
        <text class="btn-text">小金</text>
      </view>
      <view 
        class="control-btn" 
        :class="{ disabled: !isGoldenEnabled }" 
        @tap="handleBigGolden"
      >
        <text class="btn-icon">🥇</text>
        <text class="btn-text">大金</text>
      </view>
      <view 
        class="control-btn" 
        :class="{ disabled: !isGoldenEnabled }" 
        @tap="handleGoldenNine"
      >
        <text class="btn-icon">🌟</text>
        <text class="btn-text">黄金九</text>
      </view>
      <view 
        class="control-btn" 
        :class="{ disabled: !config.chainEnabled }" 
        @tap="handleBonusClick"
      >
        <text class="btn-icon">🎁</text>
        <text class="btn-text">半彩</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { MatchConfig, Player } from '@/data/types';
import { PLAYER_COLORS } from '@/data/types';
import { loadConfig, loadPlayers, savePlayers, saveRecords, clearAllGameData } from '@/utils/storage';
import { handleFoul as gameHandleFoul, calculateWinScore, handleBonus, addRecord, getNextPlayer, getPrevPlayer, updatePlayOrder, initPlayOrder, getPlayOrder } from '@/utils/gameLogic';

const config = ref<MatchConfig>(loadConfig());
const players = ref<Player[]>(loadPlayers());
const currentPlayerId = ref(1);
const completedRounds = ref(0);
const currentRound = ref(1);
const roundSettled = ref(false);
const isGoldenEnabled = ref(true);  // 是否允许使用大金/黄金九

const timerSeconds = ref(0);
const isTimerRunning = ref(false);
const isCountdown = ref(false);
let timerInterval: number | null = null;

interface HistoryState {
  players: Player[];
  currentPlayerId: number;
  completedRounds: number;
  currentRound: number;
  roundSettled: boolean;
}
const historyStack = ref<HistoryState[]>([]);

const playOrderTrigger = ref(0);
const playOrder = computed(() => {
  playOrderTrigger.value;
  return getPlayOrder();
});

const formattedTime = computed(() => {
  const seconds = timerSeconds.value;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const timerLabel = computed(() => {
  if (!config.value.gameTime) return '';
  return isCountdown.value ? '倒计时' : '正计时';
});

const roundText = computed(() => {
  if (config.value.gameRounds) {
    const remaining = config.value.gameRounds - completedRounds.value;
    return `剩余 ${remaining} 局`;
  }
  return `已完成 ${completedRounds.value} 局`;
});

onMounted(() => {
  if (players.value.length === 0) {
    players.value = config.value.playerNames.map((name, index) => ({
      id: index + 1,
      name,
      score: config.value.baseScore,
      stats: { foul: 0, bonus: 0, normalWin: 0, bigGolden: 0, smallGolden: 0, goldenNine: 0 },
      currentStreak: 0
    }));
    savePlayers(players.value);
  }
  
  initPlayOrder(config.value.playerCount);
  
  if (config.value.gameTime) {
    timerSeconds.value = config.value.gameTime;
    isCountdown.value = true;
  }
  
  const savedState = uni.getStorageSync('nineball_game_state');
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      currentPlayerId.value = state.currentPlayerId || 1;
      currentRound.value = state.currentRound || 1;
      completedRounds.value = state.completedRounds || 0;
      timerSeconds.value = state.timerSeconds || 0;
      isCountdown.value = state.isCountdown || false;
      isTimerRunning.value = state.isTimerRunning || false;
      if (isTimerRunning.value) {
        startTimer();
      }
    } catch {
      // ignore
    }
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

function goBack() {
  uni.navigateBack();
}

function getPlayerName(playerId: number): string {
  const player = players.value.find(p => p.id === playerId);
  return player ? player.name : `玩家${playerId}`;
}

function viewRecords() {
  uni.navigateTo({ url: '/pages/game/nineball/records' });
}

function resetGame() {
  uni.showModal({
    title: '确认重置',
    content: '确定要重置比赛吗？所有数据将被清除。',
    success: (res) => {
      if (res.confirm) {
        clearAllGameData();
        uni.navigateBack();
      }
    }
  });
}

function startTimer() {
  if (isTimerRunning.value) return;
  
  isTimerRunning.value = true;
  
  timerInterval = setInterval(() => {
    if (isCountdown.value) {
      timerSeconds.value = Math.max(0, timerSeconds.value - 1);
      if (timerSeconds.value === 0) {
        stopTimer();
        uni.showToast({ title: '时间到！', icon: 'none' });
      }
    } else {
      timerSeconds.value++;
    }
    saveGameState();
  }, 1000) as unknown as number;
}

function stopTimer() {
  isTimerRunning.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function saveGameState() {
  uni.setStorageSync('nineball_game_state', JSON.stringify({
    config: config.value,
    players: players.value,
    records: [],
    currentPlayerId: currentPlayerId.value,
    currentRound: currentRound.value,
    completedRounds: completedRounds.value,
    playOrder: Array.from({ length: config.value.playerCount }, (_, i) => i + 1),
    timerSeconds: timerSeconds.value,
    isCountdown: isCountdown.value,
    isTimerRunning: isTimerRunning.value
  }));
}

function saveHistoryState() {
  historyStack.value.push({
    players: JSON.parse(JSON.stringify(players.value)),
    currentPlayerId: currentPlayerId.value,
    completedRounds: completedRounds.value,
    currentRound: currentRound.value,
    roundSettled: roundSettled.value
  });
  if (historyStack.value.length > 50) {
    historyStack.value.shift();
  }
}

function undoLastAction() {
  if (historyStack.value.length === 0) {
    uni.showToast({ title: '没有可撤销的操作', icon: 'none' });
    return;
  }
  
  const lastState = historyStack.value.pop()!;
  players.value = lastState.players;
  currentPlayerId.value = lastState.currentPlayerId;
  completedRounds.value = lastState.completedRounds;
  currentRound.value = lastState.currentRound;
  roundSettled.value = lastState.roundSettled;
  
  savePlayers(players.value);
  saveGameState();
  uni.showToast({ title: '已撤销', icon: 'success' });
}

function handleFoul() {
  saveHistoryState();
  gameHandleFoul(currentPlayerId.value);
  players.value = loadPlayers();
  currentPlayerId.value = getNextPlayer(currentPlayerId.value);
  isGoldenEnabled.value = false;  // 犯规后禁用大金/黄金九
  uni.showToast({ title: '已记录犯规', icon: 'none' });
  saveGameState();
}

function switchPlayer() {
  const nextPlayerId = getNextPlayer(currentPlayerId.value);
  const nextPlayer = players.value.find(p => p.id === nextPlayerId);
  currentPlayerId.value = nextPlayerId;
  isGoldenEnabled.value = false;  // 换选手后禁用大金/黄金九
  saveGameState();
  uni.showToast({ title: `切换到 ${nextPlayer?.name}`, icon: 'none' });
}

function handleBonusClick() {
  saveHistoryState();
  handleBonus(currentPlayerId.value);
  players.value = loadPlayers();
  uni.showToast({ title: '半彩加分', icon: 'none' });
  saveGameState();
}

function handleNormalWin() {
  handleWin('normalWin', '普胜');
}

function handleBigGolden() {
  handleWin('bigGolden', '大金');
}

function handleSmallGolden() {
  handleWin('smallGolden', '小金');
}

function handleGoldenNine() {
  handleWin('goldenNine', '黄金九');
}

function handleWin(scoreType: 'normalWin' | 'bigGolden' | 'smallGolden' | 'goldenNine', label: string) {
  saveHistoryState();
  
  calculateWinScore(scoreType, currentPlayerId.value);
  players.value = loadPlayers();
  
  const player = players.value.find(p => p.id === currentPlayerId.value);
  if (!player) return;
  
  player.stats[scoreType]++;
  
  const otherPlayers = players.value.filter(p => p.id !== currentPlayerId.value);
  
  const scoreValue = config.value.scoreSettings[scoreType];
  const multipliedScore = scoreValue * (config.value.multiplierEnabled ? config.value.multiplier : 1);
  
  const otherScoreText = otherPlayers.map(p => `${p.name}:-${multipliedScore}分`).join(' ');
  
  addRecord({
    type: scoreType,
    playerId: currentPlayerId.value,
    points: multipliedScore,
    description: `${player.name} ${label}，得${multipliedScore}分。${otherScoreText}`
  });
  
  updatePlayOrder(currentPlayerId.value);
  playOrderTrigger.value++;
  completedRounds.value++;
  currentRound.value++;
  isGoldenEnabled.value = true;  // 下一局开始，重新启用大金/黄金九
  
  savePlayers(players.value);
  saveGameState();
  
  uni.showToast({ title: `${player.name} ${label}！`, icon: 'success' });
}
</script>

<style lang="scss" scoped>
.scoreboard-page {
  min-height: 100vh;
  background: #000;
  padding-bottom: 220rpx;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 30rpx 20rpx;
  background: #1a1a2e;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
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

.players-section {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  
  .player-card {
    width: 100%;
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

.order-indicator {
  background: rgba(0, 0, 0, 0.3);
  padding: 5rpx 10rpx;
  border-radius: 8rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 20rpx;
}

.score-area {
  padding: 30rpx;
  display: flex;
  justify-content: center;
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

.timer-area {
  position: fixed;
  right: 20rpx;
  bottom: 240rpx;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12rpx;
  padding: 15rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5rpx;
}

.timer-display {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.timer-value {
  color: #ff8c00;
  font-size: 36rpx;
  font-weight: bold;
  font-family: monospace;
}

.timer-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}

.round-display {
  margin-top: 5rpx;
}

.round-value {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
}

.timer-btn {
  margin-top: 10rpx;
  padding: 10rpx 20rpx;
  background: #ff8c00;
  border-radius: 8rpx;
  color: #fff;
  font-size: 22rpx;
}

.timer-btn.stop-btn {
  background: #dc3545;
}

.play-order-section {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 140rpx;
  padding: 15rpx 20rpx;
  background: rgba(26, 26, 46, 0.95);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  z-index: 90;
}

.order-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 24rpx;
  margin-right: 10rpx;
}

.order-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5rpx;
}

.order-item {
  display: flex;
  align-items: center;
}

.order-player {
  color: #fff;
  font-size: 24rpx;
  padding: 5rpx 10rpx;
  background: rgba(255, 140, 0, 0.2);
  border-radius: 8rpx;
}

.order-item.active .order-player {
  background: rgba(255, 140, 0, 0.5);
  color: #ff8c00;
  font-weight: bold;
}

.order-arrow {
  color: rgba(255, 255, 255, 0.5);
  font-size: 20rpx;
  margin: 0 5rpx;
}

.controls-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #1a1a2e;
  padding: 20rpx;
  gap: 10rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.control-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx 10rpx;
  background: #228b22;
  border-radius: 12rpx;
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.control-btn.disabled {
  background: #666;
  opacity: 0.5;
  pointer-events: none;
}

.control-btn.switch-player-btn {
  background: #1e90ff;
}
</style>

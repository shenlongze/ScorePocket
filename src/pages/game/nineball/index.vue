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
        <view class="action-btn" @tap="resetGame">重置</view>
      </view>
    </view>

    <view class="players-section">
      <view 
        v-for="player in players" 
        :key="player.id"
        :class="['player-card', { active: currentPlayerId === player.id }]"
        :style="{ '--player-color': PLAYER_COLORS[player.id - 1] }"
        @tap="switchToPlayer(player.id)"
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

    <view class="operation-records-section">
      <view class="records-header">
        <view class="records-title">操作记录</view>
        <view class="records-more-btn" @tap="showFullRecords">
          <text>更多</text>
        </view>
      </view>
      <scroll-view class="records-list" scroll-y>
        <view 
          v-for="record in operationRecords" 
          :key="record.id" 
          class="record-item"
          :class="record.action"
        >
          <text class="record-time">{{ record.time }}</text>
          <text class="record-desc">{{ record.description }}</text>
        </view>
        <view v-if="operationRecords.length === 0" class="empty-records">
          <text>暂无操作记录</text>
        </view>
      </scroll-view>
    </view>

    <view class="bottom-info-section">
      <view class="timer-row">
        <text class="timer-value">{{ formattedTime }}</text>
        <text class="round-value">已完成局数: {{ completedRounds }}</text>
        <view class="timer-btn" :class="{ active: isTimerRunning }" @tap="toggleTimer">
          {{ isTimerRunning ? '暂停计时' : '开始计时' }}
        </view>
      </view>
      <view class="play-order-row">
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
    </view>

    <view class="controls-section">
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

    <view v-if="showRecordsModal" class="modal-overlay" @tap="closeRecordsModal">
      <view class="records-modal" @tap.stop>
        <view class="records-modal-header">
          <text class="records-modal-title">操作记录</text>
          <view class="records-modal-close" @tap="closeRecordsModal">
            <text>✕</text>
          </view>
        </view>
        <scroll-view class="records-modal-list" scroll-y>
          <view 
            v-for="record in operationRecords" 
            :key="record.id" 
            class="record-item"
            :class="record.action"
          >
            <text class="record-time">{{ record.time }}</text>
            <text class="record-desc">{{ record.description }}</text>
          </view>
          <view v-if="operationRecords.length === 0" class="empty-records">
            <text>暂无操作记录</text>
          </view>
        </scroll-view>
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

interface OperationRecord {
  id: number;
  time: string;
  action: 'foul' | 'win' | 'golden' | 'switch' | 'bonus' | 'undo' | 'reset';
  description: string;
}

const operationRecords = ref<OperationRecord[]>([]);
let recordId = 0;
const showRecordsModal = ref(false);

function addOperationRecord(action: OperationRecord['action'], description: string) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  operationRecords.value.unshift({
    id: ++recordId,
    time: timeStr,
    action,
    description
  });
  if (operationRecords.value.length > 100) {
    operationRecords.value.pop();
  }
}

function showFullRecords() {
  showRecordsModal.value = true;
}

function closeRecordsModal() {
  showRecordsModal.value = false;
}

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
    } catch {
      // ignore
    }
  }
  isTimerRunning.value = false;
  startTimer();
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

function toggleTimer() {
  if (isTimerRunning.value) {
    stopTimer();
  } else {
    startTimer();
  }
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
  const currentPlayer = players.value.find(p => p.id === currentPlayerId.value);
  gameHandleFoul(currentPlayerId.value);
  players.value = loadPlayers();
  const nextPlayerId = getNextPlayer(currentPlayerId.value);
  const nextPlayer = players.value.find(p => p.id === nextPlayerId);
  currentPlayerId.value = nextPlayerId;
  isGoldenEnabled.value = false;  // 犯规后禁用大金/黄金九
  // 操作记录已经在 gameLogic.ts 中通过 addRecord 添加了
  uni.showToast({ title: '已记录犯规', icon: 'none' });
  saveGameState();
}

function switchToPlayer(playerId: number) {
  const player = players.value.find(p => p.id === playerId);
  if (!player) return;
  const prevPlayer = players.value.find(p => p.id === currentPlayerId.value);
  currentPlayerId.value = playerId;
  isGoldenEnabled.value = false;  // 换选手后禁用大金/黄金九
  addOperationRecord('switch', `切换选手：${prevPlayer?.name || '未知'} → ${player.name}`);
  saveGameState();
  uni.showToast({ title: `切换到 ${player.name}`, icon: 'none' });
}

function handleBonusClick() {
  saveHistoryState();
  const currentPlayer = players.value.find(p => p.id === currentPlayerId.value);
  handleBonus(currentPlayerId.value);
  players.value = loadPlayers();
  addOperationRecord('bonus', `${currentPlayer?.name || '未知'} 半彩加分`);
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
  
  let otherScoreText = '';
  const isPrevOnly = scoreType === 'normalWin' || scoreType === 'smallGolden';
  
  if (isPrevOnly && otherPlayers.length > 0) {
    const prevPlayerId = getPrevPlayer(currentPlayerId.value);
    const prevPlayer = players.value.find(p => p.id === prevPlayerId);
    if (prevPlayer) {
      otherScoreText = `${prevPlayer.name}:-${multipliedScore}分`;
    }
  } else {
    otherScoreText = otherPlayers.map(p => `${p.name}:-${multipliedScore}分`).join(' ');
  }
  
  addRecord({
    type: scoreType,
    playerId: currentPlayerId.value,
    points: multipliedScore,
    description: `${player.name} ${label}，+${multipliedScore}分。${otherScoreText}`
  });
  
  const operationDesc = otherScoreText 
    ? `${player.name} ${label}，+${multipliedScore}分，${otherScoreText}`
    : `${player.name} ${label}，+${multipliedScore}分`;
  const actionType = scoreType === 'normalWin' ? 'win' : 'golden';
  addOperationRecord(actionType, operationDesc);
  
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

.bottom-info-section {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 160rpx;
  background: rgba(26, 26, 46, 0.7);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  z-index: 80;
}

.timer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
}

.timer-value {
  color: #ff8c00;
  font-size: 38rpx;
  font-weight: bold;
  font-family: monospace;
}

.round-value {
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
}

.timer-btn {
  padding: 12rpx 25rpx;
  background: #dc3545;
  border-radius: 8rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.play-order-row {
  display: flex;
  align-items: center;
  padding: 15rpx 30rpx;
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
  padding: 20rpx 15rpx;
  gap: 10rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.control-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 10rpx;
  background: #228b22;
  border-radius: 12rpx;
  min-height: 100rpx;
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
  white-space: nowrap;
}

.control-btn.disabled {
  background: #666;
  opacity: 0.5;
  pointer-events: none;
}

.operation-records-section {
  padding: 15rpx 20rpx;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12rpx;
  margin: 15rpx 20rpx;
  margin-bottom: 280rpx;
  border: 1rpx solid rgba(255, 140, 0, 0.2);
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.records-title {
  color: #ff8c00;
  font-size: 26rpx;
  font-weight: bold;
}

.records-more-btn {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
}

.records-list {
  max-height: 200rpx;
}

.record-item {
  display: flex;
  gap: 15rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
}

.record-time {
  color: rgba(255, 255, 255, 0.4);
  font-size: 22rpx;
  font-family: monospace;
  flex-shrink: 0;
}

.record-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  flex: 1;
}

.record-item.foul .record-desc {
  color: #ff6b6b;
}

.record-item.win .record-desc {
  color: #4ecdc4;
}

.record-item.golden .record-desc {
  color: #ffd93d;
}

.record-item.switch .record-desc {
  color: #4a9eff;
}

.record-item.bonus .record-desc {
  color: #ffd93d;
}

.empty-records {
  text-align: center;
  padding: 20rpx;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.records-modal {
  width: 90%;
  max-height: 70vh;
  background: #1a1a2e;
  border-radius: 20rpx;
  overflow: hidden;
}

.records-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.records-modal-title {
  color: #ff8c00;
  font-size: 32rpx;
  font-weight: bold;
}

.records-modal-close {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 32rpx;
}

.records-modal-list {
  max-height: 60vh;
  padding: 15rpx 30rpx 30rpx;
}
</style>

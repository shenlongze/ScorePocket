<template>
  <view class="scoreboard-page">
    <view class="game-header" :class="{ show: showHeader }">
      <view class="header-left">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="game-title">中式九球</text>
      </view>
      <view class="header-center">
        <view class="menu-btn" @tap="toggleMenu">
          <text>操作</text>
          <text class="menu-arrow">{{ isMenuOpen ? '▲' : '▼' }}</text>
        </view>
        <view class="menu-dropdown" v-if="isMenuOpen">
          <view class="menu-item" @tap.stop="showFullRecords">操作记录</view>
          <view class="menu-item" @tap.stop="toggleRecords">显示/隐藏记录</view>
          <view class="menu-item" @tap.stop="toggleTimerBar">显示/隐藏计时</view>
        </view>
      </view>
      <view class="header-actions">
        <view class="action-btn" @tap="undoLastAction">撤销</view>
        <view class="action-btn" @tap="resetGame">重置</view>
      </view>
    </view>

    <view
      class="main-content"
      :class="{ 'header-shown': showHeader, 'landscape-content': isLandscape }"
    >
      <!-- 竖屏布局 -->
      <view class="layout-portrait" v-if="!isLandscape">
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
            <text class="round-value">局数: {{ completedRounds }}/{{ config.gameRounds || '-' }}</text>
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
      </view>

      <!-- 横屏布局 -->
      <view class="layout-landscape" v-else>
        <view class="landscape-top-bar" v-if="showTimerBar">
          <view class="landscape-timer-info">
            <text class="timer-value">{{ formattedTime }}</text>
            <text class="round-value">局数: {{ completedRounds }}/{{ config.gameRounds || '-' }}</text>
          </view>
          <view class="timer-btn" :class="{ active: isTimerRunning }" @tap.stop="toggleTimer">
            {{ isTimerRunning ? '暂停计时' : '开始计时' }}
          </view>
          <view class="toggle-timer-btn" @tap.stop="toggleTimerBar">
            <text>隐藏计时</text>
          </view>
        </view>

        <view class="landscape-players-container">
          <view
            v-for="player in players"
            :key="player.id"
            :class="[
              'player-card',
              'landscape-player-card',
              { active: currentPlayerId === player.id },
            ]"
            :style="{ '--player-color': PLAYER_COLORS[player.id - 1] }"
            @tap.stop="switchToPlayer(player.id)"
          >
            <view class="player-header" :style="{ background: PLAYER_COLORS[player.id - 1] }">
              <text class="player-name">{{ player.name }}</text>
              <view v-if="currentPlayerId === player.id" class="current-indicator">当前</view>
            </view>
            <view class="score-area">
              <text class="score-value">{{ player.score }}</text>
            </view>
            <view class="stats-row" :class="{ 'horizontal-stats': shouldShowHorizontalStats }">
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
            </view>
          </view>
        </view>

        <view class="landscape-controls">
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
          <view class="control-btn" :class="{ disabled: !isGoldenEnabled }" @tap="handleBigGolden">
            <text class="btn-icon">🥇</text>
            <text class="btn-text">大金</text>
          </view>
          <view class="control-btn" :class="{ disabled: !isGoldenEnabled }" @tap="handleGoldenNine">
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

        <view class="landscape-bottom-bar">
          <view class="bottom-left">
            <text class="timer-info">{{ formattedTime }}</text>
            <text class="round-info"
              >局数: {{ completedRounds }}/{{ config.gameRounds || '-' }}</text
            >
          </view>
          <view class="bottom-right">
            <view class="more-btn" @tap="toggleMoreMenu">{{
              showMoreMenu ? '收起 ▲' : '更多 ▼'
            }}</view>
            <view class="more-menu" v-if="showMoreMenu">
              <view class="more-item record-item" @tap="showFullRecordsFromMore">操作记录</view>
              <view class="more-item reset-item" @tap="handleReset">重置</view>
              <view class="more-item settle-item" @tap="handleSettle">结算</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 竖屏操作按钮 -->
    <view class="controls-section" v-if="!isLandscape">
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
      <view class="control-btn" :class="{ disabled: !isGoldenEnabled }" @tap="handleBigGolden">
        <text class="btn-icon">🥇</text>
        <text class="btn-text">大金</text>
      </view>
      <view class="control-btn" :class="{ disabled: !isGoldenEnabled }" @tap="handleGoldenNine">
        <text class="btn-icon">🌟</text>
        <text class="btn-text">黄金九</text>
      </view>
      <view class="control-btn" :class="{ disabled: !config.chainEnabled }" @tap="handleBonusClick">
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
import {
  loadConfig,
  loadPlayers,
  savePlayers,
  saveRecords,
  clearAllGameData,
} from '@/utils/storage';
import {
  handleFoul as gameHandleFoul,
  calculateWinScore,
  handleBonus,
  addRecord,
  getNextPlayer,
  getPrevPlayer,
  updatePlayOrder,
  initPlayOrder,
  getPlayOrder,
} from '@/utils/gameLogic';

const config = ref<MatchConfig>(loadConfig());
const players = ref<Player[]>(loadPlayers());
const currentPlayerId = ref(1);
const completedRounds = ref(0);
const currentRound = ref(1);
const roundSettled = ref(false);
const isGoldenEnabled = ref(true);

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

const shouldShowHorizontalStats = computed(() => {
  return players.value.length <= 3;
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

// 横屏状态
const isLandscape = ref(false);
const showActions = ref(false);
const showHeader = ref(false);
const showRecords = ref(true);
const showTimerBar = ref(false);
const isMenuOpen = ref(false);
const showMoreMenu = ref(false);
let hideTimer: number | null = null;

// 屏幕尺寸
const screenWidth = ref(0);
const screenHeight = ref(0);
const availableHeight = ref(0);
const headerHeight = ref(44);
const controlsHeight = ref(80);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function addOperationRecord(action: OperationRecord['action'], description: string) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  operationRecords.value.unshift({
    id: ++recordId,
    time: timeStr,
    action,
    description,
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

function checkOrientation() {
  const sysInfo = uni.getSystemInfoSync();
  isLandscape.value = sysInfo.windowWidth > sysInfo.windowHeight;
}

function updateScreenSize() {
  const sysInfo = uni.getSystemInfoSync();
  screenWidth.value = sysInfo.windowWidth;
  screenHeight.value = sysInfo.windowHeight;
  availableHeight.value = sysInfo.windowHeight;
}

function handleResize() {
  checkOrientation();
  updateScreenSize();
}

onMounted(() => {
  if (players.value.length === 0) {
    players.value = config.value.playerNames.map((name, index) => ({
      id: index + 1,
      name,
      score: config.value.baseScore,
      stats: { foul: 0, bonus: 0, normalWin: 0, bigGolden: 0, smallGolden: 0, goldenNine: 0 },
      currentStreak: 0,
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

  // 横屏检测
  checkOrientation();
  updateScreenSize();
  uni.onWindowResize(handleResize);
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  uni.offWindowResize(handleResize);
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
});

function goBack() {
  uni.navigateBack();
}

function getPlayerName(playerId: number): string {
  const player = players.value.find((p) => p.id === playerId);
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
    },
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
  uni.setStorageSync(
    'nineball_game_state',
    JSON.stringify({
      config: config.value,
      players: players.value,
      records: [],
      currentPlayerId: currentPlayerId.value,
      currentRound: currentRound.value,
      completedRounds: completedRounds.value,
      playOrder: Array.from({ length: config.value.playerCount }, (_, i) => i + 1),
      timerSeconds: timerSeconds.value,
      isCountdown: isCountdown.value,
      isTimerRunning: isTimerRunning.value,
    })
  );
}

function saveHistoryState() {
  historyStack.value.push({
    players: JSON.parse(JSON.stringify(players.value)),
    currentPlayerId: currentPlayerId.value,
    completedRounds: completedRounds.value,
    currentRound: currentRound.value,
    roundSettled: roundSettled.value,
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
  const currentPlayer = players.value.find((p) => p.id === currentPlayerId.value);
  gameHandleFoul(currentPlayerId.value);
  players.value = loadPlayers();
  const nextPlayerId = getNextPlayer(currentPlayerId.value);
  const nextPlayer = players.value.find((p) => p.id === nextPlayerId);
  currentPlayerId.value = nextPlayerId;
  isGoldenEnabled.value = false;
  uni.showToast({ title: '已记录犯规', icon: 'none' });
  saveGameState();
}

function switchToPlayer(playerId: number) {
  const player = players.value.find((p) => p.id === playerId);
  if (!player) return;
  const prevPlayer = players.value.find((p) => p.id === currentPlayerId.value);
  currentPlayerId.value = playerId;
  isGoldenEnabled.value = false;
  addOperationRecord('switch', `切换选手：${prevPlayer?.name || '未知'} → ${player.name}`);
  saveGameState();

  if (isLandscape.value) {
    showActions.value = true;
    resetHideTimer();
  }
}

function handleBonusClick() {
  saveHistoryState();
  const currentPlayer = players.value.find((p) => p.id === currentPlayerId.value);
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

function handleWin(
  scoreType: 'normalWin' | 'bigGolden' | 'smallGolden' | 'goldenNine',
  label: string
) {
  saveHistoryState();

  calculateWinScore(scoreType, currentPlayerId.value);
  players.value = loadPlayers();

  const player = players.value.find((p) => p.id === currentPlayerId.value);
  if (!player) return;

  player.stats[scoreType]++;

  const otherPlayers = players.value.filter((p) => p.id !== currentPlayerId.value);

  const scoreValue = config.value.scoreSettings[scoreType];
  const multipliedScore =
    scoreValue * (config.value.multiplierEnabled ? config.value.multiplier : 1);

  let otherScoreText = '';
  const isPrevOnly = scoreType === 'normalWin' || scoreType === 'smallGolden';

  if (isPrevOnly && otherPlayers.length > 0) {
    const prevPlayerId = getPrevPlayer(currentPlayerId.value);
    const prevPlayer = players.value.find((p) => p.id === prevPlayerId);
    if (prevPlayer) {
      otherScoreText = `${prevPlayer.name}:-${multipliedScore}分`;
    }
  } else {
    otherScoreText = otherPlayers.map((p) => `${p.name}:-${multipliedScore}分`).join(' ');
  }

  addRecord({
    type: scoreType,
    playerId: currentPlayerId.value,
    points: multipliedScore,
    description: `${player.name} ${label}，+${multipliedScore}分。${otherScoreText}`,
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
  isGoldenEnabled.value = true;

  savePlayers(players.value);
  saveGameState();

  uni.showToast({ title: `${player.name} ${label}！`, icon: 'success' });
}

// 横屏模式下的操作按钮控制
function toggleActions() {
  showActions.value = true;
  showHeader.value = true;
  resetHideTimer();
}

function toggleTimerBar() {
  showTimerBar.value = !showTimerBar.value;
}

function toggleRecords() {
  showRecords.value = !showRecords.value;
}

function resetHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
  hideTimer = setTimeout(() => {
    showActions.value = false;
    showHeader.value = false;
  }, 3000) as unknown as number;
}

function toggleMoreMenu() {
  showMoreMenu.value = !showMoreMenu.value;
}

function showFullRecordsFromMore() {
  showMoreMenu.value = false;
  showRecordsModal.value = true;
}

function handleReset() {
  showMoreMenu.value = false;
  uni.showModal({
    title: '确认重置',
    content: '确定要重置比赛吗？所有数据将被清除。',
    success: (res) => {
      if (res.confirm) {
        clearAllGameData();
        uni.navigateBack();
      }
    },
  });
}

function handleSettle() {
  showMoreMenu.value = false;
  const sortedPlayers = [...players.value].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  let resultText = `比赛结束！\n\n`;
  sortedPlayers.forEach((player, index) => {
    resultText += `${index + 1}. ${player.name}: ${player.score}分\n`;
  });
  resultText += `\n冠军: ${winner.name}`;

  uni.showModal({
    title: '比赛结算',
    content: resultText,
    showCancel: false,
    success: () => {
      clearAllGameData();
      uni.navigateBack();
    },
  });
}
</script>

<style lang="scss" scoped>
.scoreboard-page {
  min-height: 100vh;
  background: #000;
}

.game-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 20rpx;
  background: rgba(26, 26, 46, 0.9);
  transform: translateY(-100%);
  transition: transform 0.3s ease;

  &.show {
    transform: translateY(0);
  }

  .header-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-center {
  position: relative;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 25rpx;
  background: rgba(255, 140, 0, 0.3);
  border-radius: 20rpx;

  text {
    color: #ff8c00;
    font-size: 26rpx;
    font-weight: bold;
  }

  .menu-arrow {
    font-size: 20rpx;
    color: rgba(255, 140, 0, 0.8);
  }
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10rpx;
  background: rgba(26, 26, 46, 0.98);
  border-radius: 12rpx;
  min-width: 200rpx;
  padding: 10rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.5);
}

.menu-item {
  padding: 15rpx 30rpx;
  text-align: center;

  text {
    color: #fff;
    font-size: 26rpx;
  }

  &:active {
    background: rgba(255, 140, 0, 0.2);
  }
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

.main-content {
  padding-bottom: 220rpx;
  transition: padding-top 0.3s ease;
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;

  &.landscape-content {
    padding-bottom: 0;
    height: 100vh;
  }
}

.main-content.header-shown {
  padding-top: 120rpx;
}

.layout-portrait {
  padding: 20rpx;
}

.layout-landscape {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 10rpx;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}

.landscape-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 20rpx;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12rpx;
}

.landscape-timer-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.toggle-timer-btn {
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;

  text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 22rpx;
  }
}

.landscape-players-container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 10rpx;
  flex: 1;
  min-height: 0;
  max-height: calc(100vh - 140rpx);
}

.landscape-player-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;

  .score-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60rpx;
  }
}

.landscape-play-order {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12rpx;
}

.players-section {
  display: flex;
  flex-direction: column;
  gap: 15rpx;

  .player-card {
    width: 100%;
  }
}

.player-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx 16rpx 0 0;
  overflow: hidden;
  border: 3rpx solid transparent;
  border-bottom: none;
  transition: all 0.3s ease;

  &.active {
    border-color: #ff8c00;
    box-shadow: 0 0 20rpx rgba(255, 140, 0, 0.3);
    border-bottom-color: transparent;
  }
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 8rpx;

  .player-name {
    color: #fff;
    font-size: 24rpx;
    font-weight: bold;
  }
}

.current-indicator {
  background: rgba(255, 255, 255, 0.2);
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  color: #fff;
  font-size: 16rpx;
}

.order-indicator {
  background: rgba(0, 0, 0, 0.3);
  padding: 5rpx 10rpx;
  border-radius: 8rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 20rpx;
}

.score-area {
  padding: 2rpx;
  display: flex;
  justify-content: center;
}

.score-value {
  color: #ff8c00;
  font-size: 48rpx;
  font-weight: bold;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 3rpx 4rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rpx;
}

.stat-num {
  color: #ff8c00;
  font-size: 16rpx;
  font-weight: bold;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12rpx;
}

.landscape-player-card .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rpx;
}

.landscape-player-card .stat-label {
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10rpx;
  letter-spacing: 1rpx;
}

.landscape-player-card .horizontal-stats {
  flex-wrap: wrap;
}

.landscape-player-card .horizontal-stats .stat-item {
  flex-direction: column;
  align-items: center;
}

.landscape-player-card .horizontal-stats .stat-label {
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  font-size: 12rpx;
  letter-spacing: normal;
}

.bottom-info-section {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 180rpx;
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

.landscape-controls {
  display: flex;
  background: rgba(26, 26, 46, 0.95);
  padding: 4rpx 8rpx;
  gap: 4rpx;
  border-radius: 16rpx 16rpx 0 0;
  margin-top: -3rpx;
  max-height: 60rpx;
}

.landscape-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rpx 10rpx;
  padding-bottom: calc(3rpx + env(safe-area-inset-bottom));
  background: rgba(26, 26, 46, 0.98);
  border-radius: 0 0 16rpx 16rpx;
  max-height: 28rpx;
}

.bottom-left {
  display: flex;
  gap: 20rpx;
}

.round-info,
.timer-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14rpx;
  font-family: monospace;
}

.bottom-right {
  position: relative;
}

.more-btn {
  padding: 2rpx 6rpx;
  background: rgba(255, 140, 0, 0.3);
  border-radius: 3rpx;
  color: #ff8c00;
  font-size: 14rpx;
}

.more-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 10rpx;
  background: rgba(26, 26, 46, 0.98);
  border-radius: 12rpx;
  padding: 10rpx 0;
  min-width: 150rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.5);
}

.more-item {
  padding: 8rpx 15rpx;
  color: #fff;
  font-size: 18rpx;
  text-align: left;

  &:active {
    background: rgba(255, 140, 0, 0.2);
  }

  &.record-item {
    color: #ffd700;
  }

  &.reset-item {
    color: #ff6b6b;
  }

  &.settle-item {
    color: #4ecdc4;
  }
}

.control-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rpx;
  padding: 2rpx 2rpx;
  background: #228b22;
  border-radius: 4rpx;
  min-height: 40rpx;
}

.btn-icon {
  font-size: 16rpx;
}

.btn-text {
  color: #fff;
  font-size: 14rpx;
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

.operation-records-section.landscape-records {
  margin-bottom: 120rpx;
  max-height: 150rpx;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.records-header-right {
  display: flex;
  gap: 10rpx;
}

.records-title {
  color: #ff8c00;
  font-size: 26rpx;
  font-weight: bold;
}

.toggle-records-btn {
  padding: 6rpx 14rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;

  text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 22rpx;
  }
}

.show-records-btn {
  text-align: center;
  padding: 15rpx;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12rpx;
  margin: 15rpx 20rpx;
  margin-bottom: 120rpx;
  border: 1rpx solid rgba(255, 140, 0, 0.2);

  text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 24rpx;
  }
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
  width: 85%;
  height: 60vh;
  max-height: 600rpx;
  background: #1a1a2e;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.records-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.records-modal-title {
  color: #ff8c00;
  font-size: 26rpx;
  font-weight: bold;
}

.records-modal-close {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}

.records-modal-list {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx 30rpx 30rpx;
}
</style>

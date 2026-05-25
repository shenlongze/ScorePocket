<template>
  <view class="chinese8-container">
    <view class="game-page" @tap="toggleActions">
      <view class="game-header" :class="{ show: showHeader }">
        <view class="back-btn" @tap.stop="goBack">
          <text>‹</text>
        </view>
        <text class="game-title">中式八球</text>
        <view class="header-actions">
          <view
            class="action-btn"
            @tap.stop="
              undoAction;
              showActions = true;
              showHeader = true;
              resetHideTimer;
            "
            >撤销</view
          >
          <view
            class="action-btn"
            @tap.stop="
              resetGame;
              showActions = true;
              showHeader = true;
              resetHideTimer;
            "
            >重置</view
          >
        </view>
      </view>

      <view
        class="timer-section"
        v-if="gameMode === 'timed' && showTimer"
        :class="{ 'header-shown': showHeader }"
      >
        <view class="timer-display">
          <text class="timer-label">剩余时间</text>
          <text class="timer-value" :class="{ warning: remainingTime <= 300 }">{{
            formatTime(remainingTime)
          }}</text>
        </view>
        <view class="timer-progress">
          <view class="progress-bar" :style="{ width: timerProgress + '%' }"></view>
        </view>
      </view>

      <view class="main-content" :class="{ 'header-shown': showHeader }">
        <view
          class="info-section"
          v-if="(gameMode === 'simple' || gameMode === 'rounds') && showTimer && !isLandscape"
        >
          <view class="info-content">
            <text class="rounds-label" v-if="gameMode === 'rounds'"
              >{{ winRounds * 2 - 1 }}局{{ winRounds }}胜制</text
            >
            <text class="info-divider" v-if="gameMode === 'rounds'">|</text>
            <text class="timer-label">比赛用时</text>
            <text class="timer-value">{{ formatTime(elapsedTime) }}</text>
          </view>
        </view>

        <view class="layout-portrait" v-if="!isLandscape">
          <view
            v-for="(player, index) in players"
            :key="player.id"
            class="portrait-card"
            :class="{ active: currentPlayer === index }"
            @tap.stop="switchToPlayer(index)"
          >
            <view class="portrait-header" :class="`portrait-header-player${(index % 4) + 1}`">
              <view class="portrait-order-indicator">第{{ getPlayerRank(index) }}位</view>
              <text class="portrait-player-name">{{ player.name }}</text>
            </view>
            <view class="portrait-score-area">
              <view class="portrait-score">{{ player.score }}</view>
            </view>
            <view class="portrait-stats-row">
              <view class="portrait-stat-item">
                <text class="stat-num">{{ player.zhaQing }}</text>
                <text class="stat-label">炸清</text>
              </view>
              <view class="portrait-stat-item">
                <text class="stat-num">{{ player.jieQing }}</text>
                <text class="stat-label">接清</text>
              </view>
            </view>
          </view>
        </view>

        <view class="layout-landscape" v-else @tap="toggleActions">
          <view class="landscape-players-container">
            <view
              v-for="(player, index) in players"
              :key="player.id"
              class="portrait-card landscape-player-card"
              :class="{ active: currentPlayer === index }"
              @tap.stop="switchToPlayer(index)"
            >
              <view class="portrait-header" :class="`portrait-header-player${(index % 4) + 1}`">
                <text class="portrait-player-name">{{ player.name }}</text>
              </view>
              <view class="portrait-score-area">
                <view class="portrait-score">{{ player.score }}</view>
              </view>
              <view class="portrait-stats-row">
                <view class="portrait-stat-item">
                  <text class="stat-num">{{ player.zhaQing }}</text>
                  <text class="stat-label">炸清</text>
                </view>
                <view class="portrait-stat-item">
                  <text class="stat-num">{{ player.jieQing }}</text>
                  <text class="stat-label">接清</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="operation-records-section" v-if="!isLandscape">
          <view class="records-header">
            <view class="records-title">操作记录</view>
            <view
              class="records-more-btn"
              @tap.stop="
                showFullRecords;
                resetHideTimer;
              "
            >
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

        <view class="bottom-actions show" v-if="!isLandscape">
          <view class="action-btn-wrap">
            <view class="bottom-btn plus-btn" @tap.stop="handleAddScore(currentPlayer)">
              <text>加分</text>
            </view>
            <view class="bottom-btn minus-btn" @tap.stop="handleSubtractScore(currentPlayer)">
              <text>减分</text>
            </view>
            <view class="bottom-btn zhaqing-btn" @tap.stop="handleAddZhaQing(currentPlayer)">
              <text>炸清</text>
            </view>
            <view class="bottom-btn jieqing-btn" @tap.stop="handleAddJieQing(currentPlayer)">
              <text>接清</text>
            </view>
            <view class="bottom-btn settle-btn" @tap.stop="handleSettle">
              <text>结算</text>
            </view>
          </view>
        </view>

        <view
          class="bottom-actions landscape-bottom-actions"
          :class="{ show: showActions }"
          v-if="isLandscape"
        >
          <view class="action-btn-wrap">
            <view
              class="bottom-btn plus-btn"
              @tap.stop="
                () => {
                  handleAddScore(currentPlayer);
                  resetHideTimer();
                }
              "
            >
              <text>加分</text>
            </view>
            <view
              class="bottom-btn minus-btn"
              @tap.stop="
                () => {
                  handleSubtractScore(currentPlayer);
                  resetHideTimer();
                }
              "
            >
              <text>减分</text>
            </view>
            <view
              class="bottom-btn zhaqing-btn"
              @tap.stop="
                () => {
                  handleAddZhaQing(currentPlayer);
                  resetHideTimer();
                }
              "
            >
              <text>炸清</text>
            </view>
            <view
              class="bottom-btn jieqing-btn"
              @tap.stop="
                () => {
                  handleAddJieQing(currentPlayer);
                  resetHideTimer();
                }
              "
            >
              <text>接清</text>
            </view>
            <view class="bottom-btn settle-btn" @tap.stop="handleSettle">
              <text>结算</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showRecordsModal" class="modal-overlay" @tap="closeRecordsModal">
      <view class="records-modal" @tap.stop>
        <view class="records-modal-header">
          <text class="records-modal-title">完整操作记录</text>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { PLAYER_COLORS } from '@/data/types';

interface Player {
  id: number;
  name: string;
  score: number;
  zhaQing: number;
  jieQing: number;
  wins: number;
}

const gameMode = ref('simple');
const matchTime = ref(60);
const winRounds = ref(7);
const playerCount = ref(2);
const isGameEnded = ref(false);

const players = ref<Player[]>([]);
const currentPlayer = ref(0);
const showTimer = ref(false);
const remainingTime = ref(0);
const elapsedTime = ref(0);

const isLandscape = ref(false);
const showActions = ref(false);
const showHeader = ref(false);
let hideTimer: number | null = null;

const lastRoundStartTime = ref(0);
const roundHistory = ref<any[]>([]);

interface GameState {
  players: Player[];
  currentPlayer: number;
}

const historyStack = ref<GameState[]>([]);

interface OperationRecord {
  id: number;
  time: string;
  action: 'add' | 'subtract' | 'zhaqing' | 'jieqing' | 'switch' | 'undo' | 'settle';
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

const matchRecords = ref<any[]>([]);

let timerInterval: number | null = null;

function checkOrientation() {
  const sysInfo = uni.getSystemInfoSync();
  isLandscape.value = sysInfo.windowWidth > sysInfo.windowHeight;
}

function handleResize() {
  checkOrientation();
}

const timerProgress = computed(() => {
  if (gameMode.value !== 'timed') return 100;
  return (remainingTime.value / (matchTime.value * 60)) * 100;
});

function goBack() {
  uni.redirectTo({ url: '/pages/index/index' });
}

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;

  if (currentPage?.options?.mode) {
    gameMode.value = currentPage.options.mode;
  }

  if (currentPage?.options?.count) {
    playerCount.value = parseInt(currentPage.options.count);
  }

  if (currentPage?.options?.time) {
    matchTime.value = parseInt(currentPage.options.time);
    remainingTime.value = matchTime.value * 60;
    showTimer.value = true;
    startTimer();
  }

  if (currentPage?.options?.round) {
    winRounds.value = parseInt(currentPage.options.round);
  }

  // 初始化玩家数据
  const initialPlayers: Player[] = [];
  for (let i = 0; i < playerCount.value; i++) {
    const playerName = currentPage?.options[`player${i + 1}`]
      ? decodeURIComponent(currentPage.options[`player${i + 1}`])
      : `选手${i + 1}`;
    initialPlayers.push({
      id: i,
      name: playerName,
      score: 0,
      zhaQing: 0,
      jieQing: 0,
      wins: 0,
    });
  }
  players.value = initialPlayers;

  if (gameMode.value === 'simple' || gameMode.value === 'rounds') {
    showTimer.value = true;
    startElapsedTimer();
  }

  checkOrientation();
  uni.onWindowResize(handleResize);
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  uni.offWindowResize(handleResize);
});

function startTimer() {
  timerInterval = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      handleTimeUp();
    }
  }, 1000) as unknown as number;
}

function startElapsedTimer() {
  timerInterval = setInterval(() => {
    elapsedTime.value++;
  }, 1000) as unknown as number;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleTimeUp() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  isGameEnded.value = true;

  uni.showModal({
    title: '时间到！',
    content: '比赛时间已结束',
    confirmText: '结束比赛',
    showCancel: false,
    success: (res) => {
      if (res.confirm) {
        saveMatchRecord();
      }
    },
  });
}

function saveMatchRecord() {
  // 找出得分最高的选手
  let maxScore = -1;
  let winnerIndex = -1;
  players.value.forEach((player, index) => {
    if (player.score > maxScore) {
      maxScore = player.score;
      winnerIndex = index;
    }
  });

  let matchTimeUsed = elapsedTime.value;
  if (gameMode.value === 'timed') {
    matchTimeUsed = matchTime.value * 60 - remainingTime.value;
  }

  const record = {
    players: players.value.map((p) => ({
      name: p.name,
      score: p.score,
      zhaQing: p.zhaQing,
      jieQing: p.jieQing,
    })),
    winner: winnerIndex,
    time: formatTime(matchTimeUsed),
  };

  matchRecords.value.unshift(record);
}

function saveState() {
  historyStack.value.push({
    players: JSON.parse(JSON.stringify(players.value)),
    currentPlayer: currentPlayer.value,
  });

  if (historyStack.value.length > 50) {
    historyStack.value.shift();
  }
}

function undoAction() {
  if (historyStack.value.length === 0) {
    uni.showToast({ title: '没有可撤销的操作', icon: 'none' });
    return;
  }

  const lastState = historyStack.value.pop();
  if (lastState) {
    players.value = lastState.players;
    currentPlayer.value = lastState.currentPlayer;
    addOperationRecord('undo', '撤销操作');
  }
}

function resetGame() {
  uni.showModal({
    title: '确认重置',
    content: '确定要重置比赛吗？所有数据将被清除。',
    confirmText: '确认重置',
    cancelText: '取消',
    confirmColor: '#cc7000',
    success: (res) => {
      if (res.confirm) {
        // 重置所有玩家数据
        players.value.forEach((player) => {
          player.score = 0;
          player.zhaQing = 0;
          player.jieQing = 0;
        });
        currentPlayer.value = 0;
        operationRecords.value = [];
        historyStack.value = [];
        isGameEnded.value = false;
        elapsedTime.value = 0;
        if (gameMode.value === 'timed') {
          remainingTime.value = matchTime.value * 60;
        }
        addOperationRecord('settle', '重置游戏');
      }
    },
  });
}

function getPlayerRank(playerIndex: number): number {
  const sortedPlayers = [...players.value].map((p, i) => ({ ...p, originalIndex: i }));
  sortedPlayers.sort((a, b) => b.score - a.score);
  const rank = sortedPlayers.findIndex((p) => p.originalIndex === playerIndex) + 1;
  return rank;
}

function switchToPlayer(playerIndex: number) {
  saveState();
  const prevPlayer = players.value[currentPlayer.value].name;
  const newPlayer = players.value[playerIndex].name;
  currentPlayer.value = playerIndex;
  addOperationRecord('switch', `切换选手：${prevPlayer} → ${newPlayer}`);
  // 横屏模式才控制按钮显示
  if (isLandscape.value) {
    showActions.value = true;
    showHeader.value = false;
    resetHideTimer();
  }
}

function handleAddScore(playerIndex: number) {
  saveState();
  players.value[playerIndex].score++;
  addOperationRecord('add', `${players.value[playerIndex].name} +1分`);

  if (gameMode.value === 'rounds' && players.value[playerIndex].score >= winRounds.value) {
    handleRoundWin(playerIndex);
  }
}

function handleSubtractScore(playerIndex: number) {
  if (players.value[playerIndex].score > 0) {
    saveState();
    players.value[playerIndex].score--;
    addOperationRecord('subtract', `${players.value[playerIndex].name} -1分`);
  }
}

function handleAddZhaQing(playerIndex: number) {
  saveState();
  players.value[playerIndex].zhaQing++;
  players.value[playerIndex].score++;
  addOperationRecord('zhaqing', `${players.value[playerIndex].name} 炸清 +1分`);

  if (gameMode.value === 'rounds' && players.value[playerIndex].score >= winRounds.value) {
    handleRoundWin(playerIndex);
  }
}

function handleAddJieQing(playerIndex: number) {
  saveState();
  players.value[playerIndex].jieQing++;
  players.value[playerIndex].score++;
  addOperationRecord('jieqing', `${players.value[playerIndex].name} 接清 +1分`);

  if (gameMode.value === 'rounds' && players.value[playerIndex].score >= winRounds.value) {
    handleRoundWin(playerIndex);
  }
}

function handleRoundWin(playerIndex: number) {
  players.value[playerIndex].wins++;
  lastRoundStartTime.value = Date.now();

  if (gameMode.value === 'rounds') {
    checkGameEnd();
  }
}

function checkGameEnd() {
  const playersWithWins = players.value.filter((p) => p.wins >= winRounds.value);
  if (playersWithWins.length > 0) {
    isGameEnded.value = true;
    uni.showModal({
      title: '🎉 比赛结束！',
      content: `${playersWithWins[0].name} 赢得了比赛！`,
      confirmText: '查看结算',
      showCancel: false,
      confirmColor: '#cc7000',
      success: (res) => {
        if (res.confirm) {
          saveMatchRecord();
          showActions.value = false;
          showHeader.value = false;
        }
      },
    });
  }
}

function handleSettle() {
  const content = players.value
    .map((p) => `${p.name}: ${p.score}分 (炸清${p.zhaQing}次,接清${p.jieQing}次)`)
    .join('\n');

  uni.showModal({
    title: '确认结算',
    content: content + '\n\n确认结束本局比赛?',
    confirmText: '确认结算',
    cancelText: '继续比赛',
    confirmColor: '#cc7000',
    success: (res) => {
      if (res.confirm) {
        saveMatchRecord();
        uni.redirectTo({ url: '/pages/index/index' });
      }
    },
  });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleActions() {
  showActions.value = true;
  showHeader.value = true;
  resetHideTimer();
}

// 横屏模式下处理按钮点击，同时重置隐藏计时器
function handleButtonClick(action: Function) {
  action();
  resetHideTimer();
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
</script>

<style lang="scss" scoped>
.game-page {
  height: 100vh;
  overflow: hidden;
  background: #000;
  box-sizing: border-box;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 0 16rpx;
  width: 100%;
  box-sizing: border-box;
  transition: padding-top 0.3s ease;
  height: 100%;
  overflow-y: auto;
}

// 竖屏模式下添加底部 padding 防止按钮遮挡内容
@media (orientation: portrait) {
  .main-content {
    padding-bottom: 100rpx;
  }
}

// 横屏模式下也添加底部 padding 防止按钮遮挡内容
@media (orientation: landscape) {
  .main-content {
    padding-bottom: 100rpx;
  }
}

.main-content.header-shown {
  padding-top: 100rpx;
}

.game-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 20rpx 12rpx;
  background: #1a1a2e;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.game-header.show {
  transform: translateY(0);
}

@media (orientation: landscape) {
  .game-header {
    padding: 30rpx 30rpx 15rpx;
  }

  .main-content.header-shown {
    padding-top: 90rpx;
  }

  .timer-section.header-shown {
    margin-top: 90rpx;
  }
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
  background: rgba(204, 112, 0, 0.1);
  margin: 10rpx 16rpx 10rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  transition: margin-top 0.3s ease;
}

.timer-section.header-shown {
  margin-top: 100rpx;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.timer-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}

.timer-value {
  color: #cc7000;
  font-size: 48rpx;
  font-weight: bold;
  font-family: monospace;

  &.warning {
    color: #e74c3c;
    animation: pulse 1s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
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
  background: linear-gradient(90deg, #cc7000 0%, #3d964d 100%);
  transition: width 1s linear;
}

.info-section {
  background: rgba(204, 112, 0, 0.1);
  margin: 10rpx 16rpx;
  padding: 15rpx;
  border-radius: 12rpx;
}

.info-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15rpx;
}

.rounds-label {
  color: #cc7000;
  font-size: 26rpx;
  font-weight: bold;
}

.info-divider {
  color: rgba(255, 255, 255, 0.3);
  font-size: 24rpx;
}

.layout-portrait {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 8rpx 8rpx;
}

.portrait-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  overflow: hidden;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;

  &.active {
    border-color: #cc7000;
    box-shadow: 0 0 20rpx rgba(204, 112, 0, 0.3);
  }
}

.portrait-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 18rpx;

  &-player1 {
    background: #1a70cc;
  }

  &-player2 {
    background: #a52a2a;
  }

  &-player3 {
    background: #2d5a27;
  }

  &-player4 {
    background: #8b7355;
  }
}

.portrait-order-indicator {
  background: rgba(0, 0, 0, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
}

.portrait-player-name {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.portrait-score-area {
  padding: 14rpx;
  display: flex;
  justify-content: center;
}

.portrait-score {
  color: #cc7000;
  font-size: 80rpx;
  font-weight: bold;
  text-shadow: 0 0 20rpx rgba(204, 112, 0, 0.4);
}

.portrait-stats-row {
  display: flex;
  justify-content: space-around;
  padding: 8rpx 10rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.portrait-stat-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}

.stat-num {
  color: #cc7000;
  font-size: 28rpx;
  font-weight: bold;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20rpx;
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
  min-width: 0;
}

.landscape-center-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 0 15rpx;
  min-width: 120rpx;
}

.landscape-vs-text {
  color: #cc7000;
  font-size: 48rpx;
  font-weight: bold;
  text-shadow: 0 0 20rpx rgba(204, 112, 0, 0.4);
}

.landscape-game-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.landscape-info-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

.operation-records-section {
  padding: 8rpx 14rpx;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12rpx;
  margin: 6rpx 8rpx;
  border: 1rpx solid rgba(255, 140, 0, 0.2);
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
  padding-bottom: 6rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.records-title {
  color: #ff8c00;
  font-size: 24rpx;
  font-weight: bold;
}

.records-more-btn {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
}

.records-list {
  max-height: 150rpx;
}

.record-item {
  display: flex;
  gap: 15rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &.add {
    background: rgba(46, 125, 50, 0.1);
  }

  &.subtract {
    background: rgba(198, 40, 40, 0.1);
  }

  &.zhaqing {
    background: rgba(204, 112, 0, 0.1);
  }

  &.jieqing {
    background: rgba(76, 175, 80, 0.1);
  }

  &.switch {
    background: rgba(33, 150, 243, 0.1);
  }

  &.undo {
    background: rgba(158, 158, 158, 0.1);
  }

  &.settle {
    background: rgba(156, 39, 176, 0.1);
  }
}

.record-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 20rpx;
  flex-shrink: 0;
}

.record-desc {
  color: #fff;
  font-size: 24rpx;
  flex: 1;
}

.empty-records {
  text-align: center;
  padding: 30rpx 0;

  text {
    color: rgba(255, 255, 255, 0.4);
    font-size: 24rpx;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.95);
  padding: 12rpx 16rpx;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.bottom-actions.show {
  transform: translateY(0);
}

.action-btn-wrap {
  display: flex;
  gap: 8rpx;
}

.bottom-btn {
  flex: 1;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }

  text {
    font-size: 20rpx;
    font-weight: bold;
    color: #fff;
  }

  &.plus-btn {
    background: #3d964d;
  }

  &.minus-btn {
    background: #c62828;
  }

  &.zhaqing-btn {
    background: #cc7000;
  }

  &.jieqing-btn {
    background: #4caf50;
  }

  &.undo-btn {
    background: #9e9e9e;
  }

  &.settle-btn {
    background: #9c27b0;
  }
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
  z-index: 1000;
}

.records-modal {
  width: 85%;
  max-height: 80vh;
  background: #1a1a2e;
  border-radius: 20rpx;
  overflow: hidden;
}

.records-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.records-modal-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}

.records-modal-close {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;

  text {
    color: #fff;
    font-size: 28rpx;
  }
}

.records-modal-list {
  max-height: 60vh;
  padding: 20rpx 30rpx;
}
</style>

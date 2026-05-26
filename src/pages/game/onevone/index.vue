<template>
  <view class="game-page">
    <view class="game-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="game-title">{{ gameType }}</text>
      <view class="header-actions">
        <view class="action-btn" @tap="undoAction">撤销</view>
        <view class="action-btn" @tap="resetGame">重置</view>
      </view>
    </view>

    <view class="timer-section" v-if="gameMode === 'timed' && showTimer">
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

    <view class="rounds-section" v-if="gameMode === 'rounds'">
      <view class="rounds-info">
        <text class="rounds-label">抢{{ winRounds }}局</text>
        <text class="rounds-progress">{{ player1Wins }} : {{ player2Wins }}</text>
      </view>
    </view>

    <view
      class="elapsed-timer-section"
      v-if="(gameMode === 'simple' || gameMode === 'rounds') && showTimer"
    >
      <view class="elapsed-timer-display">
        <text class="timer-label">用时</text>
        <text class="timer-value">{{ formatTime(elapsedTime) }}</text>
      </view>
    </view>

    <ScoreBoard :players="players" :currentPlayerId="currentPlayer + 1" />

    <view class="controls-section" v-if="gameType !== '中式八球'">
      <view class="control-grid">
        <view class="control-item" @tap="addScore(currentPlayer)">
          <view class="control-icon">+1</view>
          <text>加分</text>
        </view>
        <view class="control-item" @tap="subtractScore(currentPlayer)">
          <view class="control-icon">-1</view>
          <text>减分</text>
        </view>
        <view class="control-item" @tap="markGolden" v-if="gameType.match(/[四六七八九]球/)">
          <view class="control-icon">🥇</view>
          <text>大金</text>
        </view>
        <view class="control-item" @tap="markSmallGolden" v-if="gameType.match(/[四六七八九]球/)">
          <view class="control-icon">🥈</view>
          <text>小金</text>
        </view>
        <view class="control-item" @tap="switchPlayer" v-if="gameType !== '斯诺克'">
          <view class="control-icon">🔄</view>
          <text>换击球</text>
        </view>
        <view class="control-item" @tap="confirmWin">
          <view class="control-icon">🏆</view>
          <text>确认胜利</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import ScoreBoard from '@/components/ScoreBoard.vue';
import { incrementZhaQing, incrementJieQing } from '@/utils/auth';
import type { Player } from '@/data/types';

const gameType = ref('中式八球');
const gameMode = ref('simple');
const matchTime = ref(60);
const winRounds = ref(7);

const player1 = ref({ name: '选手1' });
const player2 = ref({ name: '选手2' });
const score1 = ref(0);
const score2 = ref(0);
const currentPlayer = ref(0);
const showTimer = ref(false);
const remainingTime = ref(0);
const elapsedTime = ref(0);
const player1Wins = ref(0);
const player2Wins = ref(0);

const player1ZhaQing = ref(0);
const player1JieQing = ref(0);
const player2ZhaQing = ref(0);
const player2JieQing = ref(0);

const players = computed<Player[]>(() => [
  {
    id: 1,
    name: player1.value.name,
    score: score1.value,
    stats: {
      foul: 0,
      bonus: 0,
      normalWin: player1ZhaQing.value,
      bigGolden: 0,
      smallGolden: player1JieQing.value,
      goldenNine: 0,
    },
    currentStreak: 0,
  },
  {
    id: 2,
    name: player2.value.name,
    score: score2.value,
    stats: {
      foul: 0,
      bonus: 0,
      normalWin: player2ZhaQing.value,
      bigGolden: 0,
      smallGolden: player2JieQing.value,
      goldenNine: 0,
    },
    currentStreak: 0,
  },
]);

let timerInterval: number | null = null;

const timerProgress = computed(() => {
  if (gameMode.value !== 'timed') return 100;
  return (remainingTime.value / (matchTime.value * 60)) * 100;
});

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;

  if (currentPage?.options?.gameType) {
    gameType.value = decodeURIComponent(currentPage.options.gameType);
  }

  if (currentPage?.options?.mode) {
    gameMode.value = currentPage.options.mode;
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

  if (gameMode.value === 'simple' || gameMode.value === 'rounds') {
    showTimer.value = true;
    startElapsedTimer();
  }

  uni.showModal({
    title: '开始对局',
    editable: true,
    placeholderText: '请输入选手1名称',
    success: (res) => {
      if (res.confirm && res.content) {
        player1.value = { name: res.content };
        uni.showModal({
          title: '开始对局',
          editable: true,
          placeholderText: '请输入选手2名称',
          success: (res2) => {
            if (res2.confirm && res2.content) {
              player2.value = { name: res2.content };
            }
          },
        });
      }
    },
  });
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
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

function handleTimeUp() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  uni.showModal({
    title: '时间到！',
    content: '比赛时间已结束，是否需要加时？',
    confirmText: '加时30分钟',
    cancelText: '结束比赛',
    success: (res) => {
      if (res.confirm) {
        remainingTime.value = 30 * 60;
        startTimer();
      } else {
        endMatch();
      }
    },
  });
}

function endMatch() {
  let winner = '';
  let result = '';

  if (gameMode.value === 'rounds') {
    if (player1Wins.value > player2Wins.value) {
      winner = player1.value.name;
      result = `${winner} 以 ${player1Wins.value}:${player2Wins.value} 获胜！`;
    } else if (player2Wins.value > player1Wins.value) {
      winner = player2.value.name;
      result = `${winner} 以 ${player1Wins.value}:${player2Wins.value} 获胜！`;
    } else {
      result = '平局！';
    }
  } else {
    if (score1.value > score2.value) {
      winner = player1.value.name;
      result = `${winner} 以 ${score1.value}:${score2.value} 获胜！`;
    } else if (score2.value > score1.value) {
      winner = player2.value.name;
      result = `${winner} 以 ${score1.value}:${score2.value} 获胜！`;
    } else {
      result = '平局！';
    }
  }

  uni.showModal({
    title: '比赛结束',
    content: result,
    showCancel: false,
    success: () => {
      uni.navigateBack();
    },
  });
}

function goBack() {
  uni.navigateBack();
}

function undoAction() {
  uni.showToast({ title: '撤销功能开发中', icon: 'none' });
}

function resetGame() {
  score1.value = 0;
  score2.value = 0;
  currentPlayer.value = 0;
  player1ZhaQing.value = 0;
  player1JieQing.value = 0;
  player2ZhaQing.value = 0;
  player2JieQing.value = 0;
  player1Wins.value = 0;
  player2Wins.value = 0;

  if (gameMode.value === 'timed') {
    remainingTime.value = matchTime.value * 60;
    if (!timerInterval) {
      startTimer();
    }
  }

  uni.showToast({ title: '已重置', icon: 'success' });
}

function addScore(player: number, points: number = 1) {
  if (player === 0) {
    score1.value += points;
  } else {
    score2.value += points;
  }

  checkRoundWin();
}

function subtractScore(player: number) {
  if (player === 0 && score1.value > 0) {
    score1.value--;
  } else if (player === 1 && score2.value > 0) {
    score2.value--;
  }
}

function handleAddScore(playerIndex: number) {
  addScore(playerIndex);
}

function handleSubtractScore(playerIndex: number) {
  subtractScore(playerIndex);
}

function markZhaQing(playerIndex?: number) {
  const player = playerIndex !== undefined ? playerIndex : currentPlayer.value;
  if (player === 0) {
    score1.value += 1;
    player1ZhaQing.value++;
  } else {
    score2.value += 1;
    player2ZhaQing.value++;
  }
  incrementZhaQing();
  uni.showToast({ title: '已标记炸清 +1分', icon: 'none' });

  checkRoundWin();
}

function handleMarkZhaQing(playerIndex: number) {
  markZhaQing(playerIndex);
}

function markJieQing(playerIndex?: number) {
  const player = playerIndex !== undefined ? playerIndex : currentPlayer.value;
  if (player === 0) {
    score1.value += 1;
    player1JieQing.value++;
  } else {
    score2.value += 1;
    player2JieQing.value++;
  }
  incrementJieQing();
  uni.showToast({ title: '已标记接清 +1分', icon: 'none' });

  checkRoundWin();
}

function handleMarkJieQing(playerIndex: number) {
  markJieQing(playerIndex);
}

function checkRoundWin() {
  if (gameMode.value !== 'rounds') return;

  if (score1.value >= 11) {
    player1Wins.value++;
    checkMatchWin();
  } else if (score2.value >= 11) {
    player2Wins.value++;
    checkMatchWin();
  }
}

function checkMatchWin() {
  const requiredWins = Math.ceil(winRounds.value / 2);
  if (player1Wins.value >= requiredWins) {
    uni.showModal({
      title: '比赛结束',
      content: `${player1.value.name} 赢得比赛！`,
      showCancel: false,
      success: () => {
        uni.navigateBack();
      },
    });
  } else if (player2Wins.value >= requiredWins) {
    uni.showModal({
      title: '比赛结束',
      content: `${player2.value.name} 赢得比赛！`,
      showCancel: false,
      success: () => {
        uni.navigateBack();
      },
    });
  } else {
    score1.value = 0;
    score2.value = 0;
    currentPlayer.value = 0;
    uni.showToast({
      title: `第 ${player1Wins.value + player2Wins.value + 1} 局开始`,
      icon: 'none',
    });
  }
}

function markGolden() {
  if (currentPlayer.value === 0) {
    score1.value += 10;
  } else {
    score2.value += 10;
  }
  uni.showToast({ title: '已标记大金 +10分', icon: 'none' });

  checkRoundWin();
}

function markSmallGolden() {
  if (currentPlayer.value === 0) {
    score1.value += 7;
  } else {
    score2.value += 7;
  }
  uni.showToast({ title: '已标记小金 +7分', icon: 'none' });

  checkRoundWin();
}

function switchPlayer() {
  currentPlayer.value = currentPlayer.value === 0 ? 1 : 0;
  uni.showToast({
    title: `${currentPlayer.value === 0 ? player1.value.name : player2.value.name}`,
    icon: 'none',
  });
}

function handleSwitchPlayer(playerIndex: number) {
  if (playerIndex !== currentPlayer.value) {
    currentPlayer.value = playerIndex;
    uni.showToast({
      title: `${currentPlayer.value === 0 ? player1.value.name : player2.value.name}`,
      icon: 'none',
    });
  }
}

function confirmWin() {
  const winnerName = currentPlayer.value === 0 ? player1.value.name : player2.value.name;

  if (gameMode.value === 'rounds') {
    if (currentPlayer.value === 0) {
      player1Wins.value++;
    } else {
      player2Wins.value++;
    }
    checkMatchWin();
  } else {
    uni.showModal({
      title: '确认胜利',
      content: `${winnerName} 获胜？`,
      success: (res) => {
        if (res.confirm) {
          uni.showToast({ title: `${winnerName} 获胜！`, icon: 'success' });
        }
      },
    });
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
</script>

<style lang="scss" scoped>
.game-page {
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

.rounds-section {
  background: rgba(74, 158, 255, 0.1);
  margin: 0 20rpx 20rpx;
  padding: 15rpx 20rpx;
  border-radius: 16rpx;
}

.rounds-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
}

.rounds-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 26rpx;
}

.rounds-progress {
  color: #4a9eff;
  font-size: 32rpx;
  font-weight: bold;
}

.elapsed-timer-section {
  background: rgba(74, 217, 100, 0.1);
  margin: 0 20rpx 20rpx;
  padding: 15rpx 20rpx;
  border-radius: 16rpx;
}

.elapsed-timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
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

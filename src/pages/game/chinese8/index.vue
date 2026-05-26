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

        <view class="layout-landscape" v-else>
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
                <view v-if="currentPlayer === index" class="current-indicator">当前</view>
              </view>
              <view class="portrait-score-area">
                <view class="portrait-score">{{ player.score }}</view>
              </view>
              <view class="portrait-stats-row">
                <text class="stat-label">炸清</text>
                <text class="stat-num">{{ player.zhaQing }}</text>
                <text class="stat-divider">|</text>
                <text class="stat-label">接清</text>
                <text class="stat-num">{{ player.jieQing }}</text>
              </view>
            </view>
          </view>

          <view class="landscape-bottom-area">
            <view class="action-btn-wrap">
              <view
                class="bottom-btn undo-btn"
                @tap.stop="undoAction"
              >
                <text>撤销</text>
              </view>
              <view
                class="bottom-btn plus-btn"
                @tap.stop="handleAddScore(currentPlayer)"
              >
                <text>加分</text>
              </view>
              <view
                class="bottom-btn jieqing-btn"
                @tap.stop="handleAddJieQing(currentPlayer)"
              >
                <text>接清</text>
              </view>
              <view
                class="bottom-btn zhaqing-btn"
                @tap.stop="handleAddZhaQing(currentPlayer)"
              >
                <text>炸清</text>
              </view>
              <view class="bottom-btn settle-btn" @tap.stop="handleSettle">
                <text>结算</text>
              </view>
            </view>
            <view class="landscape-timer-bar">
              <view class="landscape-timer-info">
                <text class="timer-value">{{ formattedTime }}</text>
                <text class="round-value">局数: {{ completedRounds }}/{{ winRounds || '-' }}</text>
              </view>
              <view class="timer-btn" :class="{ active: isTimerRunning }" @tap.stop="toggleTimer">
                {{ isTimerRunning ? '暂停计时' : '开始计时' }}
              </view>
            </view>
          </view>
        </view>

        <view class="match-score-bar" v-if="!isLandscape && hasRestarted">
          <text class="score-player">{{ players[0]?.name }}</text>
          <text class="score-value">{{ matchHistory.length > 0 ? matchHistory[matchHistory.length - 1].player1Wins : 0 }}</text>
          <text class="score-divider">:</text>
          <text class="score-value">{{ matchHistory.length > 0 ? matchHistory[matchHistory.length - 1].player2Wins : 0 }}</text>
          <text class="score-player">{{ players[1]?.name }}</text>
        </view>

        <view class="operation-records-section" v-if="!isLandscape">
          <view class="records-header">
            <view class="records-title">操作记录</view>
            <view
              class="records-more-btn"
              @tap.stop="handleShowFullRecords"
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
              <text class="record-round-time">{{ record.roundTime }}</text>
              <text class="record-desc">{{ record.description }}</text>
            </view>
            <view v-if="operationRecords.length === 0" class="empty-records">
              <text>暂无操作记录</text>
            </view>
          </scroll-view>
        </view>

        <view class="bottom-actions show" v-if="!isLandscape">
          <view class="action-btn-wrap">
            <view class="bottom-btn undo-btn" @tap.stop="undoAction">
              <text>撤销</text>
            </view>
            <view class="bottom-btn plus-btn" @tap.stop="handleAddScore(currentPlayer)">
              <text>加分</text>
            </view>
            <view class="bottom-btn jieqing-btn" @tap.stop="handleAddJieQing(currentPlayer)">
              <text>接清</text>
            </view>
            <view class="bottom-btn zhaqing-btn" @tap.stop="handleAddZhaQing(currentPlayer)">
              <text>炸清</text>
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
            <text class="record-round-time">{{ record.roundTime }}</text>
            <text class="record-desc">{{ record.description }}</text>
          </view>
          <view v-if="operationRecords.length === 0" class="empty-records">
            <text>暂无操作记录</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="showSettleModal" class="modal-overlay" @tap="cancelSettle">
      <view class="settle-modal" @tap.stop>
        <view class="settle-modal-header">
          <text class="settle-modal-title">比赛结算</text>
          <view class="settle-modal-close" @tap="cancelSettle">
            <text>✕</text>
          </view>
        </view>
        
        <view class="settle-content">
          <view class="settle-section">
            <text class="settle-section-title">总比分</text>
            <view class="settle-score-row">
              <text class="settle-player-name">{{ players[0]?.name }}</text>
              <text class="settle-player-score">{{ matchHistory.length > 0 ? matchHistory[matchHistory.length - 1].player1Wins : 0 }}</text>
              <text class="settle-divider">:</text>
              <text class="settle-player-score">{{ matchHistory.length > 0 ? matchHistory[matchHistory.length - 1].player2Wins : 0 }}</text>
              <text class="settle-player-name">{{ players[1]?.name }}</text>
            </view>
          </view>

          <scroll-view class="round-history" scroll-y>
            <view 
              v-for="(record, index) in [...matchHistory].reverse()" 
              :key="record.round"
              class="round-item"
            >
              <view class="round-header">
                <text class="round-title">第{{ record.round }}局</text>
              </view>
              <view class="round-score-row">
                <text class="round-player-name">{{ players[0]?.name }}</text>
                <text class="round-player-score">{{ record.player1Score }}</text>
                <text class="round-divider">:</text>
                <text class="round-player-score">{{ record.player2Score }}</text>
                <text class="round-player-name">{{ players[1]?.name }}</text>
              </view>
              <view class="round-stats">
                <view class="round-stat-item">
                  <text class="round-stat-label">{{ players[0]?.name }} 炸清</text>
                  <text class="round-stat-value">{{ record.player1ZhaQing }}次</text>
                </view>
                <view class="round-stat-item">
                  <text class="round-stat-label">{{ players[0]?.name }} 接清</text>
                  <text class="round-stat-value">{{ record.player1JieQing }}次</text>
                </view>
                <view class="round-stat-item">
                  <text class="round-stat-label">{{ players[1]?.name }} 炸清</text>
                  <text class="round-stat-value">{{ record.player2ZhaQing }}次</text>
                </view>
                <view class="round-stat-item">
                  <text class="round-stat-label">{{ players[1]?.name }} 接清</text>
                  <text class="round-stat-value">{{ record.player2JieQing }}次</text>
                </view>
              </view>
            </view>

            <view v-if="matchHistory.length === 0" class="empty-rounds">
              <text>暂无比赛记录</text>
            </view>
          </scroll-view>
        </view>

        <view class="settle-modal-footer">
          <view class="settle-btn cancel-btn" @tap="handleRestart">重新开始</view>
          <view class="settle-btn confirm-btn" @tap="confirmSettle">确认结算</view>
        </view>
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
const completedRounds = ref(0);
const isTimerRunning = ref(false);
const screenHeight = ref(0);

const formattedTime = computed(() => {
  const time = gameMode.value === 'timed' ? remainingTime.value : elapsedTime.value;
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

function toggleTimer() {
  if (isTimerRunning.value) {
    stopTimer();
  } else {
    startElapsedTimer();
  }
  isTimerRunning.value = !isTimerRunning.value;
}

const lastRoundStartTime = ref(0);
const roundHistory = ref<any[]>([]);
const hasRestarted = ref(false);
const matchHistory = ref<{ 
  round: number;
  player1Score: number;
  player2Score: number;
  player1ZhaQing: number;
  player1JieQing: number;
  player2ZhaQing: number;
  player2JieQing: number;
  player1Wins: number;
  player2Wins: number;
}[]>([]);
const showSettleModal = ref(false);

interface GameState {
  players: Player[];
  currentPlayer: number;
}

const historyStack = ref<GameState[]>([]);

interface OperationRecord {
  id: number;
  time: string;
  action: 'add' | 'subtract' | 'zhaqing' | 'jieqing' | 'switch' | 'undo' | 'settle' | 'win';
  description: string;
  roundTime: string;
}

const operationRecords = ref<OperationRecord[]>([]);
let recordId = 0;
const showRecordsModal = ref(false);

function addOperationRecord(action: OperationRecord['action'], description: string) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  let roundTimeStr = '--:--';
  if (lastRoundStartTime.value > 0) {
    const roundElapsed = Math.floor((Date.now() - lastRoundStartTime.value) / 1000);
    const roundMins = Math.floor(roundElapsed / 60);
    const roundSecs = roundElapsed % 60;
    roundTimeStr = `${roundMins.toString().padStart(2, '0')}:${roundSecs.toString().padStart(2, '0')}`;
  }
  
  operationRecords.value.unshift({
    id: ++recordId,
    time: timeStr,
    action,
    description,
    roundTime: roundTimeStr,
  });
  if (operationRecords.value.length > 100) {
    operationRecords.value.pop();
  }
}

function showFullRecords() {
  showRecordsModal.value = true;
}

function handleShowFullRecords() {
  showRecordsModal.value = true;
  resetHideTimer();
}

function closeRecordsModal() {
  showRecordsModal.value = false;
}

const matchRecords = ref<any[]>([]);

let timerInterval: number | null = null;

function checkOrientation() {
  const sysInfo = uni.getSystemInfoSync();
  isLandscape.value = sysInfo.windowWidth > sysInfo.windowHeight;
  screenHeight.value = sysInfo.windowHeight;
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
  lastRoundStartTime.value = Date.now();

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
  isTimerRunning.value = true;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isTimerRunning.value = false;
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

  if (players.value[playerIndex].score >= winRounds.value) {
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

  if (players.value[playerIndex].score >= winRounds.value) {
    handleRoundWin(playerIndex);
  }
}

function handleAddJieQing(playerIndex: number) {
  saveState();
  players.value[playerIndex].jieQing++;
  players.value[playerIndex].score++;
  addOperationRecord('jieqing', `${players.value[playerIndex].name} 接清 +1分`);

  if (players.value[playerIndex].score >= winRounds.value) {
    handleRoundWin(playerIndex);
  }
}

function handleRoundWin(playerIndex: number) {
  players.value[playerIndex].wins++;
  lastRoundStartTime.value = Date.now();
  checkGameEnd(playerIndex);
}

function checkGameEnd(playerIndex: number) {
  const player = players.value[playerIndex];
  if (player.score >= winRounds.value) {
    isGameEnded.value = true;
    addOperationRecord('win', `${player.name} 赢得比赛！(${winRounds.value}局${player.score}胜)`);
    
    const lastScores = players.value.map(p => p.score);
    const winnerIndex = lastScores[0] > lastScores[1] ? 0 : 1;
    const currentPlayer1Wins = matchHistory.value.length > 0 ? matchHistory.value[matchHistory.value.length - 1].player1Wins : 0;
    const currentPlayer2Wins = matchHistory.value.length > 0 ? matchHistory.value[matchHistory.value.length - 1].player2Wins : 0;
    
    matchHistory.value.push({
      round: matchHistory.value.length + 1,
      player1Score: players.value[0].score,
      player2Score: players.value[1].score,
      player1ZhaQing: players.value[0].zhaQing,
      player1JieQing: players.value[0].jieQing,
      player2ZhaQing: players.value[1].zhaQing,
      player2JieQing: players.value[1].jieQing,
      player1Wins: winnerIndex === 0 ? currentPlayer1Wins + 1 : currentPlayer1Wins,
      player2Wins: winnerIndex === 1 ? currentPlayer2Wins + 1 : currentPlayer2Wins
    });
    
    hasRestarted.value = true;
    
    uni.showModal({
      title: '🎉 比赛结束！',
      content: `${player.name} 赢得了比赛！`,
      confirmText: '查看结算',
      cancelText: '重新开始',
      confirmColor: '#cc7000',
      success: (res) => {
        if (res.confirm) {
          showSettleModal.value = true;
        } else {
          resetMatch();
        }
      },
    });
  }
}

function handleSettle() {
  showSettleModal.value = true;
}

function confirmSettle() {
  saveMatchRecord();
  showSettleModal.value = false;
  uni.redirectTo({ url: '/pages/index/index' });
}

function cancelSettle() {
  showSettleModal.value = false;
}

function handleRestart() {
  showSettleModal.value = false;
  setTimeout(() => {
    resetMatch();
  }, 100);
}

function resetMatch() {
  const lastScores = players.value.map(p => p.score);
  
  showSettleModal.value = false;
  players.value.forEach((player) => {
    player.score = 0;
    player.zhaQing = 0;
    player.jieQing = 0;
    player.wins = 0;
  });
  currentPlayer.value = 0;
  historyStack.value = [];
  lastRoundStartTime.value = Date.now();
  isGameEnded.value = false;
  addOperationRecord('settle', `${players.value[0].name} ${lastScores[0]}:${lastScores[1]} ${players.value[1].name}`);
  addOperationRecord('settle', '重新开始新一局抢7');
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
  border: 3rpx solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;

  &.active {
    border-color: #ff8c00;
    box-shadow: 0 0 20rpx rgba(255, 140, 0, 0.5), 0 0 40rpx rgba(255, 140, 0, 0.3);
    background: rgba(255, 140, 0, 0.08);
  }
}

.portrait-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 18rpx;
  width: 100%;
  box-sizing: border-box;

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
  gap: 8rpx;
  padding: 10rpx;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}

.landscape-players-container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 8rpx;
  flex: 1;
  min-height: 205rpx;
}

.landscape-player-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0;
  border-radius: 12rpx;
  overflow: hidden;
}

.landscape-player-card .portrait-header {
  padding: 8rpx 12rpx;
  margin-top: -2rpx;
}

.landscape-player-card .portrait-player-name {
  font-size: 24rpx;
  font-weight: bold;
}

.landscape-player-card .portrait-score-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.landscape-player-card .portrait-score {
  font-size: 56rpx;
  font-weight: bold;
  color: #ff8c00;
  text-shadow: 0 0 20rpx rgba(255, 140, 0, 0.5);
}

.landscape-player-card .portrait-stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  padding: 4rpx 0;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  line-height: 1.2;
}

.landscape-player-card .stat-num {
  font-size: 16rpx;
  color: #ff8c00;
  font-weight: bold;
}

.landscape-player-card .stat-label {
  font-size: 14rpx;
  color: rgba(255, 255, 255, 0.8);
}

.landscape-player-card .stat-divider {
  font-size: 14rpx;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 8rpx;
}

.landscape-player-card .current-indicator {
  background: rgba(0, 0, 0, 0.3);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 18rpx;
  color: #fff;
}



.landscape-timer-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.timer-value {
  font-size: 20rpx;
  font-weight: bold;
  color: #ff8c00;
  font-family: 'Courier New', monospace;
}

.round-value {
  font-size: 16rpx;
  color: rgba(255, 255, 255, 0.8);
}

.timer-btn {
  padding: 4rpx 12rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6rpx;
  font-size: 14rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &.active {
    background: rgba(255, 140, 0, 0.3);
    color: #ff8c00;
  }

  &:active {
    transform: scale(0.95);
  }
}

.landscape-bottom-area {
  display: flex;
  flex-direction: column;
  background: rgba(26, 26, 46, 0.95);
  padding: 6rpx 10rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  gap: 4rpx;
}

.landscape-bottom-area .action-btn-wrap {
  display: flex;
  gap: 8rpx;
  width: 100%;
}

.landscape-bottom-area .bottom-btn {
  flex: 1;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  transition: all 0.2s ease;

  text {
    font-size: 18rpx;
    font-weight: bold;
    color: #fff;
  }
}

.landscape-timer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rpx 4rpx;
  border-top: none;
  min-height: 16rpx;
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

.match-score-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 14rpx;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12rpx;
  margin: 6rpx 8rpx;
  border: 1rpx solid rgba(255, 140, 0, 0.2);
}

.score-player {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.score-value {
  font-size: 28rpx;
  color: #ff8c00;
  font-weight: bold;
}

.score-divider {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  font-weight: bold;
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

.record-round-time {
  color: #ff8c00;
  font-size: 20rpx;
  flex-shrink: 0;
  padding: 0 8rpx;
  background: rgba(255, 140, 0, 0.15);
  border-radius: 6rpx;
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

.settle-modal {
  width: 600rpx;
  max-height: 80vh;
  background: rgba(26, 26, 46, 0.98);
  border-radius: 20rpx;
  border: 2rpx solid rgba(255, 140, 0, 0.3);
  overflow: hidden;
}

.settle-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.settle-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.settle-modal-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
}

.settle-content {
  padding: 24rpx 32rpx;
}

.settle-section {
  margin-bottom: 24rpx;
}

.settle-section:last-child {
  margin-bottom: 0;
}

.settle-section-title {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 16rpx;
  display: block;
}

.settle-score-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
}

.settle-player-name {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.settle-player-score {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;

  &.orange {
    color: #ff8c00;
  }
}

.settle-divider {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.settle-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.settle-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
}

.settle-stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.settle-stat-value {
  font-size: 24rpx;
  color: #ff8c00;
  font-weight: bold;
}

.round-history {
  max-height: 500rpx;
  margin-top: 16rpx;
}

.round-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.round-header {
  margin-bottom: 12rpx;
}

.round-title {
  font-size: 22rpx;
  color: #ff8c00;
  font-weight: bold;
}

.round-score-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.round-player-name {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.round-player-score {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff8c00;
}

.round-divider {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.round-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.round-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 12rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8rpx;
}

.round-stat-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.6);
}

.round-stat-value {
  font-size: 22rpx;
  color: #ff8c00;
  font-weight: bold;
}

.empty-rounds {
  text-align: center;
  padding: 30rpx 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
}

.settle-modal-footer {
  display: flex;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.settle-btn {
  flex: 1;
  padding: 28rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 12rpx;
  margin: 0 8rpx;

  &.cancel-btn {
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.1);
  }

  &.confirm-btn {
    color: #fff;
    background: #9c27b0;
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
  gap: 6rpx;
  padding: 0 4rpx;
}

.bottom-btn {
  flex: 1;
  flex-basis: 0;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
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

  &.undo-btn {
    background: #757575;
  }

  &.plus-btn {
    background: #558b2f;
  }

  &.zhaqing-btn {
    background: #cc7000;
  }

  &.jieqing-btn {
    background: #4caf50;
  }

  &.settle-btn {
    background: #9c27b0;
    padding: 0;
    margin: 0;
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

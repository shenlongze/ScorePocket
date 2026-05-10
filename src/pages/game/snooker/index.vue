<template>
  <view class="scoreboard-page">
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="game-title">斯诺克</text>
      </view>
      <view class="header-actions">
        <view class="action-btn" @tap="undoAction">撤销</view>
        <view class="action-btn" @tap="resetGame">重置</view>
      </view>
    </view>

    <view class="current-break-section">
      <view v-if="config.gameRounds" class="round-info">
        <text class="round-label">第 {{ currentRound }} / {{ config.gameRounds }} 局</text>
      </view>
    </view>

    <view class="players-section">
      <view 
        v-for="(player, index) in players"
        :key="index"
        :class="['player-card', { active: currentPlayer === index }]"
        @tap="switchPlayer(index)"
      >
        <view class="player-card-inner">
          <view class="header-row" :style="{ background: PLAYER_COLORS[index] }">
            <text class="player-name">{{ player.name }}</text>
            <view v-if="currentPlayer === index" class="current-indicator">当前</view>
          </view>
          <view class="main-area">
            <view class="score-box">
              <text class="score-value">{{ player.score }}</text>
            </view>
            <view class="stats-column">
              <view class="stat-item">
                <text class="stat-label">最高单杆</text>
                <text class="stat-value">{{ player.highestBreak }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">最高连击</text>
                <text class="stat-value">{{ player.highestStreak }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="balls-row">
          <view class="ball-stat">
            <text class="ball-color">🔴</text>
            <text class="ball-count">{{ currentPlayer === index ? breakBalls.red : 0 }}</text>
          </view>
          <view v-if="currentPlayer === index && breakBalls.yellow > 0" class="ball-stat">
            <text class="ball-color">🟡</text>
            <text class="ball-count">{{ breakBalls.yellow }}</text>
          </view>
          <view v-if="currentPlayer === index && breakBalls.green > 0" class="ball-stat">
            <text class="ball-color">🟢</text>
            <text class="ball-count">{{ breakBalls.green }}</text>
          </view>
          <view v-if="currentPlayer === index && breakBalls.brown > 0" class="ball-stat">
            <text class="ball-color">🟤</text>
            <text class="ball-count">{{ breakBalls.brown }}</text>
          </view>
          <view v-if="currentPlayer === index && breakBalls.blue > 0" class="ball-stat">
            <text class="ball-color">🔵</text>
            <text class="ball-count">{{ breakBalls.blue }}</text>
          </view>
          <view v-if="currentPlayer === index && breakBalls.pink > 0" class="ball-stat">
            <text class="ball-color">💗</text>
            <text class="ball-count">{{ breakBalls.pink }}</text>
          </view>
          <view v-if="currentPlayer === index && breakBalls.black > 0" class="ball-stat">
            <text class="ball-color">⚫</text>
            <text class="ball-count">{{ breakBalls.black }}</text>
          </view>
          <view class="break-stat">
            <text class="break-label">单杆得分</text>
            <text class="break-value">{{ currentPlayer === index ? currentBreak : 0 }}</text>
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

    <view class="balls-section">
      <view class="balls-grid">
        <view 
          class="ball-btn"
          :class="{ disabled: redBallsRemaining <= 0 }"
          @tap="addScoreSafe(1)"
        >
          <view class="ball-icon">🔴</view>
          <text class="ball-label">红球</text>
          <text class="ball-score">1分</text>
          <text v-if="redBallsRemaining > 0" class="ball-count">剩余{{ redBallsRemaining }}</text>
        </view>
        <view 
          class="ball-btn" 
          :class="{ disabled: !canHitColorBall(2) }"
          @tap="addScoreSafe(2)"
        >
          <view class="ball-icon">🟡</view>
          <text class="ball-label">黄球</text>
          <text class="ball-score">2分</text>
          <text v-if="isBallHit(2)" class="ball-hit">✓</text>
        </view>
        <view 
          class="ball-btn" 
          :class="{ disabled: !canHitColorBall(3) }"
          @tap="addScoreSafe(3)"
        >
          <view class="ball-icon">🟢</view>
          <text class="ball-label">绿球</text>
          <text class="ball-score">3分</text>
          <text v-if="isBallHit(3)" class="ball-hit">✓</text>
        </view>
        <view 
          class="ball-btn" 
          :class="{ disabled: !canHitColorBall(4) }"
          @tap="addScoreSafe(4)"
        >
          <view class="ball-icon">🟤</view>
          <text class="ball-label">棕球</text>
          <text class="ball-score">4分</text>
          <text v-if="isBallHit(4)" class="ball-hit">✓</text>
        </view>
        <view 
          class="ball-btn" 
          :class="{ disabled: !canHitColorBall(5) }"
          @tap="addScoreSafe(5)"
        >
          <view class="ball-icon">🔵</view>
          <text class="ball-label">蓝球</text>
          <text class="ball-score">5分</text>
          <text v-if="isBallHit(5)" class="ball-hit">✓</text>
        </view>
        <view 
          class="ball-btn" 
          :class="{ disabled: !canHitColorBall(6) }"
          @tap="addScoreSafe(6)"
        >
          <view class="ball-icon">💗</view>
          <text class="ball-label">粉球</text>
          <text class="ball-score">6分</text>
          <text v-if="isBallHit(6)" class="ball-hit">✓</text>
        </view>
        <view 
          class="ball-btn" 
          :class="{ disabled: !canHitColorBall(7) }"
          @tap="addScoreSafe(7)"
        >
          <view class="ball-icon">⚫</view>
          <text class="ball-label">黑球</text>
          <text class="ball-score">7分</text>
          <text v-if="isBallHit(7)" class="ball-hit">✓</text>
        </view>
        <view class="ball-btn foul-btn" @tap="handleFoulSafe">
          <view class="ball-icon">⛔</view>
          <text class="ball-label">犯规</text>
          <text class="ball-score">罚分</text>
        </view>
      </view>
    </view>



    <view v-if="config.gameRounds" class="round-controls-section">
      <view class="round-control-btn" @tap="nextRoundSafe">
        <text class="btn-icon">📋</text>
        <text class="btn-text">下一局</text>
      </view>
    </view>

    <view class="confirm-section">
      <view class="confirm-btn" @tap="confirmWin">
        <text>确认胜利</text>
      </view>
    </view>

    <view v-if="showFoulModal" class="foul-modal-mask" @tap="closeFoulModal">
      <view class="foul-modal" @tap.stop>
        <view class="foul-modal-title">选择罚分</view>
        <view class="foul-modal-content">
          <view 
            v-for="points in [4, 5, 6, 7]" 
            :key="points" 
            class="foul-points-btn"
            @tap="selectFoulPoints(points)"
          >
            <text class="foul-points-value">{{ points }}</text>
            <text class="foul-points-label">分</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showRecordsModal" class="records-modal-mask" @tap="closeRecordsModal">
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
import { ref, reactive, onMounted } from 'vue';

interface SnookerConfig {
  playerCount: number;
  playerNames: string[];
  mode: 'single' | 'double';
  gameRounds: number | null;
  enableBreakStats: boolean;
  enableFoulPenalty: boolean;
  gameTimeMinutes: number | null;
}

interface Player {
  name: string;
  score: number;
  streak: number;
  highestStreak: number;
  highestBreak: number;
  redBallsHit: number;
  yellowBallsHit: number;
  greenBallsHit: number;
  brownBallsHit: number;
  blueBallsHit: number;
  pinkBallsHit: number;
  blackBallsHit: number;
}

const PLAYER_COLORS = [
  'linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%)',
  'linear-gradient(135deg, #ff6b6b 0%, #c94c4c 100%)',
  'linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)',
  'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
];

const config = reactive<SnookerConfig>({
  playerCount: 2,
  playerNames: ['选手1', '选手2'],
  mode: 'single',
  gameRounds: null,
  enableBreakStats: true,
  enableFoulPenalty: true,
  gameTimeMinutes: null
});

const players = ref<Player[]>([
  { name: '选手1', score: 0, streak: 0, highestStreak: 0, highestBreak: 0, redBallsHit: 0, yellowBallsHit: 0, greenBallsHit: 0, brownBallsHit: 0, blueBallsHit: 0, pinkBallsHit: 0, blackBallsHit: 0 },
  { name: '选手2', score: 0, streak: 0, highestStreak: 0, highestBreak: 0, redBallsHit: 0, yellowBallsHit: 0, greenBallsHit: 0, brownBallsHit: 0, blueBallsHit: 0, pinkBallsHit: 0, blackBallsHit: 0 }
]);

const currentPlayer = ref(0);
const currentBreak = ref(0);
const redBallsRemaining = ref(15);
const isProcessing = ref(false);
const currentRound = ref(1);
const lastHitWasRed = ref(false);
const remainingColorBalls = ref<number[]>([2, 3, 4, 5, 6, 7]);
const isColorPhase = ref(false);
const showFoulModal = ref(false);
const showRecordsModal = ref(false);

interface OperationRecord {
  id: number;
  time: string;
  playerName: string;
  action: 'hit' | 'foul' | 'switch' | 'undo' | 'reset';
  ballType?: string;
  points?: number;
  description: string;
}

const operationRecords = ref<OperationRecord[]>([]);
let recordId = 0;

const breakBalls = ref({
  red: 0,
  yellow: 0,
  green: 0,
  brown: 0,
  blue: 0,
  pink: 0,
  black: 0
});

interface HistoryState {
  players: Player[];
  currentPlayer: number;
  currentBreak: number;
  redBallsRemaining: number;
  currentRound: number;
  lastHitWasRed: boolean;
  remainingColorBalls: number[];
  isColorPhase: boolean;
}
const historyStack = ref<HistoryState[]>([]);

onMounted(() => {
  try {
    const savedConfig = uni.getStorageSync('snooker_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      Object.assign(config, parsed);
      initPlayers();
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
});

function initPlayers() {
  players.value = config.playerNames.map(name => ({
    name,
    score: 0,
    streak: 0,
    highestStreak: 0,
    highestBreak: 0,
    redBallsHit: 0,
    yellowBallsHit: 0,
    greenBallsHit: 0,
    brownBallsHit: 0,
    blueBallsHit: 0,
    pinkBallsHit: 0,
    blackBallsHit: 0
  }));
}

function addOperationRecord(record: Omit<OperationRecord, 'id' | 'time'>) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  operationRecords.value.unshift({
    ...record,
    id: ++recordId,
    time: timeStr
  });
  if (operationRecords.value.length > 100) {
    operationRecords.value.pop();
  }
}

function getBallName(points: number): string {
  const ballNames: Record<number, string> = {
    1: '红球',
    2: '黄球',
    3: '绿球',
    4: '棕球',
    5: '蓝球',
    6: '粉球',
    7: '黑球'
  };
  return ballNames[points] || '未知';
}

function goBack() {
  uni.navigateBack();
}

function saveHistory() {
  historyStack.value.push({
    players: JSON.parse(JSON.stringify(players.value)),
    currentPlayer: currentPlayer.value,
    currentBreak: currentBreak.value,
    redBallsRemaining: redBallsRemaining.value,
    currentRound: currentRound.value,
    lastHitWasRed: lastHitWasRed.value,
    remainingColorBalls: [...remainingColorBalls.value],
    isColorPhase: isColorPhase.value
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
  
  const lastState = historyStack.value.pop()!;
  players.value = lastState.players;
  currentPlayer.value = lastState.currentPlayer;
  currentBreak.value = lastState.currentBreak;
  redBallsRemaining.value = lastState.redBallsRemaining;
  currentRound.value = lastState.currentRound;
  lastHitWasRed.value = lastState.lastHitWasRed;
  remainingColorBalls.value = [...lastState.remainingColorBalls];
  isColorPhase.value = lastState.isColorPhase;
  
  uni.showToast({ title: '已撤销', icon: 'success' });
}

function resetGame() {
  uni.showModal({
    title: '确认重置',
    content: '确定要重置比赛吗？所有数据将被清除。',
    success: (res) => {
      if (res.confirm) {
        initPlayers();
        currentPlayer.value = 0;
        currentBreak.value = 0;
        redBallsRemaining.value = 15;
        lastHitWasRed.value = false;
        remainingColorBalls.value = [2, 3, 4, 5, 6, 7];
        isColorPhase.value = false;
        breakBalls.value = { red: 0, yellow: 0, green: 0, brown: 0, blue: 0, pink: 0, black: 0 };
        historyStack.value = [];
        uni.showToast({ title: '已重置', icon: 'success' });
      }
    }
  });
}

function addScore(points: number) {
  saveHistory();
  
  const player = players.value[currentPlayer.value];
  player.score += points;
  player.streak++;
  if (player.streak > player.highestStreak) {
    player.highestStreak = player.streak;
  }
  currentBreak.value += points;
  if (currentBreak.value > player.highestBreak) {
    player.highestBreak = currentBreak.value;
  }
  
  const ballName = getBallName(points);
  
  if (points === 1) {
    player.redBallsHit++;
    breakBalls.value.red++;
    redBallsRemaining.value = Math.max(0, redBallsRemaining.value - 1);
    lastHitWasRed.value = true;
  } else {
    lastHitWasRed.value = false;
    
    switch(points) {
      case 2: player.yellowBallsHit++; breakBalls.value.yellow++; break;
      case 3: player.greenBallsHit++; breakBalls.value.green++; break;
      case 4: player.brownBallsHit++; breakBalls.value.brown++; break;
      case 5: player.blueBallsHit++; breakBalls.value.blue++; break;
      case 6: player.pinkBallsHit++; breakBalls.value.pink++; break;
      case 7: player.blackBallsHit++; breakBalls.value.black++; break;
    }
    
    if (isColorPhase.value) {
      const index = remainingColorBalls.value.indexOf(points);
      if (index > -1) {
        remainingColorBalls.value.splice(index, 1);
      }
    } else if (redBallsRemaining.value <= 0) {
      isColorPhase.value = true;
    }
  }
}

function addScoreSafe(points: number) {
  if (isProcessing.value) return;
  
  if (points === 1 && redBallsRemaining.value <= 0) {
    uni.showToast({ title: '红球已用完', icon: 'none' });
    return;
  }
  
  if (points === 1 && lastHitWasRed.value && redBallsRemaining.value > 0) {
    uni.showToast({ title: '请先击打彩球', icon: 'none' });
    return;
  }
  
  if (points > 1 && !lastHitWasRed.value && redBallsRemaining.value > 0 && !isColorPhase.value) {
    uni.showToast({ title: '请先击打红球', icon: 'none' });
    return;
  }
  
  if (isColorPhase.value) {
    if (remainingColorBalls.value.length === 0) {
      uni.showToast({ title: '所有球已打完', icon: 'none' });
      return;
    }
    
    const nextBall = remainingColorBalls.value[0];
    if (points !== nextBall) {
      const ballNames: Record<number, string> = {
        2: '黄球',
        3: '绿球',
        4: '棕球',
        5: '蓝球',
        6: '粉球',
        7: '黑球'
      };
      uni.showToast({ title: `请先击打${ballNames[nextBall]}`, icon: 'none' });
      return;
    }
  }
  
  isProcessing.value = true;
  
  const player = players.value[currentPlayer.value];
  const ballName = getBallName(points);
  
  addOperationRecord({
    playerName: player.name,
    action: 'hit',
    ballType: ballName,
    points: points,
    description: `${player.name} 击打${ballName}，得${points}分`
  });
  
  addScore(points);
  
  setTimeout(() => {
    isProcessing.value = false;
  }, 300);
}

function subtractScore() {
  saveHistory();
  
  const player = players.value[currentPlayer.value];
  if (player.score > 0) {
    player.score--;
  }
}

function subtractScoreSafe() {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  subtractScore();
  setTimeout(() => {
    isProcessing.value = false;
  }, 300);
}

function canHitColorBall(points: number): boolean {
  if (redBallsRemaining.value > 0 && !isColorPhase.value) {
    return lastHitWasRed.value;
  }
  
  if (isColorPhase.value) {
    if (remainingColorBalls.value.length === 0) {
      return false;
    }
    return remainingColorBalls.value[0] === points;
  }
  
  if (redBallsRemaining.value === 0 && lastHitWasRed.value && !isColorPhase.value) {
    return true;
  }
  
  return false;
}

function isBallHit(points: number): boolean {
  if (!isColorPhase.value) {
    return false;
  }
  
  return !remainingColorBalls.value.includes(points);
}

function handleFoul(foulPoints: number) {
  saveHistory();
  
  const current = players.value[currentPlayer.value];
  
  if (config.enableFoulPenalty) {
    current.score = Math.max(0, current.score - foulPoints);
  }
  
  const nextIndex = (currentPlayer.value + 1) % players.value.length;
  players.value[nextIndex].score += foulPoints;
  
  currentBreak.value = 0;
  current.streak = 0;
  
  switchPlayer(nextIndex);
}

function handleFoulSafe() {
  if (isProcessing.value) return;
  showFoulModal.value = true;
}

function closeFoulModal() {
  showFoulModal.value = false;
}

function showFullRecords() {
  showRecordsModal.value = true;
}

function closeRecordsModal() {
  showRecordsModal.value = false;
}

function selectFoulPoints(points: number) {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  showFoulModal.value = false;
  
  const foulPlayer = players.value[currentPlayer.value];
  const nextIndex = (currentPlayer.value + 1) % players.value.length;
  const nextPlayer = players.value[nextIndex];
  
  handleFoul(points);
  
  addOperationRecord({
    playerName: foulPlayer.name,
    action: 'foul',
    points: points,
    description: `${foulPlayer.name} 犯规，罚${points}分，${nextPlayer.name}获得${points}分`
  });
  
  uni.showToast({ title: `罚${points}分`, icon: 'none' });
  setTimeout(() => {
    isProcessing.value = false;
  }, 300);
}

function switchPlayer(index: number) {
  if (index !== currentPlayer.value) {
    const previousPlayer = players.value[currentPlayer.value];
    
    const totalBalls = breakBalls.value.red + breakBalls.value.yellow + breakBalls.value.green + 
                       breakBalls.value.brown + breakBalls.value.blue + breakBalls.value.pink + breakBalls.value.black;
    const breakScore = currentBreak.value;
    
    const ballCounts: string[] = [];
    if (breakBalls.value.red > 0) {
      ballCounts.push(`红球${breakBalls.value.red}`);
    }
    if (breakBalls.value.yellow > 0) {
      ballCounts.push(`黄球${breakBalls.value.yellow}`);
    }
    if (breakBalls.value.green > 0) {
      ballCounts.push(`绿球${breakBalls.value.green}`);
    }
    if (breakBalls.value.brown > 0) {
      ballCounts.push(`棕球${breakBalls.value.brown}`);
    }
    if (breakBalls.value.blue > 0) {
      ballCounts.push(`蓝球${breakBalls.value.blue}`);
    }
    if (breakBalls.value.pink > 0) {
      ballCounts.push(`粉球${breakBalls.value.pink}`);
    }
    if (breakBalls.value.black > 0) {
      ballCounts.push(`黑球${breakBalls.value.black}`);
    }
    
    players.value[currentPlayer.value].streak = 0;
    currentPlayer.value = index;
    currentBreak.value = 0;
    lastHitWasRed.value = false;
    breakBalls.value = { red: 0, yellow: 0, green: 0, brown: 0, blue: 0, pink: 0, black: 0 };
    
    if (totalBalls > 0) {
      addOperationRecord({
        playerName: previousPlayer.name,
        action: 'switch',
        description: `${previousPlayer.name} 单杆：连续击球${totalBalls}次（${ballCounts.join('，')}），得${breakScore}分`
      });
    }
    
    addOperationRecord({
      playerName: players.value[index].name,
      action: 'switch',
      description: `切换选手 → ${players.value[index].name}`
    });
  }
}

function nextPlayer() {
  const nextIndex = (currentPlayer.value + 1) % players.value.length;
  switchPlayer(nextIndex);
}

function nextPlayerSafe() {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  nextPlayer();
  uni.showToast({ 
    title: `${players.value[currentPlayer.value].name}`, 
    icon: 'none' 
  });
  setTimeout(() => {
    isProcessing.value = false;
  }, 300);
}

function nextRound() {
  if (config.gameRounds && currentRound.value >= config.gameRounds) {
    uni.showToast({ title: '已达到最大局数', icon: 'none' });
    return;
  }
  
  currentRound.value++;
  currentPlayer.value = 0;
  currentBreak.value = 0;
  redBallsRemaining.value = 15;
  lastHitWasRed.value = false;
  remainingColorBalls.value = [2, 3, 4, 5, 6, 7];
  isColorPhase.value = false;
  
  players.value.forEach(player => {
    player.streak = 0;
  });
}

function nextRoundSafe() {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  nextRound();
  uni.showToast({ title: `第 ${currentRound.value} 局开始`, icon: 'none' });
  setTimeout(() => {
    isProcessing.value = false;
  }, 300);
}

function confirmWin() {
  const winner = players.value[currentPlayer.value];
  uni.showModal({
    title: '确认胜利',
    content: `${winner.name} 获胜？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: `${winner.name} 获胜！`, icon: 'success' });
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.scoreboard-page {
  min-height: 100vh;
  background: #000;
  padding-bottom: 200rpx;
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
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  text {
    color: #fff;
    font-size: 26rpx;
  }
}

.current-break-section {
  padding: 15rpx;
  background: rgba(255, 140, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  align-items: center;
}

.round-info {
  display: flex;
  align-items: center;
}

.round-label {
  color: #ff8c00;
  font-size: 28rpx;
  font-weight: bold;
}

.break-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.break-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
}

.break-value {
  color: #ff8c00;
  font-size: 36rpx;
  font-weight: bold;
}

.players-section {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  overflow-y: auto;
  max-height: calc(100vh - 280rpx);
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

.player-card-inner {
  display: flex;
  flex-direction: column;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 20rpx;
}

.main-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
}

.score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-column {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 22rpx;
}

.stat-value {
  color: #ff8c00;
  font-size: 32rpx;
  font-weight: bold;
}

.player-name {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.score-value {
  color: #ff8c00;
  font-size: 80rpx;
  font-weight: bold;
}

.balls-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 30rpx;
  padding: 10rpx 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.ball-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}

.ball-color {
  font-size: 24rpx;
}

.ball-count {
  color: #ff8c00;
  font-size: 22rpx;
  font-weight: bold;
}

.operation-records-section {
  padding: 15rpx 20rpx;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 12rpx;
  margin: 15rpx 20rpx;
  margin-bottom: 380rpx;
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
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
}

.records-modal-mask {
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
  width: 90%;
  max-height: 70%;
  background: rgba(26, 26, 46, 0.98);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 140, 0, 0.3);
  overflow: hidden;
}

.records-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
}

.records-modal-list {
  max-height: calc(70vh - 120rpx);
  padding: 20rpx;
}

.records-list {
  height: 300rpx;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8rpx;
  padding: 10rpx;
}

.record-item {
  display: flex;
  gap: 15rpx;
  padding: 10rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
  
  &.hit {
    .record-desc {
      color: #4ecdc4;
    }
  }
  
  &.foul {
    .record-desc {
      color: #ff6b6b;
    }
  }
  
  &.switch {
    .record-desc {
      color: #a855f7;
    }
  }
}

.record-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 22rpx;
  font-family: monospace;
  flex-shrink: 0;
}

.record-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
  flex: 1;
}

.empty-records {
  text-align: center;
  padding: 30rpx;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
}

.balls-section {
  position: fixed;
  bottom: 120rpx;
  left: 0;
  right: 0;
  padding: 20rpx;
  padding-bottom: 30rpx;
  background: rgba(0, 0, 0, 0.95);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.balls-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15rpx;
}

.ball-btn {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 20rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 140, 0, 0.2);
  }
  
  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.ball-icon {
  font-size: 40rpx;
}

.ball-label {
  color: #fff;
  font-size: 24rpx;
}

.ball-score {
  color: #ff8c00;
  font-size: 22rpx;
  font-weight: bold;
}

.ball-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 20rpx;
}

.ball-hit {
  color: #28a745;
  font-size: 20rpx;
  font-weight: bold;
}

.break-stat {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 15rpx;
  margin-left: auto;
}

.break-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 20rpx;
}

.break-value {
  color: #ff8c00;
  font-size: 28rpx;
  font-weight: bold;
}

.round-controls-section {
  padding: 0 20rpx;
  display: flex;
  gap: 15rpx;
}

.round-control-btn {
  flex: 1;
  background: rgba(74, 158, 255, 0.2);
  border-radius: 16rpx;
  padding: 20rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    background: rgba(74, 158, 255, 0.4);
  }
  
  .btn-icon {
    font-size: 36rpx;
  }
  
  .btn-text {
    color: #4a9eff;
    font-size: 24rpx;
  }
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

.confirm-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: #1a1a2e;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.confirm-btn {
  height: 100rpx;
  background: linear-gradient(135deg, #ff8c00 0%, #ff6b35 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.foul-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.foul-modal {
  width: 600rpx;
  background: #1a1a2e;
  border-radius: 20rpx;
  overflow: hidden;
  border: 2rpx solid #ff8c00;
}

.foul-modal-title {
  padding: 30rpx;
  text-align: center;
  color: #ff8c00;
  font-size: 32rpx;
  font-weight: bold;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.foul-modal-content {
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-around;
}

.foul-points-btn {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 140, 0, 0.2);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5rpx;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    background: rgba(255, 140, 0, 0.4);
  }
}

.foul-points-value {
  color: #ff8c00;
  font-size: 36rpx;
  font-weight: bold;
}

.foul-points-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 20rpx;
}
</style>

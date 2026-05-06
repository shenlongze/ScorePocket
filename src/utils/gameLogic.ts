import type { MatchConfig, Player, ActionRecord } from '@/data/types';
import { savePlayers, saveRecords, generateRecordId } from './storage';

let currentPlayOrder: number[] = [];
let playOrderChanged = false;

export function assignBalls(playerCount: number, totalBalls: number = 15): Map<number, number[]> {
  const ballsPerPlayer = Math.floor(totalBalls / playerCount);
  const remainder = totalBalls % playerCount;
  const allBalls = Array.from({ length: totalBalls }, (_, i) => i + 1);
  
  for (let i = allBalls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allBalls[i], allBalls[j]] = [allBalls[j], allBalls[i]];
  }
  
  const playerBalls = new Map<number, number[]>();
  let ballIndex = 0;
  
  for (let i = 0; i < playerCount; i++) {
    const count = ballsPerPlayer + (i < remainder ? 1 : 0);
    playerBalls.set(i, allBalls.slice(ballIndex, ballIndex + count));
    ballIndex += count;
  }
  
  return playerBalls;
}

export function checkWinCondition(playerBalls: Map<number, number[]>, remainingBalls: number[]): number | null {
  let lastPlayer: number | null = null;
  let remainingCount = 0;
  
  for (const [playerId, balls] of playerBalls) {
    const playerRemaining = balls.filter(b => remainingBalls.includes(b));
    if (playerRemaining.length > 0) {
      lastPlayer = playerId;
      remainingCount++;
    }
  }
  
  return remainingCount === 1 ? lastPlayer : null;
}

export function calculateSnookerFoul(foulType: string): number {
  const foulPoints: Record<string, number> = {
    'miss': 4,
    'cue_ball_fall': 4,
    'wrong_ball': 4,
    'no_contact': 4,
    'foul_red': 4,
    'foul_yellow': 2,
    'foul_green': 3,
    'foul_brown': 4,
    'foul_blue': 5,
    'foul_pink': 6,
    'foul_black': 7
  };
  return foulPoints[foulType] || 4;
}

export function getNextBall(balls: number[], gameType: string, currentPlayer?: number): number | null {
  if (gameType === 'nineball') {
    const sorted = [...balls].sort((a, b) => a - b);
    return sorted.length > 0 ? sorted[0] : null;
  }
  return null;
}

export function generateRoomCode(): string {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateWinner(player1Score: number, player2Score: number, bestOf: number): number | null {
  const needed = Math.ceil(bestOf / 2);
  if (player1Score >= needed) return 1;
  if (player2Score >= needed) return 2;
  return null;
}

export function initPlayOrder(playerCount: number): number[] {
  currentPlayOrder = Array.from({ length: playerCount }, (_, i) => i + 1);
  return currentPlayOrder;
}

export function updatePlayOrder(winnerId: number): void {
  const winnerIndex = currentPlayOrder.findIndex(id => id === winnerId);
  if (winnerIndex === -1) return;
  
  const prevPlayerId = getPrevPlayer(winnerId);
  const others = currentPlayOrder.filter(id => id !== winnerId && id !== prevPlayerId);
  
  currentPlayOrder = [winnerId, prevPlayerId, ...others];
  playOrderChanged = true;
}

export function getNextPlayer(currentPlayerId: number): number {
  const currentIndex = currentPlayOrder.findIndex(id => id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % currentPlayOrder.length;
  return currentPlayOrder[nextIndex];
}

export function getPrevPlayer(currentPlayerId: number): number {
  const currentIndex = currentPlayOrder.findIndex(id => id === currentPlayerId);
  const prevIndex = (currentIndex - 1 + currentPlayOrder.length) % currentPlayOrder.length;
  return currentPlayOrder[prevIndex];
}

export function getPlayOrder(): number[] {
  if (currentPlayOrder.length === 0) {
    const players = getCurrentPlayers();
    if (players.length > 0) {
      currentPlayOrder = players.map(p => p.id).sort((a, b) => a - b);
    }
  }
  return [...currentPlayOrder];
}

export function getCurrentPlayers(): Player[] {
  try {
    const data = uni.getStorageSync('nineball_players');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getMatchConfig(): MatchConfig {
  try {
    const data = uni.getStorageSync('nineball_config');
    return data ? JSON.parse(data) : {
      targetBalls: 9,
      playerCount: 2,
      playerNames: ['玩家1', '玩家2'],
      baseScore: 100,
      scoreSettings: {
        normalWin: 4,
        smallGolden: 7,
        bigGolden: 10,
        goldenNine: 4
      },
      chainEnabled: false,
      chainSettings: {
        requiredStreak: 3,
        bonusPoints: 2
      },
      multiplierEnabled: false,
      multiplier: 2,
      gameTime: null,
      gameRounds: null
    };
  } catch {
    return {
      targetBalls: 9,
      playerCount: 2,
      playerNames: ['玩家1', '玩家2'],
      baseScore: 100,
      scoreSettings: {
        normalWin: 4,
        smallGolden: 7,
        bigGolden: 10,
        goldenNine: 4
      },
      chainEnabled: false,
      chainSettings: {
        requiredStreak: 3,
        bonusPoints: 2
      },
      multiplierEnabled: false,
      multiplier: 2,
      gameTime: null,
      gameRounds: null
    };
  }
}

export function getPlayer(playerId: number): Player | undefined {
  const players = getCurrentPlayers();
  return players.find(p => p.id === playerId);
}

export function resetPlayerStreak(playerId?: number): void {
  const players = getCurrentPlayers();
  players.forEach(player => {
    if (!playerId || player.id === playerId) {
      player.currentStreak = 0;
    }
  });
  savePlayers(players);
}

export function handleTurnSwitch(currentPlayerId: number): void {
  resetPlayerStreak(currentPlayerId);
}

export function calculateWinScore(scoreType: 'normalWin' | 'smallGolden' | 'bigGolden' | 'goldenNine', winnerId: number): void {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const winner = players.find(p => p.id === winnerId);
  if (!winner) return;

  let scoreValue = 0;
  switch (scoreType) {
    case 'normalWin': scoreValue = Number(config.scoreSettings.normalWin); break;
    case 'smallGolden': scoreValue = Number(config.scoreSettings.smallGolden); break;
    case 'bigGolden': scoreValue = Number(config.scoreSettings.bigGolden); break;
    case 'goldenNine': scoreValue = Number(config.scoreSettings.goldenNine); break;
  }

  const multiplier = Number(config.multiplierEnabled ? config.multiplier : 1);
  const multipliedScore = scoreValue * multiplier;

  winner.score = Number(winner.score) + multipliedScore;
  
  let isPrevOnly = false;
  switch (scoreType) {
    case 'normalWin':
      isPrevOnly = true;
      break;
    case 'smallGolden':
      isPrevOnly = config.smallGoldenScope === 'prev';
      break;
    case 'bigGolden':
      isPrevOnly = config.bigGoldenScope === 'prev';
      break;
    case 'goldenNine':
      isPrevOnly = config.goldenNineScope === 'prev';
      break;
  }
  
  if (isPrevOnly) {
    const prevPlayerId = getPrevPlayer(winnerId);
    const prevPlayer = players.find(p => p.id === prevPlayerId);
    if (prevPlayer) {
      prevPlayer.score = Number(prevPlayer.score) - multipliedScore;
    }
  } else {
    players.forEach(player => {
      if (player.id !== winnerId) {
        player.score = Number(player.score) - multipliedScore;
      }
    });
  }

  savePlayers(players);
}

export function handleBonus(playerId: number): boolean {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const player = players.find(p => p.id === playerId);
  if (!player || !config.chainEnabled) return false;

  const bonusPoints = Number(config.chainSettings.bonusPoints);
  const prevPlayerId = getPrevPlayer(playerId);
  const prevPlayer = players.find(p => p.id === prevPlayerId);
  
  if (!prevPlayer) return false;

  player.stats.bonus++;
  player.score = Number(player.score) + bonusPoints;
  prevPlayer.score = Number(prevPlayer.score) - bonusPoints;
  
  addRecord({
    type: 'bonus',
    playerId: playerId,
    targetPlayerId: prevPlayerId,
    points: bonusPoints,
    description: `${player.name} 伴彩 → ${player.name}+${bonusPoints}分，${prevPlayer.name}-${bonusPoints}分`
  });

  savePlayers(players);
  return true;
}

export function addRecord(record: Omit<ActionRecord, 'id' | 'time'>): void {
  const records = loadRecords();
  const newRecord: ActionRecord = {
    ...record,
    id: generateRecordId(),
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
  records.unshift(newRecord);
  saveRecords(records);
}

export function loadRecords(): ActionRecord[] {
  try {
    const data = uni.getStorageSync('nineball_records');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function handleFoul(foulerId: number): void {
  const players = getCurrentPlayers();
  const fouler = players.find(p => p.id === foulerId);
  if (!fouler) return;
  
  const nextPlayerId = getNextPlayer(foulerId);
  const prevPlayerId = getPrevPlayer(foulerId);
  const nextPlayer = players.find(p => p.id === nextPlayerId);
  const prevPlayer = players.find(p => p.id === prevPlayerId);
  
  if (!nextPlayer || !prevPlayer) return;

  fouler.stats.foul++;
  resetPlayerStreak(foulerId);
  fouler.score = Number(fouler.score) - 1;
  prevPlayer.score = Number(prevPlayer.score) + 1;
  
  addRecord({
    type: 'foul',
    playerId: foulerId,
    targetPlayerId: prevPlayerId,
    points: 1,
    description: `${fouler.name} 犯规 → ${fouler.name}-1分，${prevPlayer.name}+1分，${nextPlayer.name}获得自由球`
  });
  
  savePlayers(players);
}

export function calculateScore(basePoints: number, playerId: number, scoreType?: 'normalWin' | 'smallGolden' | 'bigGolden' | 'goldenNine'): number {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const player = players.find(p => p.id === playerId);
  if (!player) return basePoints;
  
  let total = basePoints;

  if (scoreType) {
    let scoreValue = 0;
    switch (scoreType) {
      case 'normalWin': scoreValue = config.scoreSettings.normalWin; break;
      case 'smallGolden': scoreValue = config.scoreSettings.smallGolden; break;
      case 'bigGolden': scoreValue = config.scoreSettings.bigGolden; break;
      case 'goldenNine': scoreValue = config.scoreSettings.goldenNine; break;
    }
    total += scoreValue * (config.multiplierEnabled ? config.multiplier : 1);
  }

  if (config.chainEnabled && player.currentStreak >= config.chainSettings.requiredStreak) {
    total += config.chainSettings.bonusPoints;
    player.currentStreak = 0;
    player.stats.bonus++;
  } else {
    player.currentStreak++;
  }

  savePlayers(players);
  return total;
}

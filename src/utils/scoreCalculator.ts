import type { MatchConfig, Player, ActionRecord } from '@/data/types';
import { savePlayers, saveRecords, generateRecordId, loadRecords } from './storage';
import { getPrevPlayer, getNextPlayer, getCurrentPlayers } from './gameState';

export function getMatchConfig(): MatchConfig {
  try {
    const data = uni.getStorageSync('nineball_config');
    if (data) {
      const config = JSON.parse(data);
      if (!config.scoreSettings.foul) config.scoreSettings.foul = 1;
      if (!config.foulScope) config.foulScope = 'prev';
      if (!config.smallGoldenScope) config.smallGoldenScope = 'prev';
      if (!config.bigGoldenScope) config.bigGoldenScope = 'all';
      if (!config.goldenNineScope) config.goldenNineScope = 'all';
      return config;
    }
    return getDefaultConfig();
  } catch {
    return getDefaultConfig();
  }
}

function getDefaultConfig(): MatchConfig {
  return {
    targetBalls: 9,
    playerCount: 2,
    playerNames: ['玩家1', '玩家2'],
    baseScore: 100,
    scoreSettings: {
      normalWin: 4,
      smallGolden: 7,
      bigGolden: 10,
      goldenNine: 4,
      foul: 1,
    },
    smallGoldenScope: 'prev',
    bigGoldenScope: 'all',
    goldenNineScope: 'all',
    foulScope: 'prev',
    chainEnabled: false,
    chainSettings: {
      requiredStreak: 3,
      bonusPoints: 2,
    },
    multiplierEnabled: false,
    multiplier: 2,
    gameTime: null,
    gameRounds: null,
    opponentDeductEnabled: true,
  };
}

export function calculateWinScore(
  scoreType: 'normalWin' | 'smallGolden' | 'bigGolden' | 'goldenNine',
  winnerId: number
): void {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const winner = players.find((p) => p.id === winnerId);
  if (!winner) return;

  let scoreValue = 0;
  switch (scoreType) {
    case 'normalWin':
      scoreValue = Number(config.scoreSettings.normalWin);
      break;
    case 'smallGolden':
      scoreValue = Number(config.scoreSettings.smallGolden);
      break;
    case 'bigGolden':
      scoreValue = Number(config.scoreSettings.bigGolden);
      break;
    case 'goldenNine':
      scoreValue = Number(config.scoreSettings.goldenNine);
      break;
  }

  const multiplier = Number(config.multiplierEnabled ? config.multiplier : 1);
  const multipliedScore = scoreValue * multiplier;

  winner.score = Number(winner.score) + multipliedScore;

  if (config.opponentDeductEnabled) {
    const isPrevOnly = scoreType === 'normalWin' || scoreType === 'smallGolden';

    if (isPrevOnly) {
      const prevPlayerId = getPrevPlayer(winnerId);
      const prevPlayer = players.find((p) => p.id === prevPlayerId);
      if (prevPlayer) {
        prevPlayer.score = Number(prevPlayer.score) - multipliedScore;
      }
    } else {
      players.forEach((player) => {
        if (player.id !== winnerId) {
          player.score = Number(player.score) - multipliedScore;
        }
      });
    }
  }

  savePlayers(players);
}

export function handleBonus(playerId: number): boolean {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const player = players.find((p) => p.id === playerId);
  if (!player || !config.chainEnabled) return false;

  const bonusPoints = Number(config.chainSettings.bonusPoints);
  const prevPlayerId = getPrevPlayer(playerId);
  const prevPlayer = players.find((p) => p.id === prevPlayerId);

  if (!prevPlayer) return false;

  player.stats.bonus++;
  player.score = Number(player.score) + bonusPoints;
  prevPlayer.score = Number(prevPlayer.score) - bonusPoints;

  addRecord({
    type: 'bonus',
    playerId: playerId,
    targetPlayerId: prevPlayerId,
    points: bonusPoints,
    description: `${player.name} 伴彩 → ${player.name}+${bonusPoints}分，${prevPlayer.name}-${bonusPoints}分`,
  });

  savePlayers(players);
  return true;
}

export function handleFoul(foulerId: number): void {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const fouler = players.find((p) => p.id === foulerId);
  if (!fouler) return;

  const nextPlayerId = getNextPlayer(foulerId);
  const nextPlayer = players.find((p) => p.id === nextPlayerId);

  if (!nextPlayer) return;

  const foulPoints = Number(config.scoreSettings.foul);
  const isPrevOnly = config.foulScope === 'prev';

  fouler.stats.foul++;
  resetPlayerStreak(foulerId);

  if (config.opponentDeductEnabled) {
    fouler.score = Number(fouler.score) - foulPoints;
  }

  let targetDescription = '';

  if (isPrevOnly) {
    const prevPlayerId = getPrevPlayer(foulerId);
    const prevPlayer = players.find((p) => p.id === prevPlayerId);
    if (prevPlayer) {
      prevPlayer.score = Number(prevPlayer.score) + foulPoints;
      targetDescription = `${prevPlayer.name}+${foulPoints}分`;
    }
  } else {
    players.forEach((player) => {
      if (player.id !== foulerId) {
        player.score = Number(player.score) + foulPoints;
      }
    });
    const otherNames = players
      .filter((p) => p.id !== foulerId)
      .map((p) => p.name)
      .join('、');
    targetDescription = `${otherNames}+${foulPoints}分`;
  }

  const deductionText = config.opponentDeductEnabled ? `${fouler.name}-${foulPoints}分，` : '';

  addRecord({
    type: 'foul',
    playerId: foulerId,
    points: foulPoints,
    description: `${fouler.name} 犯规 → ${deductionText}${targetDescription}，${nextPlayer.name}获得自由球`,
  });

  savePlayers(players);
}

export function calculateScore(
  basePoints: number,
  playerId: number,
  scoreType?: 'normalWin' | 'smallGolden' | 'bigGolden' | 'goldenNine'
): number {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const player = players.find((p) => p.id === playerId);
  if (!player) return basePoints;

  let total = basePoints;

  if (scoreType) {
    let scoreValue = 0;
    switch (scoreType) {
      case 'normalWin':
        scoreValue = config.scoreSettings.normalWin;
        break;
      case 'smallGolden':
        scoreValue = config.scoreSettings.smallGolden;
        break;
      case 'bigGolden':
        scoreValue = config.scoreSettings.bigGolden;
        break;
      case 'goldenNine':
        scoreValue = config.scoreSettings.goldenNine;
        break;
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

export function resetPlayerStreak(playerId?: number): void {
  const players = getCurrentPlayers();
  players.forEach((player) => {
    if (!playerId || player.id === playerId) {
      player.currentStreak = 0;
    }
  });
  savePlayers(players);
}

export function addRecord(record: Omit<ActionRecord, 'id' | 'time'>): void {
  const records = loadRecords();
  const newRecord: ActionRecord = {
    ...record,
    id: generateRecordId(),
    time: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
  records.unshift(newRecord);
  saveRecords(records);
}

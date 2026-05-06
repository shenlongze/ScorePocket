import type { MatchConfig, Player, ActionRecord, GameState } from '@/data/types';
import { DEFAULT_CONFIG } from '@/data/types';

const STORAGE_KEYS = {
  CONFIG: 'nineball_config',
  GAME_STATE: 'nineball_game_state',
  PLAYERS: 'nineball_players',
  RECORDS: 'nineball_records'
};

export function saveConfig(config: MatchConfig): void {
  uni.setStorageSync(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function loadConfig(): MatchConfig {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function savePlayers(players: Player[]): void {
  uni.setStorageSync(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
}

export function loadPlayers(): Player[] {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.PLAYERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: ActionRecord[]): void {
  uni.setStorageSync(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function loadRecords(): ActionRecord[] {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGameState(state: GameState): void {
  uni.setStorageSync(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
}

export function loadGameState(): GameState | null {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.GAME_STATE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearAllGameData(): void {
  uni.removeStorageSync(STORAGE_KEYS.CONFIG);
  uni.removeStorageSync(STORAGE_KEYS.GAME_STATE);
  uni.removeStorageSync(STORAGE_KEYS.PLAYERS);
  uni.removeStorageSync(STORAGE_KEYS.RECORDS);
}

export function initPlayers(config: MatchConfig): Player[] {
  return config.playerNames.map((name, index) => ({
    id: index + 1,
    name,
    score: config.baseScore,
    stats: {
      foul: 0,
      bonus: 0,
      normalWin: 0,
      bigGolden: 0,
      smallGolden: 0,
      goldenNine: 0
    },
    currentStreak: 0
  }));
}

export function generateRecordId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

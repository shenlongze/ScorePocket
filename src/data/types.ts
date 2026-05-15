export interface MatchConfig {
  targetBalls: number;
  playerCount: number;
  playerNames: string[];
  baseScore: number;
  scoreSettings: {
    normalWin: number;
    smallGolden: number;
    bigGolden: number;
    goldenNine: number;
    foul: number;
  };
  smallGoldenScope: 'all' | 'prev';  // 小金计分范围：'all'全场扣分，'prev'仅上家扣分
  bigGoldenScope: 'all' | 'prev';     // 大金计分范围：'all'全场扣分，'prev'仅上家扣分
  goldenNineScope: 'all' | 'prev';    // 黄金九计分范围：'all'全场扣分，'prev'仅上家扣分
  foulScope: 'all' | 'prev';          // 犯规计分范围：'all'全场扣分，'prev'仅上家扣分
  chainEnabled: boolean;
  chainSettings: {
    requiredStreak: number;
    bonusPoints: number;
  };
  multiplierEnabled: boolean;
  multiplier: number;
  gameTime: number | null;
  gameRounds: number | null;
}

export interface Player {
  id: number;
  name: string;
  score: number;
  stats: {
    foul: number;
    bonus: number;
    normalWin: number;
    bigGolden: number;
    smallGolden: number;
    goldenNine: number;
  };
  currentStreak: number;
}

export interface ActionRecord {
  id: string;
  time: string;
  type: 'foul' | 'normalWin' | 'bigGolden' | 'smallGolden' | 'goldenNine' | 'bonus';
  playerId: number;
  targetPlayerId?: number;
  points: number;
  description: string;
}

export interface GameState {
  config: MatchConfig;
  players: Player[];
  records: ActionRecord[];
  currentPlayerId: number;
  currentRound: number;
  completedRounds: number;
  playOrder: number[];
  timerSeconds: number;
  isCountdown: boolean;
  isTimerRunning: boolean;
}

export const DEFAULT_CONFIG: MatchConfig = {
  targetBalls: 9,
  playerCount: 2,
  playerNames: ['玩家1', '玩家2'],
  baseScore: 100,
  scoreSettings: {
    normalWin: 4,
    smallGolden: 7,
    bigGolden: 10,
    goldenNine: 4,
    foul: 1
  },
  smallGoldenScope: 'prev',
  bigGoldenScope: 'all',
  goldenNineScope: 'all',
  foulScope: 'prev',
  chainEnabled: false,
  chainSettings: {
    requiredStreak: 5,
    bonusPoints: 4
  },
  multiplierEnabled: false,
  multiplier: 2,
  gameTime: null,
  gameRounds: null
};

export const PLAYER_COLORS = [
  '#1a5276',
  '#8b0000',
  '#2d5a27',
  '#8b7355',
  '#4a235a'
];

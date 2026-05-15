export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  stats: GameStats;
}

export interface GameStats {
  zhaQingCount: number;
  jieQingCount: number;
  totalMatches: number;
  winCount: number;
}

export const STORAGE_KEYS = {
  USER_INFO: 'billiards_user_info',
  MATCH_HISTORY: 'billiards_match_history',
  SETTINGS: 'billiards_settings',
};

export function getUserInfo(): UserInfo {
  const stored = uni.getStorageSync(STORAGE_KEYS.USER_INFO);
  if (stored) {
    const data = JSON.parse(stored);
    return {
      ...data,
      stats: data.stats || {
        zhaQingCount: 0,
        jieQingCount: 0,
        totalMatches: 0,
        winCount: 0,
      },
    };
  }
  return {
    id: '',
    nickname: '游客',
    avatar: '',
    stats: {
      zhaQingCount: 0,
      jieQingCount: 0,
      totalMatches: 0,
      winCount: 0,
    },
  };
}

export function saveUserInfo(user: UserInfo): void {
  uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
}

export function isLoggedIn(): boolean {
  return false;
}

export function incrementZhaQing(): void {
  const user = getUserInfo();
  user.stats.zhaQingCount++;
  saveUserInfo(user);
}

export function incrementJieQing(): void {
  const user = getUserInfo();
  user.stats.jieQingCount++;
  saveUserInfo(user);
}

export function incrementTotalMatches(): void {
  const user = getUserInfo();
  user.stats.totalMatches++;
  saveUserInfo(user);
}

export function incrementWinCount(): void {
  const user = getUserInfo();
  user.stats.winCount++;
  saveUserInfo(user);
}

export function logout(): void {
  uni.removeStorageSync(STORAGE_KEYS.USER_INFO);
}

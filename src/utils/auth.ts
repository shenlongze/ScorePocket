export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  isMember: boolean
  memberExpireTime: number
  temporaryUnlocks: string[]
  stats: GameStats
}

export interface GameStats {
  zhaQingCount: number
  jieQingCount: number
  totalMatches: number
  winCount: number
}

export const STORAGE_KEYS = {
  USER_INFO: 'billiards_user_info',
  MATCH_HISTORY: 'billiards_match_history',
  SETTINGS: 'billiards_settings'
}

export function getUserInfo(): UserInfo {
  const stored = uni.getStorageSync(STORAGE_KEYS.USER_INFO)
  if (stored) {
    const data = JSON.parse(stored)
    return {
      ...data,
      stats: data.stats || {
        zhaQingCount: 0,
        jieQingCount: 0,
        totalMatches: 0,
        winCount: 0
      }
    }
  }
  return {
    id: '',
    nickname: '游客',
    avatar: '',
    isMember: false,
    memberExpireTime: 0,
    temporaryUnlocks: [],
    stats: {
      zhaQingCount: 0,
      jieQingCount: 0,
      totalMatches: 0,
      winCount: 0
    }
  }
}

export function saveUserInfo(user: UserInfo): void {
  uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(user))
}

export function isMember(): boolean {
  const user = getUserInfo()
  return user.isMember && user.memberExpireTime > Date.now()
}

export function hasTemporaryUnlock(feature: string): boolean {
  const user = getUserInfo()
  return user.temporaryUnlocks.includes(feature)
}

export function addTemporaryUnlock(feature: string, duration: number = 3600000): void {
  const user = getUserInfo()
  if (!user.temporaryUnlocks.includes(feature)) {
    user.temporaryUnlocks.push(feature)
    saveUserInfo(user)
    setTimeout(() => {
      removeTemporaryUnlock(feature)
    }, duration)
  }
}

export function removeTemporaryUnlock(feature: string): void {
  const user = getUserInfo()
  user.temporaryUnlocks = user.temporaryUnlocks.filter(f => f !== feature)
  saveUserInfo(user)
}

export function canAccessFeature(feature: string): boolean {
  if (isMember()) return true
  if (hasTemporaryUnlock(feature)) return true
  return false
}

export function checkPermission(feature: string): { allowed: boolean; needPay: boolean } {
  if (isMember()) return { allowed: true, needPay: false }
  if (hasTemporaryUnlock(feature)) return { allowed: true, needPay: false }
  return { allowed: false, needPay: true }
}

export function getMemberExpireDays(): number {
  const user = getUserInfo()
  if (!user.isMember || user.memberExpireTime <= Date.now()) return 0
  const diff = user.memberExpireTime - Date.now()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function incrementZhaQing(): void {
  const user = getUserInfo()
  user.stats.zhaQingCount++
  saveUserInfo(user)
}

export function incrementJieQing(): void {
  const user = getUserInfo()
  user.stats.jieQingCount++
  saveUserInfo(user)
}

export function incrementTotalMatches(): void {
  const user = getUserInfo()
  user.stats.totalMatches++
  saveUserInfo(user)
}

export function incrementWinCount(): void {
  const user = getUserInfo()
  user.stats.winCount++
  saveUserInfo(user)
}

export function isLoggedIn(): boolean {
  const user = getUserInfo()
  return user.id !== ''
}

export function isWechatMiniProgram(): boolean {
  try {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.platform === 'ios' || systemInfo.platform === 'android'
  } catch {
    return false
  }
}

export async function wechatLogin(): Promise<UserInfo> {
  return new Promise((resolve, reject) => {
    if (!isWechatMiniProgram()) {
      const mockUserInfo: UserInfo = {
        id: 'mock_user_' + Date.now(),
        nickname: '测试用户',
        avatar: '',
        isMember: false,
        memberExpireTime: 0,
        temporaryUnlocks: [],
        stats: {
          zhaQingCount: 0,
          jieQingCount: 0,
          totalMatches: 0,
          winCount: 0
        }
      }
      saveUserInfo(mockUserInfo)
      resolve(mockUserInfo)
      return
    }

    wx.login({
      success: (loginRes) => {
        wx.getUserProfile({
          desc: '用于完善会员资料',
          success: (userRes) => {
            const userInfo: UserInfo = {
              id: loginRes.code,
              nickname: userRes.userInfo.nickName,
              avatar: userRes.userInfo.avatarUrl,
              isMember: false,
              memberExpireTime: 0,
              temporaryUnlocks: [],
              stats: {
                zhaQingCount: 0,
                jieQingCount: 0,
                totalMatches: 0,
                winCount: 0
              }
            }
            saveUserInfo(userInfo)
            resolve(userInfo)
          },
          fail: (err) => {
            reject(new Error('获取用户信息失败: ' + err.errMsg))
          }
        })
      },
      fail: (err) => {
        reject(new Error('登录失败: ' + err.errMsg))
      }
    })
  })
}

export function logout(): void {
  uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

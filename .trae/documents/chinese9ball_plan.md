
# 中式9球计分系统开发计划

## 一、需求分析

### 1.1 核心犯规规则
- 选手犯规 = 下家获得自由球 + 上家（犯规者的对手）自动加1分
- 系统自动计分、自动记录、自动更新统计

### 1.2 页面需求

| 页面 | 功能描述 |
|------|----------|
| 比赛配置页 | 目标球数、比赛人数(2-5人)、基础分数、普胜/小金/大金分值、链(连续进球附加分)、点(倍数)、时间/局数配置 |
| 记分板页 | N人布局(2-5人)、选手信息、比分展示、统计项(犯规/伴彩/普胜/大金/小金/黄金九)、操作按钮、时间/局数显示 |
| 操作记录页 | 操作时间、类型、内容，支持滚动查看 |

### 1.3 数据联动规则
- 配置页分值自动同步到记分板计算
- 犯规自动触发：下家自由球 + 上家+1分
- 所有操作自动生成记录

---

## 二、项目结构设计

### 2.1 文件结构
```
src/
├── pages/
│   └── game/
│       └── nineball/
│           ├── index.vue          # 记分板主页面
│           ├── config.vue         # 比赛配置页
│           └── records.vue        # 操作记录页
├── components/
│   ├── ScoreBoard.vue            # 记分板组件(适配N人)
│   ├── GameTimer.vue             # 计时器组件
│   └── RecordList.vue            # 记录列表组件
├── utils/
│   ├── gameLogic.ts              # 游戏逻辑工具
│   └── storage.ts                # 本地存储工具
└── data/
    └── types.ts                  # TypeScript类型定义
```

### 2.2 核心数据模型

```typescript
// 比赛配置
interface MatchConfig {
  targetBalls: number           // 目标球数 4-9
  playerCount: number           // 比赛人数 2-5
  playerNames: string[]         // 选手昵称列表
  baseScore: number             // 基础分数
  scoreSettings: {
    normalWin: number           // 普胜分数
    smallGolden: number         // 小金分数
    bigGolden: number           // 大金分数
  }
  chainEnabled: boolean         // 链(连续进球)开关
  chainSettings: {
    requiredStreak: number      // 连续进球数
    bonusPoints: number         // 附加分值
  }
  multiplierEnabled: boolean    // 点(倍数)开关
  multiplier: number            // 倍数(默认2)
  gameTime: number | null       // 比赛时间(秒)，null表示不限制
  gameRounds: number | null     // 比赛局数，null表示不限制
}

// 选手数据
interface Player {
  id: number
  name: string
  score: number
  stats: {
    foul: number                // 犯规次数
    bonus: number               // 伴彩次数
    normalWin: number           // 普胜次数
    bigGolden: number           // 大金次数
    smallGolden: number         // 小金次数
    goldenNine: number          // 黄金九次数
  }
  currentStreak: number         // 当前连续进球数
}

// 操作记录
interface ActionRecord {
  id: string
  time: string                  // 操作时间
  type: 'foul' | 'normalWin' | 'bigGolden' | 'smallGolden' | 'goldenNine' | 'bonus'
  playerId: number              // 操作选手ID
  targetPlayerId?: number       // 目标选手ID(如犯规时的对手)
  points: number                // 得分
  description: string           // 操作描述
}
```

---

## 三、功能实现计划

### 3.1 页面一：比赛配置页 (`pages/game/nineball/config.vue`)

**功能清单：**
| 序号 | 功能点 | 说明 |
|------|--------|------|
| 1 | 目标球数选择 | 单选 4/5/6/7/8/9，默认9球 |
| 2 | 比赛人数输入 | 输入框 2-5，自动生成昵称输入框 |
| 3 | 昵称输入 | 根据人数动态生成，默认"玩家1"、"玩家2"... |
| 4 | 基础分数配置 | 输入框，默认100分 |
| 5 | 普胜分数配置 | 输入框，默认4分 |
| 6 | 小金分数配置 | 输入框，默认7分 |
| 7 | 大金分数配置 | 输入框，默认10分 |
| 8 | 链开关 | 开关控制，默认关闭 |
| 9 | 链配置 | 连续进球数+附加分值输入框 |
| 10 | 点开关 | 开关控制，默认关闭 |
| 11 | 倍数配置 | 输入框，默认2倍 |
| 12 | 比赛时间配置 | 输入框(分钟)，为空表示不限制 |
| 13 | 比赛局数配置 | 输入框，为空表示不限制 |
| 14 | 保存配置 | 本地存储配置 |
| 15 | 开始比赛 | 跳转记分板页 |

### 3.2 页面二：记分板页 (`pages/game/nineball/index.vue`)

**功能清单：**
| 序号 | 功能点 | 说明 |
|------|--------|------|
| 1 | N人布局适配 | 2人:左右两栏；3人:2行(2+1)；4人:2x2；5人:2行(3+2) |
| 2 | 选手名称栏 | 差异化背景色(蓝/红/绿/黄/紫) |
| 3 | 核心比分区 | 超大橙色数字，居中展示 |
| 4 | 统计项展示 | 犯规、伴彩、普胜、大金、小金、黄金九 |
| 5 | 犯规按钮 | 触发犯规逻辑：下家自由球 + 上家+1分 |
| 6 | 伴彩按钮 | 伴彩统计+1 |
| 7 | 普胜按钮 | 基础分+普胜分，统计+1 |
| 8 | 大金按钮 | 基础分+大金分，统计+1 |
| 9 | 小金按钮 | 基础分+小金分，统计+1 |
| 10 | 黄金九按钮 | 基础分+大金分，统计+1 |
| 11 | 计时器展示 | 正计时/倒计时，00:00:00格式 |
| 12 | 局数展示 | 已完成/剩余局数 |
| 13 | 查看记录 | 跳转操作记录页 |
| 14 | 重置比赛 | 重置所有数据 |

### 3.3 页面三：操作记录页 (`pages/game/nineball/records.vue`)

**功能清单：**
| 序号 | 功能点 | 说明 |
|------|--------|------|
| 1 | 记录列表 | 按时间倒序展示 |
| 2 | 操作时间 | 显示操作时间 |
| 3 | 操作类型标签 | 普胜/大金/小金/黄金九/犯规/伴彩 |
| 4 | 操作内容 | 详细描述，如"选手A 普胜 选手B" |
| 5 | 滚动查看 | 支持上下滚动 |
| 6 | 返回记分板 | 返回主页面 |

---

## 四、核心规则与代码实现

### 4.1 选手顺序规则

#### 4.1.1 核心规则定义
- **基础轮次**：默认初始击球顺序为 1→2→3→4→5→1（按选手ID升序）
- **开球权变更**：某选手赢局（普胜/大金/小金/黄金九）后，下一局由该选手率先开球
- **上家/下家定义**：
  - 下家：当前选手的下一个击球者（按当前轮次）
  - 上家：当前选手的上一个击球者（按当前轮次，即犯规时的得分对手）

#### 4.1.2 工具函数实现（src/utils/gameLogic.ts）

```typescript
// 全局维护当前击球轮次（需持久化）
let currentPlayOrder: number[] = [];

/**
 * 初始化击球顺序（首次/重置时调用）
 * @param playerCount 选手人数
 * @returns 初始轮次数组
 */
export function initPlayOrder(playerCount: number): number[] {
  currentPlayOrder = Array.from({ length: playerCount }, (_, i) => i + 1);
  return currentPlayOrder;
}

/**
 * 更新击球顺序（赢局后调用，新开局由赢家先开球）
 * @param winnerId 赢局选手ID
 */
export function updatePlayOrder(winnerId: number): void {
  const winnerIndex = currentPlayOrder.findIndex(id => id === winnerId);
  if (winnerIndex === -1) return;
  // 重新排列：赢家 → 原顺序赢家后选手 → 原顺序赢家前选手
  currentPlayOrder = [
    winnerId,
    ...currentPlayOrder.slice(winnerIndex + 1),
    ...currentPlayOrder.slice(0, winnerIndex)
  ];
}

/**
 * 获取下家（当前选手的下一个击球者）
 * @param currentPlayerId 当前选手ID
 * @returns 下家选手ID
 */
export function getNextPlayer(currentPlayerId: number): number {
  const currentIndex = currentPlayOrder.findIndex(id => id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % currentPlayOrder.length;
  return currentPlayOrder[nextIndex];
}

/**
 * 获取上家（当前选手的上一个击球者，犯规时的得分对手）
 * @param currentPlayerId 当前选手ID
 * @returns 上家选手ID
 */
export function getPrevPlayer(currentPlayerId: number): number {
  const currentIndex = currentPlayOrder.findIndex(id => id === currentPlayerId);
  const prevIndex = (currentIndex - 1 + currentPlayOrder.length) % currentPlayOrder.length;
  return currentPlayOrder[prevIndex];
}
```

### 4.2 连续进球边界规则

#### 4.2.1 核心规则定义
- **有效连续范围**：仅在「单局内、同一选手单次轮次击球」时续算连续进球数
- **重置条件**（满足任一即重置）：
  - 选手犯规
  - 轮次切换（当前选手击球结束，轮到下家击球）
  - 局数完成（该局结束，下一局开始）
- **链触发逻辑**：仅当单局内同一选手单次轮次连续进球数≥链配置的requiredStreak，才触发附加分

#### 4.2.2 代码逻辑实现（src/utils/gameLogic.ts）

```typescript
/**
 * 重置选手连续进球数（犯规/轮次切换/局结束时调用）
 * @param playerId 目标选手ID（不传则重置所有）
 */
export function resetPlayerStreak(playerId?: number): void {
  const players = getCurrentPlayers();
  players.forEach(player => {
    if (!playerId || player.id === playerId) {
      player.currentStreak = 0;
    }
  });
  savePlayersToStorage(players);
}

/**
 * 处理轮次切换（触发连续进球数重置）
 * @param currentPlayerId 当前击球选手ID
 */
export function handleTurnSwitch(currentPlayerId: number): void {
  resetPlayerStreak(currentPlayerId);
}
```

### 4.3 倍数应用范围规则

#### 4.3.1 核心规则定义
- **倍数仅作用于**：「普胜/小金/大金/黄金九」的胜负分值，基础分不参与倍数计算
- **得分逻辑**：赢家总分 = 基础分 +（胜负分值 × 倍数）
- **扣分逻辑**：输家总分 = 基础分 -（胜负分值 × 倍数）
- **多人比赛**：输家为「除赢家外的所有选手」

#### 4.3.2 计分逻辑实现（src/utils/gameLogic.ts）

```typescript
/**
 * 计算单局胜负得分（区分赢家/输家）
 * @param scoreType 得分类型
 * @param winnerId 赢家ID
 */
export function calculateWinScore(scoreType: 'normalWin' | 'smallGolden' | 'bigGolden' | 'goldenNine', winnerId: number): void {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const winner = players.find(p => p.id === winnerId);
  if (!winner) return;

  // 1. 获取对应类型的基础分值
  let scoreValue = 0;
  switch (scoreType) {
    case 'normalWin': scoreValue = config.scoreSettings.normalWin; break;
    case 'smallGolden': scoreValue = config.scoreSettings.smallGolden; break;
    case 'bigGolden': scoreValue = config.scoreSettings.bigGolden; break;
    case 'goldenNine': scoreValue = config.scoreSettings.goldenNine; break;
  }

  // 2. 计算倍数后分值
  const multipliedScore = scoreValue * (config.multiplierEnabled ? config.multiplier : 1);

  // 3. 更新赢家分数
  winner.score = config.baseScore + multipliedScore;
  
  // 4. 更新所有输家分数
  players.forEach(player => {
    if (player.id !== winnerId) {
      player.score = config.baseScore - multipliedScore;
    }
  });

  // 5. 持久化选手数据
  savePlayersToStorage(players);
}
```

### 4.4 黄金九/伴彩计分规则

#### 4.4.1 核心规则定义

**黄金九规则**：
- 在MatchConfig中新增goldenNine独立配置项，默认值=普胜分值
- 黄金九得分逻辑：赢家获得「基础分 +（黄金九分值 × 倍数）」，其余所有选手扣「黄金九分值 × 倍数」
- 黄金九触发后直接完成当前局

**伴彩规则**：
- 伴彩 =「链（连续进球）」，仅统计次数+触发附加分，无独立分值配置
- 伴彩触发条件：连续进球数≥链配置的requiredStreak，附加分=链配置的bonusPoints
- 伴彩仅增加统计次数，附加分计入当前击球的总分（不单独扣分）

#### 4.4.2 代码实现

**1. 扩展MatchConfig类型（src/data/types.ts）**

```typescript
interface MatchConfig {
  targetBalls: number;
  playerCount: number;
  playerNames: string[];
  baseScore: number;
  scoreSettings: {
    normalWin: number;           // 普胜分数
    smallGolden: number;         // 小金分数
    bigGolden: number;           // 大金分数
    goldenNine: number;          // 黄金九分数（新增，默认=normalWin）
  };
  chainEnabled: boolean;         // 链(连续进球)开关
  chainSettings: {
    requiredStreak: number;      // 连续进球数
    bonusPoints: number;         // 附加分值
  };
  multiplierEnabled: boolean;    // 点(倍数)开关
  multiplier: number;            // 倍数(默认2)
  gameTime: number | null;       // 比赛时间(秒)
  gameRounds: number | null;     // 比赛局数
}
```

**2. 伴彩处理逻辑（src/utils/gameLogic.ts）**

```typescript
/**
 * 处理伴彩（链触发）逻辑
 * @param playerId 当前击球选手ID
 * @returns 是否触发伴彩
 */
export function handleBonus(playerId: number): boolean {
  const config = getMatchConfig();
  const players = getCurrentPlayers();
  const player = players.find(p => p.id === playerId);
  if (!player || !config.chainEnabled) return false;

  // 检查是否满足链条件
  if (player.currentStreak >= config.chainSettings.requiredStreak) {
    // 增加伴彩统计
    player.stats.bonus++;
    // 触发附加分已在calculateScore中处理
    savePlayersToStorage(players);
    return true;
  }
  return false;
}
```

### 4.5 犯规处理逻辑

```typescript
/**
 * 处理犯规逻辑
 * @param foulerId 犯规选手ID
 */
export function handleFoul(foulerId: number): void {
  const players = getCurrentPlayers();
  const fouler = players.find(p => p.id === foulerId);
  const nextPlayer = getNextPlayer(foulerId);
  const prevPlayer = getPrevPlayer(foulerId);
  
  if (!fouler || !nextPlayer || !prevPlayer) return;

  // 1. 犯规者统计+1
  fouler.stats.foul++;
  
  // 2. 重置犯规者连续进球数
  resetPlayerStreak(foulerId);
  
  // 3. 上家(对手)+1分
  prevPlayer.score += 1;
  
  // 4. 记录操作
  addRecord({
    type: 'foul',
    playerId: foulerId,
    targetPlayerId: prevPlayer.id,
    points: 1,
    description: `${fouler.name} 犯规 → ${nextPlayer.name}获得自由球，${prevPlayer.name}+1分`
  });
  
  // 5. 持久化选手数据
  savePlayersToStorage(players);
}
```

### 4.6 得分计算逻辑

```typescript
/**
 * 计算得分（考虑倍数和连续进球）
 * @param basePoints 基础得分
 * @param playerId 当前选手ID
 * @param scoreType 得分类型
 * @returns 最终得分
 */
export function calculateScore(basePoints: number, playerId: number, scoreType?: 'normalWin' | 'smallGolden' | 'bigGolden' | 'goldenNine'): number {
  const config = getMatchConfig();
  const player = getPlayer(playerId);
  let total = basePoints;

  // 仅对胜负类型应用倍数
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

  // 检查连续进球附加分（仅单局单次轮次有效）
  if (config.chainEnabled && player.currentStreak >= config.chainSettings.requiredStreak) {
    total += config.chainSettings.bonusPoints;
    player.currentStreak = 0; // 触发附加分后重置
    player.stats.bonus++; // 伴彩统计+1
  } else {
    player.currentStreak++;
  }

  return total;
}
```

### 4.7 计时器逻辑

```typescript
class GameTimer {
  private timer: number | null = null
  private elapsed: number = 0
  private countdown: number = 0
  private isCountdown: boolean = false
  
  start(configTime: number | null) {
    this.isCountdown = configTime !== null
    this.countdown = configTime || 0
    this.elapsed = 0
    
    this.timer = setInterval(() => {
      if (this.isCountdown) {
        this.countdown = Math.max(0, this.countdown - 1)
        if (this.countdown === 0) {
          this.stop()
        }
      } else {
        this.elapsed++
      }
    }, 1000)
  }
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
  
  format(): string {
    const seconds = this.isCountdown ? this.countdown : this.elapsed
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  
  getTime(): number {
    return this.isCountdown ? this.countdown : this.elapsed
  }
  
  isRunning(): boolean {
    return this.timer !== null
  }
}
```

---

## 五、文件修改清单

### 5.1 新增文件

| 文件路径 | 说明 |
|----------|------|
| `src/pages/game/nineball/config.vue` | 比赛配置页 |
| `src/pages/game/nineball/records.vue` | 操作记录页 |
| `src/data/types.ts` | TypeScript类型定义 |
| `src/utils/storage.ts` | 本地存储工具函数 |

### 5.2 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `src/pages/game/nineball/index.vue` | 重构为完整记分板页 |
| `src/components/ScoreBoard.vue` | 适配N人布局 |
| `src/components/GameTimer.vue` | 支持正计时/倒计时 |
| `src/utils/gameLogic.ts` | 添加九球计分逻辑 |
| `src/pages.json` | 注册新页面路由 |

---

## 六、样式设计规范

### 6.1 配色方案

| 元素 | 颜色 | 说明 |
|------|------|------|
| 背景 | `#000000` | 纯黑色 |
| 选手1背景 | `#1a5276` | 蓝色系 |
| 选手2背景 | `#8b0000` | 红色系 |
| 选手3背景 | `#2d5a27` | 绿色系 |
| 选手4背景 | `#8b7355` | 棕色系 |
| 选手5背景 | `#4a235a` | 紫色系 |
| 比分数字 | `#ff8c00` | 橙色 |
| 统计数字 | `#ff8c00` | 橙色 |
| 操作按钮 | `#228b22` | 绿色底色 |
| 按钮文字 | `#ffffff` | 白色 |

### 6.2 布局规则

| 人数 | 布局方式 |
|------|----------|
| 2人 | 单行两栏，各占50% |
| 3人 | 两行，第一行两栏(各50%)，第二行一栏(100%) |
| 4人 | 两行两列，各占50% |
| 5人 | 两行，第一行三栏(33.3%×3)，第二行两栏(50%×2) |

---

## 七、风险评估与应对

| 风险点 | 描述 | 应对方案 |
|--------|------|----------|
| 布局适配 | N人布局可能导致UI混乱 | 使用flexbox动态计算栏宽，限制最小宽度 |
| 数据同步 | 配置修改后需同步到记分板 | 使用uni.$emit事件通信 |
| 计时精度 | 小程序定时器可能不准 | 使用Date对象计算实际时间差 |
| 存储兼容 | 不同设备存储API差异 | 使用uni.setStorage统一处理 |
| 性能问题 | 大量记录可能卡顿 | 记录列表采用虚拟滚动优化 |

---

## 八、测试要点

| 测试项 | 测试场景 | 预期结果 |
|--------|----------|----------|
| 犯规规则 | 点击犯规按钮 | 犯规者统计+1，上家+1分，生成记录 |
| 计分计算 | 开启倍数后点击普胜 | 得分=基础分×倍数 |
| 连续进球 | 连续点击普胜达到链条件 | 自动加附加分 |
| 计时器 | 配置时间后开始比赛 | 倒计时正确递减 |
| 局数显示 | 配置局数后比赛 | 正确显示剩余/已完成局数 |
| 布局适配 | 切换2-5人 | 布局正确调整 |
| 数据持久化 | 配置后重启 | 配置项保持不变 |

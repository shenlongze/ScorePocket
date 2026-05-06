# 比赛结束返回与比分记录功能计划

## 修改需求

1. **修复比赛结束返回功能**：点击"返回"按钮无法返回到上一页面
2. **添加比分记录表**：在本页面添加临时存储的比分记录，格式为：选手1 胜 炸清n 接清n || 炸清n 接清n 负 选手2

## 问题分析

### 问题1：返回功能失效
当前 `checkRoundWin` 函数中使用 `uni.showModal`，可能存在按钮处理逻辑问题。需要确保点击"返回"时正确调用 `uni.navigateBack()`。

### 问题2：缺少比分记录
需要添加：
- 比赛记录数据结构（数组存储多场比赛）
- 记录显示区域（在广告位上方或下方）
- 记录格式：选手1 胜 炸清n 接清n || 炸清n 接清n 负 选手2

## 修改内容

### 文件：`src/pages/game/chinese8/index.vue`

#### 1. 数据结构添加
```typescript
interface MatchRecord {
  player1Name: string
  player2Name: string
  player1Score: number
  player2Score: number
  player1ZhaQing: number
  player1JieQing: number
  player2ZhaQing: number
  player2JieQing: number
  winner: number // 0: player1, 1: player2, -1: draw
  time: string
}

const matchRecords = ref<MatchRecord[]>([])
```

#### 2. 模板添加记录显示区域
```vue
<view class="records-section" v-if="matchRecords.length > 0">
  <view class="records-header">
    <text class="records-title">比赛记录</text>
  </view>
  <view class="records-list">
    <view class="record-item" v-for="(record, index) in matchRecords" :key="index">
      <view class="record-content">
        <text class="record-player winner">{{ record.player1Name }}</text>
        <text class="record-result">胜</text>
        <text class="record-stats">炸清:{{ record.player1ZhaQing }} 接清:{{ record.player1JieQing }}</text>
      </view>
      <view class="record-vs">||</view>
      <view class="record-content">
        <text class="record-stats">炸清:{{ record.player2ZhaQing }} 接清:{{ record.player2JieQing }}</text>
        <text class="record-result">负</text>
        <text class="record-player loser">{{ record.player2Name }}</text>
      </view>
    </view>
  </view>
</view>
```

#### 3. 函数修改
- 修改 `checkRoundWin` 和 `endMatch` 函数，确保返回功能正常
- 添加 `saveMatchRecord` 函数保存比赛记录

#### 4. 样式添加
添加记录区域的样式

## 实施步骤

1. 添加记录数据结构和变量
2. 添加记录保存函数
3. 修改比赛结束逻辑，保存记录并确保返回功能正常
4. 添加记录显示模板
5. 添加记录区域样式

## 风险评估

- **低风险**：仅修改页面逻辑，不影响其他功能
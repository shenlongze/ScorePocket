
# 抢局赛再来一局局数设定功能实现计划

## 需求分析
当用户选择"抢局赛"比赛结束后，点击"再来一局"按钮时，需要增加局数设定功能，允许用户重新选择抢局数（如抢3、抢5、抢7等）。

## 当前代码分析
在 `checkRoundWin` 函数中（第653-688行），比赛结束时弹出模态框，点击"再来一局"直接调用 `resetGame()` 函数重置游戏，但没有提供局数重新设定的选项。

## 实现方案

### 修改内容
1. **创建新函数 `showRoundSettingModal`** - 显示局数设置对话框
2. **修改 `checkRoundWin` 函数** - 将"再来一局"的回调改为调用局数设置对话框
3. **修改 `resetGame` 函数** - 支持传入新的局数参数

### 文件修改
- `/Users/shenzhen/work/work22/ScorePocket/src/pages/game/chinese8/index.vue`

## 具体步骤

### 步骤1：添加局数设置对话框函数
```typescript
function showRoundSettingModal() {
  const roundOptions = [3, 5, 7, 9, 11]
  
  uni.showActionSheet({
    title: '设置抢局数',
    itemList: roundOptions.map(r => `抢${r}`),
    success: (res) => {
      const selectedRound = roundOptions[res.tapIndex]
      resetGameWithNewRound(selectedRound)
    },
    fail: () => {
      // 用户取消选择，不做任何操作
    }
  })
}
```

### 步骤2：修改 `checkRoundWin` 函数中的再来一局回调
将 `resetGame()` 改为 `showRoundSettingModal()`

### 步骤3：创建 `resetGameWithNewRound` 函数
```typescript
function resetGameWithNewRound(newRound: number) {
  winRounds.value = newRound
  resetGame()
}
```

## 预期效果
1. 抢局赛结束后点击"再来一局"，弹出局数选择菜单
2. 用户选择新的抢局数后，游戏以新局数重新开始
3. 保留原有的取消功能（点击取消不做任何操作）

## 风险评估
- 低风险：仅修改游戏结束后的再来一局流程，不影响核心计分逻辑
- 兼容性：使用 uni.showActionSheet 保证跨平台兼容性

<template>
  <view class="config-page">
    <view class="config-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="page-title">比赛配置</text>
      <view class="save-btn" @tap="validateAndSaveConfig">保存</view>
    </view>

    <scroll-view scroll-y class="config-scroll">
      <view class="config-section">
        <view class="section-title">基础设置</view>
        
        <view class="config-item">
          <text class="item-label">目标球数</text>
          <view class="ball-selector">
            <view 
              v-for="ball in ballOptions" 
              :key="ball"
              :class="['ball-option', { active: config.targetBalls === ball }]"
              @tap="config.targetBalls = ball"
            >
              {{ ball }}
            </view>
          </view>
        </view>

        <view class="config-item">
          <text class="item-label">比赛人数</text>
          <view class="number-input-group">
            <view class="number-btn" @tap="decreasePlayerCount">-</view>
            <input 
              type="number" 
              class="number-input" 
              v-model="config.playerCount"
              @blur="validatePlayerCount"
            />
            <view class="number-btn" @tap="increasePlayerCount">+</view>
          </view>
        </view>

        <view class="config-item">
          <text class="item-label">选手昵称</text>
          <view class="player-names">
            <view v-for="(name, index) in config.playerNames" :key="index" class="name-input-item">
              <text class="name-label">选手{{ index + 1 }}</text>
              <input 
                type="text" 
                class="name-input" 
                v-model="config.playerNames[index]"
                :placeholder="`玩家${index + 1}`"
              />
            </view>
          </view>
        </view>

        <view class="config-item">
          <text class="item-label">基础分数</text>
          <input 
            type="number" 
            class="value-input" 
            v-model="config.baseScore"
          />
        </view>
      </view>

      <view class="config-section">
        <view class="section-title">得分设置</view>
        
        <view class="config-item">
          <text class="item-label">普胜</text>
          <input 
            type="number" 
            class="value-input" 
            v-model="config.scoreSettings.normalWin"
          />
          <text class="item-unit">分</text>
        </view>

        <view class="config-item">
          <text class="item-label">小金</text>
          <view class="radio-group">
            <view 
              :class="['radio-btn', { active: config.smallGoldenScope === 'prev' }]"
              @tap="config.smallGoldenScope = 'prev'"
            >上家</view>
            <view 
              :class="['radio-btn', { active: config.smallGoldenScope === 'all' }]"
              @tap="config.smallGoldenScope = 'all'"
            >全场</view>
          </view>
          <input 
            type="number" 
            class="value-input" 
            v-model="config.scoreSettings.smallGolden"
          />
          <text class="item-unit">分</text>
        </view>

        <view class="config-item">
          <text class="item-label">大金</text>
          <view class="radio-group">
            <view 
              :class="['radio-btn', { active: config.bigGoldenScope === 'prev' }]"
              @tap="config.bigGoldenScope = 'prev'"
            >上家</view>
            <view 
              :class="['radio-btn', { active: config.bigGoldenScope === 'all' }]"
              @tap="config.bigGoldenScope = 'all'"
            >全场</view>
          </view>
          <input 
            type="number" 
            class="value-input" 
            v-model="config.scoreSettings.bigGolden"
          />
          <text class="item-unit">分</text>
        </view>

        <view class="config-item">
          <text class="item-label">黄金九</text>
          <view class="radio-group">
            <view 
              :class="['radio-btn', { active: config.goldenNineScope === 'prev' }]"
              @tap="config.goldenNineScope = 'prev'"
            >上家</view>
            <view 
              :class="['radio-btn', { active: config.goldenNineScope === 'all' }]"
              @tap="config.goldenNineScope = 'all'"
            >全场</view>
          </view>
          <input 
            type="number" 
            class="value-input" 
            v-model="config.scoreSettings.goldenNine"
          />
          <text class="item-unit">分</text>
        </view>
        <view class="config-item">
          <text class="item-label">犯规</text>
          <view class="radio-group">
            <view 
              :class="['radio-btn', { active: config.foulScope === 'prev' }]"
              @tap="config.foulScope = 'prev'"
            >上家</view>
            <view 
              :class="['radio-btn', { active: config.foulScope === 'all' }]"
              @tap="config.foulScope = 'all'"
            >全场</view>
          </view>
          <input 
            type="number" 
            class="value-input" 
            v-model="config.scoreSettings.foul"
          />
          <text class="item-unit">分</text>
        </view>
      </view>

      <view class="config-section">
        <view class="section-title">半彩(链)</view>
        
        <view class="config-item">
          <text class="item-label">半彩</text>
          <switch 
            :checked="config.chainEnabled" 
            @change="config.chainEnabled = !config.chainEnabled"
          />
        </view>

        <view v-if="config.chainEnabled" class="chain-settings">
          <view class="config-item">
            <text class="item-label">连续进球数</text>
            <input 
              type="number" 
              class="value-input" 
              v-model="config.chainSettings.requiredStreak"
            />
            <text class="item-unit">球</text>
          </view>
          <view class="config-item">
            <text class="item-label">附加分值</text>
            <input 
              type="number" 
              class="value-input" 
              v-model="config.chainSettings.bonusPoints"
            />
            <text class="item-unit">分</text>
          </view>
        </view>
      </view>

      <view class="config-section">
        <view class="section-title">点（倍数）</view>
        
        <view class="config-item">
          <text class="item-label">倍数</text>
          <switch 
            :checked="config.multiplierEnabled" 
            @change="config.multiplierEnabled = !config.multiplierEnabled"
          />
        </view>

        <view v-if="config.multiplierEnabled" class="config-item">
          <text class="item-label">倍数</text>
          <input 
            type="number" 
            class="value-input" 
            v-model="config.multiplier"
          />
          <text class="item-unit">倍</text>
        </view>
      </view>

      <view class="config-section">
        <view class="section-title">时间与局数</view>
        
        <view class="config-item">
          <text class="item-label">比赛时间</text>
          <input 
            type="number" 
            class="value-input" 
            v-model="gameTimeMinutes"
            placeholder="不限制"
          />
          <text class="item-unit">分钟</text>
        </view>

        <view class="config-item">
          <text class="item-label">比赛局数</text>
          <input 
            type="number" 
            class="value-input" 
            v-model="config.gameRounds"
            placeholder="不限制"
          />
          <text class="item-unit">局</text>
        </view>
      </view>
    </scroll-view>

    <view class="start-btn" @tap="startGame">开始比赛</view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { MatchConfig } from '@/data/types';
import { DEFAULT_CONFIG } from '@/data/types';
import { saveConfig, loadConfig, initPlayers, savePlayers, clearAllGameData } from '@/utils/storage';
import { initPlayOrder } from '@/utils/gameLogic';

const ballOptions = [4, 5, 6, 7, 8, 9];

const config = ref<MatchConfig>({ ...DEFAULT_CONFIG });
const gameTimeMinutes = ref('');

onMounted(() => {
  config.value = { ...DEFAULT_CONFIG };
  
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any)?.options || {};
  
  if (options.gameType === '六球') {
    config.value.targetBalls = 6;
  }
});

watch(() => config.value.playerCount, (newCount, oldCount) => {
  const names = config.value.playerNames;
  while (names.length < newCount) {
    names.push(`玩家${names.length + 1}`);
  }
  while (names.length > newCount) {
    names.pop();
  }
});

function goBack() {
  uni.navigateBack();
}

function decreasePlayerCount() {
  if (config.value.playerCount > 2) {
    config.value.playerCount--;
  }
}

function increasePlayerCount() {
  if (config.value.playerCount < 5) {
    config.value.playerCount++;
  }
}

function validatePlayerCount() {
  if (config.value.playerCount < 2) {
    config.value.playerCount = 2;
  } else if (config.value.playerCount > 5) {
    config.value.playerCount = 5;
  }
}

function validateAndSaveConfig() {
  if (gameTimeMinutes.value) {
    config.value.gameTime = parseInt(gameTimeMinutes.value) * 60;
  } else {
    config.value.gameTime = null;
  }
  
  if (!config.value.gameRounds || config.value.gameRounds <= 0) {
    config.value.gameRounds = null;
  }
  
  saveConfig(config.value);
  uni.showToast({ title: '配置已保存', icon: 'success' });
}

function startGame() {
  if (gameTimeMinutes.value) {
    config.value.gameTime = parseInt(gameTimeMinutes.value) * 60;
  } else {
    config.value.gameTime = null;
  }
  
  if (!config.value.gameRounds || config.value.gameRounds <= 0) {
    config.value.gameRounds = null;
  }
  
  clearAllGameData();
  
  saveConfig(config.value);
  const players = initPlayers(config.value);
  savePlayers(players);
  initPlayOrder(config.value.playerCount);
  
  uni.setStorageSync('nineball_game_state', JSON.stringify({
    config: config.value,
    players,
    records: [],
    currentPlayerId: 1,
    currentRound: 1,
    completedRounds: 0,
    playOrder: Array.from({ length: config.value.playerCount }, (_, i) => i + 1),
    timerSeconds: config.value.gameTime || 0,
    isCountdown: config.value.gameTime !== null,
    isTimerRunning: false
  }));
  
  uni.navigateTo({ url: '/pages/game/nineball/index' });
}
</script>

<style lang="scss" scoped>
.config-page {
  min-height: 100vh;
  background: #1a1a2e;
  padding-bottom: 180rpx;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 30rpx 30rpx;
  background: #16213e;
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

.page-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.save-btn {
  padding: 15rpx 30rpx;
  background: rgba(74, 158, 255, 0.2);
  border-radius: 20rpx;
  color: #4a9eff;
  font-size: 28rpx;
}

.config-scroll {
  height: calc(100vh - 180rpx);
  padding: 20rpx;
}

.config-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.section-title {
  color: #4a9eff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 25rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20rpx 0;
}

.item-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  flex: 1;
}

.item-unit {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  margin-left: 10rpx;
}

.ball-selector {
  display: flex;
  gap: 15rpx;
}

.ball-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
  transition: all 0.3s ease;
  
  &.active {
    background: #4a9eff;
    color: #fff;
  }
}

.number-input-group {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.number-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
}

.number-input {
  width: 100rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  text-align: center;
  color: #fff;
  font-size: 28rpx;
}

.player-names {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.name-input-item {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.name-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  width: 80rpx;
}

.name-input {
  flex: 1;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 0 20rpx;
  color: #fff;
  font-size: 26rpx;
}

.value-input {
  width: 120rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  text-align: center;
  color: #fff;
  font-size: 28rpx;
}

.radio-group {
  display: flex;
  gap: 20rpx;
  flex: 1;
  justify-content: center;
}

.radio-btn {
  padding: 10rpx 30rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
  transition: all 0.3s;
}

.radio-btn.active {
  background: #ff8c00;
  color: #fff;
}

.chain-settings {
  background: rgba(74, 158, 255, 0.05);
  border-radius: 12rpx;
  padding: 15rpx;
  margin-top: 10rpx;
}

.start-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}
</style>

<template>
  <view class="create-tournament-page">
    <view class="page-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="page-title">创建赛事</text>
      <view class="placeholder"></view>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">赛事名称</text>
        <input v-model="tournament.name" class="form-input" placeholder="请输入赛事名称" />
      </view>

      <view class="form-item">
        <text class="form-label">赛制</text>
        <view class="option-group">
          <view
            class="option-item"
            :class="{ selected: tournament.type === 'single' }"
            @tap="tournament.type = 'single'"
          >
            <text>单败淘汰</text>
          </view>
          <view
            class="option-item"
            :class="{ selected: tournament.type === 'double' }"
            @tap="tournament.type = 'double'"
          >
            <text>双败淘汰</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">局制</text>
        <view class="option-group">
          <view
            v-for="option in bestOfOptions"
            :key="option"
            class="option-item"
            :class="{ selected: tournament.bestOf === option }"
            @tap="tournament.bestOf = option"
          >
            <text>抢{{ option }}局</text>
          </view>
        </view>
        <view class="custom-input" v-if="tournament.bestOf === 0">
          <input
            type="number"
            v-model="customBestOf"
            class="form-input small"
            placeholder="自定义局数"
          />
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">玩法</text>
        <view class="option-group">
          <view
            v-for="game in gameOptions"
            :key="game"
            class="option-item"
            :class="{ selected: tournament.gameType === game }"
            @tap="tournament.gameType = game"
          >
            <text>{{ game }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">选手列表</text>
        <view class="player-list">
          <view
            v-for="(player, index) in tournament.players"
            :key="index"
            class="player-input-item"
          >
            <text class="player-index">{{ index + 1 }}</text>
            <input v-model="player.name" class="player-input" :placeholder="`选手${index + 1}`" />
            <view
              class="remove-btn"
              v-if="tournament.players.length > 2"
              @tap="removePlayer(index)"
            >
              <text>×</text>
            </view>
          </view>
        </view>
        <view class="add-player-btn" @tap="addPlayer">
          <text>+ 添加选手</text>
        </view>
      </view>
    </view>

    <view class="create-btn" @tap="createTournament">
      <text>创建赛事</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

interface Player {
  id: string;
  name: string;
  avatar: string;
}

const tournament = reactive({
  name: '',
  type: 'single' as 'single' | 'double',
  bestOf: 3,
  gameType: '中式八球',
  players: [
    { id: '1', name: '', avatar: '' },
    { id: '2', name: '', avatar: '' },
  ],
});

const customBestOf = ref('');

const bestOfOptions = [3, 5, 7, 0];
const gameOptions = ['中式八球', '九球', '四球', '斯诺克'];

function addPlayer() {
  if (tournament.players.length < 32) {
    tournament.players.push({
      id: String(tournament.players.length + 1),
      name: '',
      avatar: '',
    });
  }
}

function removePlayer(index: number) {
  tournament.players.splice(index, 1);
}

function createTournament() {
  if (!tournament.name.trim()) {
    uni.showToast({ title: '请输入赛事名称', icon: 'none' });
    return;
  }

  const validPlayers = tournament.players.filter((p) => p.name.trim());
  if (validPlayers.length < 2) {
    uni.showToast({ title: '请至少输入2位选手', icon: 'none' });
    return;
  }

  if (tournament.bestOf === 0) {
    const custom = parseInt(customBestOf.value);
    if (!custom || custom < 1 || custom > 99) {
      uni.showToast({ title: '请输入有效的局数', icon: 'none' });
      return;
    }
    tournament.bestOf = custom;
  }

  uni.showLoading({ title: '创建中...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '赛事创建成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1000);
}

function goBack() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.create-tournament-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 160rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 20rpx;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    color: #fff;
    font-size: 48rpx;
  }
}

.page-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.placeholder {
  width: 60rpx;
}

.form-section {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  margin-bottom: 15rpx;
}

.form-input {
  background: rgba(255, 255, 255, 0.1);
  padding: 20rpx;
  border-radius: 15rpx;
  color: #fff;
  font-size: 28rpx;

  &.small {
    width: 200rpx;
  }
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.option-item {
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.1);

  &.selected {
    background: #4a9eff;
  }

  text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 26rpx;

    .selected & {
      color: #fff;
    }
  }
}

.custom-input {
  margin-top: 15rpx;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.player-input-item {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.player-index {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a9eff;
  font-size: 22rpx;
  font-weight: bold;
}

.player-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  padding: 15rpx 20rpx;
  border-radius: 15rpx;
  color: #fff;
  font-size: 28rpx;
}

.remove-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    color: #ff3b30;
    font-size: 32rpx;
  }
}

.add-player-btn {
  margin-top: 20rpx;
  padding: 20rpx;
  border: 2rpx dashed rgba(255, 255, 255, 0.3);
  border-radius: 15rpx;
  text-align: center;

  text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 26rpx;
  }
}

.create-btn {
  position: fixed;
  bottom: 30rpx;
  left: 30rpx;
  right: 30rpx;
  background: linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%);
  padding: 30rpx;
  border-radius: 30rpx;
  text-align: center;

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}
</style>

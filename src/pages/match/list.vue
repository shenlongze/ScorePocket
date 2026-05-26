<template>
  <view class="match-list-page">
    <view class="page-header">
      <text class="page-title">对局记录</text>
      <view class="filter-btn">
        <text>筛选</text>
      </view>
    </view>

    <view class="stats-section" v-if="stats">
      <view class="stat-item">
        <text class="stat-value">{{ stats.total }}</text>
        <text class="stat-label">总对局</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.wins }}</text>
        <text class="stat-label">获胜</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.winRate }}%</text>
        <text class="stat-label">胜率</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.cleans }}</text>
        <text class="stat-label">清台</text>
      </view>
    </view>

    <view class="tabs">
      <view class="tab-item" :class="{ active: activeTab === 'all' }" @tap="activeTab = 'all'">
        <text>全部</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'win' }" @tap="activeTab = 'win'">
        <text>获胜</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'lose' }" @tap="activeTab = 'lose'">
        <text>失败</text>
      </view>
    </view>

    <scroll-view class="match-list" scroll-y>
      <view v-if="filteredMatches.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无对局记录</text>
        <view class="empty-btn" @tap="goToGame">
          <text>开始第一局</text>
        </view>
      </view>

      <view
        v-for="match in filteredMatches"
        :key="match.id"
        class="match-card"
        @tap="viewMatch(match)"
      >
        <view class="match-header">
          <text class="match-game">{{ match.gameType }}</text>
          <text class="match-date">{{ formatDate(match.date) }}</text>
        </view>

        <view class="match-content">
          <view class="player-item" :class="{ winner: match.winner === 0 }">
            <view class="player-avatar">{{ match.player1.charAt(0) }}</view>
            <view class="player-info">
              <text class="player-name">{{ match.player1 }}</text>
              <text class="player-score">{{ match.score1 }}</text>
            </view>
          </view>

          <view class="vs">
            <text>VS</text>
          </view>

          <view class="player-item" :class="{ winner: match.winner === 1 }">
            <view class="player-avatar">{{ match.player2.charAt(0) }}</view>
            <view class="player-info">
              <text class="player-name">{{ match.player2 }}</text>
              <text class="player-score">{{ match.score2 }}</text>
            </view>
          </view>
        </view>

        <view class="match-footer">
          <text class="match-result" :class="match.winner === 0 ? 'win' : 'lose'">
            {{ match.winner === 0 ? '胜利' : '失败' }}
          </text>
          <text v-if="match.clean" class="match-clean">清台</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

onMounted(() => {
  uni.redirectTo({ url: '/pages/coming-soon/index?type=match' });
});

interface Match {
  id: string;
  gameType: string;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  winner: number;
  clean: boolean;
  date: number;
}

const activeTab = ref('all');

const mockMatches: Match[] = [
  {
    id: '1',
    gameType: '中式八球',
    player1: '张三',
    player2: '李四',
    score1: 7,
    score2: 5,
    winner: 0,
    clean: true,
    date: Date.now() - 86400000,
  },
  {
    id: '2',
    gameType: '九球',
    player1: '张三',
    player2: '王五',
    score1: 3,
    score2: 5,
    winner: 1,
    clean: false,
    date: Date.now() - 172800000,
  },
  {
    id: '3',
    gameType: '中式八球',
    player1: '张三',
    player2: '赵六',
    score1: 6,
    score2: 7,
    winner: 1,
    clean: false,
    date: Date.now() - 259200000,
  },
  {
    id: '4',
    gameType: '四球',
    player1: '张三',
    player2: '钱七',
    score1: 3,
    score2: 1,
    winner: 0,
    clean: true,
    date: Date.now() - 345600000,
  },
];

const stats = computed(() => {
  const total = mockMatches.length;
  const wins = mockMatches.filter((m) => m.winner === 0).length;
  const cleans = mockMatches.filter((m) => m.clean).length;
  return {
    total,
    wins,
    winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    cleans,
  };
});

const filteredMatches = computed(() => {
  if (activeTab.value === 'win') {
    return mockMatches.filter((m) => m.winner === 0);
  } else if (activeTab.value === 'lose') {
    return mockMatches.filter((m) => m.winner === 1);
  }
  return mockMatches;
});

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

function viewMatch(match: Match) {
  uni.showToast({ title: `查看 ${match.gameType} 记录`, icon: 'none' });
}

function goToGame() {
  uni.switchTab({ url: '/pages/index/index' });
}
</script>

<style lang="scss" scoped>
.match-list-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 140rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 30rpx;
}

.page-title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.1);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
}

.filter-btn text {
  color: #fff;
  font-size: 24rpx;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.2) 0%, rgba(45, 90, 138, 0.2) 100%);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  margin: 0 20rpx 30rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  color: #4a9eff;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}

.tabs {
  display: flex;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 15rpx 0;
  border-radius: 30rpx;
  margin-right: 15rpx;
  background: rgba(255, 255, 255, 0.1);

  &.active {
    background: #4a9eff;

    text {
      color: #fff;
    }
  }

  text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 26rpx;
  }

  &:last-child {
    margin-right: 0;
  }
}

.match-list {
  height: calc(100vh - 420rpx);
  padding: 0 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
  margin-bottom: 30rpx;
}

.empty-btn {
  background: #4a9eff;
  padding: 20rpx 60rpx;
  border-radius: 30rpx;

  text {
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.match-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.match-game {
  color: #4a9eff;
  font-size: 26rpx;
  font-weight: bold;
}

.match-date {
  color: rgba(255, 255, 255, 0.4);
  font-size: 22rpx;
}

.match-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.player-item {
  display: flex;
  align-items: center;
  flex: 1;

  &.winner {
    .player-avatar {
      border-color: #4cd964;
    }

    .player-name {
      color: #4cd964;
    }
  }
}

.player-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  border: 2rpx solid transparent;

  text {
    color: #fff;
    font-size: 24rpx;
    font-weight: bold;
  }
}

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  color: #fff;
  font-size: 26rpx;
  margin-bottom: 5rpx;
}

.player-score {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}

.vs {
  padding: 0 20rpx;

  text {
    color: rgba(255, 255, 255, 0.4);
    font-size: 24rpx;
  }
}

.match-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.match-result {
  font-size: 26rpx;
  font-weight: bold;

  &.win {
    color: #4cd964;
  }

  &.lose {
    color: #ff3b30;
  }
}

.match-clean {
  background: rgba(74, 217, 100, 0.2);
  color: #4cd964;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
}

.banner-ad {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 20rpx;
  text-align: center;
}

.ad-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
}
</style>

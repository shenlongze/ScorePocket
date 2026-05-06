<template>
  <view class="tournament-list-page">
    <view class="page-header">
      <text class="page-title">赛事中心</text>
      <view class="create-btn" @tap="createTournament">
        <text>+ 创建赛事</text>
      </view>
    </view>
    
    <view class="tournament-list">
      <view v-if="tournaments.length === 0" class="empty-state">
        <text class="empty-icon">🏆</text>
        <text class="empty-text">暂无赛事</text>
        <view class="empty-btn" @tap="createTournament">
          <text>创建第一个赛事</text>
        </view>
      </view>
      
      <view v-for="tournament in tournaments" :key="tournament.id" class="tournament-card">
        <view class="tournament-header">
          <view class="tournament-status" :class="tournament.status">
            {{ tournament.status === 'ongoing' ? '进行中' : tournament.status === 'finished' ? '已结束' : '待开始' }}
          </view>
          <text class="tournament-type">{{ tournament.type === 'single' ? '单败淘汰' : '双败淘汰' }}</text>
        </view>
        
        <text class="tournament-name">{{ tournament.name }}</text>
        <text class="tournament-desc">{{ tournament.gameType }} · 抢{{ tournament.bestOf }}局 · {{ tournament.players.length }}人</text>
        
        <view class="tournament-stats">
          <view class="stat">
            <text class="stat-value">{{ tournament.rounds }}</text>
            <text class="stat-label">轮次</text>
          </view>
          <view class="stat">
            <text class="stat-value">{{ tournament.matches.length }}</text>
            <text class="stat-label">场次</text>
          </view>
          <view class="stat">
            <text class="stat-value">{{ tournament.players.length }}</text>
            <text class="stat-label">选手</text>
          </view>
        </view>
        
        <view class="tournament-actions">
          <view class="action-btn primary" @tap="viewBracket(tournament)">
            <text>{{ tournament.status === 'finished' ? '查看图谱' : '查看对阵' }}</text>
          </view>
          <view v-if="tournament.status !== 'finished'" class="action-btn" @tap="joinTournament(tournament)">
            <text>加入赛事</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="banner-ad">
      <text class="ad-text">广告位</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Tournament } from '@/utils/tournamentLogic'

const tournaments = ref<Tournament[]>([
  {
    id: '1',
    name: '2024春季台球公开赛',
    type: 'single',
    bestOf: 5,
    gameType: '中式八球',
    players: [
      { id: '1', name: '张三', avatar: '' },
      { id: '2', name: '李四', avatar: '' },
      { id: '3', name: '王五', avatar: '' },
      { id: '4', name: '赵六', avatar: '' },
    ],
    matches: [],
    winner: null,
    status: 'ongoing',
    rounds: 2,
  },
  {
    id: '2',
    name: '友谊赛',
    type: 'double',
    bestOf: 3,
    gameType: '九球',
    players: [
      { id: '1', name: '钱七', avatar: '' },
      { id: '2', name: '孙八', avatar: '' },
      { id: '3', name: '周九', avatar: '' },
      { id: '4', name: '吴十', avatar: '' },
      { id: '5', name: '郑十一', avatar: '' },
      { id: '6', name: '王十二', avatar: '' },
    ],
    matches: [],
    winner: null,
    status: 'pending',
    rounds: 3,
  },
  {
    id: '3',
    name: '年终总决赛',
    type: 'single',
    bestOf: 7,
    gameType: '中式八球',
    players: [],
    matches: [],
    winner: { id: '1', name: '张三', avatar: '' },
    status: 'finished',
    rounds: 4,
  },
])

function createTournament() {
  uni.navigateTo({ url: '/pages/tournament/create' })
}

function viewBracket(tournament: Tournament) {
  uni.navigateTo({ url: `/pages/tournament/bracket?id=${tournament.id}` })
}

function joinTournament(tournament: Tournament) {
  uni.showModal({
    title: '加入赛事',
    content: `确定加入「${tournament.name}」吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已加入赛事', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.tournament-list-page {
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

.create-btn {
  background: #4a9eff;
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  
  text {
    color: #fff;
    font-size: 26rpx;
    font-weight: bold;
  }
}

.tournament-list {
  padding: 0 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
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

.tournament-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

.tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.tournament-status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  
  &.pending {
    background: rgba(255, 149, 0, 0.2);
    color: #ff9500;
  }
  
  &.ongoing {
    background: rgba(74, 217, 100, 0.2);
    color: #4cd964;
  }
  
  &.finished {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
  }
}

.tournament-type {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}

.tournament-name {
  display: block;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.tournament-desc {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-bottom: 20rpx;
}

.tournament-stats {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20rpx;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  color: #4a9eff;
  font-size: 36rpx;
  font-weight: bold;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
}

.tournament-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.1);
  
  &.primary {
    background: #4a9eff;
  }
  
  text {
    color: #fff;
    font-size: 26rpx;
  }
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

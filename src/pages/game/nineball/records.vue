<template>
  <view class="records-page">
    <view class="records-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="page-title">操作记录</text>
      <view class="clear-btn" @tap="clearRecords">清空</view>
    </view>

    <scroll-view scroll-y class="records-scroll">
      <view v-if="records.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无操作记录</text>
      </view>

      <view v-else class="records-list">
        <view v-for="record in records" :key="record.id" class="record-item">
          <view class="record-time">{{ record.time }}</view>
          <view class="record-content">
            <view :class="['record-type', record.type]">{{ getTypeLabel(record.type) }}</view>
            <text class="record-desc">{{ record.description }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { ActionRecord } from '@/data/types';
import { loadRecords, saveRecords } from '@/utils/storage';

const records = ref<ActionRecord[]>([]);

onMounted(() => {
  loadData();
});

onShow(() => {
  loadData();
});

function loadData() {
  records.value = loadRecords();
}

function goBack() {
  uni.navigateBack();
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    foul: '犯规',
    normalWin: '普胜',
    bigGolden: '大金',
    smallGolden: '小金',
    goldenNine: '黄金九',
    bonus: '伴彩'
  };
  return labels[type] || type;
}

function clearRecords() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有操作记录吗？',
    success: (res) => {
      if (res.confirm) {
        saveRecords([]);
        records.value = [];
        uni.showToast({ title: '已清空', icon: 'success' });
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.records-page {
  min-height: 100vh;
  background: #000;
}

.records-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 30rpx 30rpx;
  background: #1a1a2e;
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

.clear-btn {
  padding: 15rpx 30rpx;
  background: rgba(255, 107, 107, 0.2);
  border-radius: 20rpx;
  color: #ff6b6b;
  font-size: 28rpx;
}

.records-scroll {
  height: calc(100vh - 150rpx);
  padding: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 28rpx;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 20rpx;
}

.record-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.record-content {
  display: flex;
  align-items: flex-start;
  gap: 15rpx;
}

.record-type {
  padding: 5rpx 15rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: bold;
  flex-shrink: 0;
  
  &.foul {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
  }
  
  &.normalWin {
    background: rgba(74, 217, 100, 0.2);
    color: #4ad964;
  }
  
  &.bigGolden {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
  }
  
  &.smallGolden {
    background: rgba(192, 192, 192, 0.2);
    color: #c0c0c0;
  }
  
  &.goldenNine {
    background: rgba(255, 165, 0, 0.2);
    color: #ffa500;
  }
  
  &.bonus {
    background: rgba(147, 112, 219, 0.2);
    color: #9370db;
  }
}

.record-desc {
  color: #fff;
  font-size: 28rpx;
  line-height: 1.5;
}
</style>

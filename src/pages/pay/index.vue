<template>
  <view class="pay-page">
    <view class="page-header">
      <view class="back-btn" @tap="goBack">
        <text>‹</text>
      </view>
      <text class="page-title">开通会员</text>
      <view class="placeholder"></view>
    </view>
    
    <view class="pricing-section">
      <view class="pricing-card" :class="{ selected: selectedPlan === 'week' }" @tap="selectedPlan = 'week'">
        <view class="plan-badge">周卡</view>
        <text class="plan-price">6.8</text>
        <text class="plan-unit">元</text>
        <text class="plan-desc">7天会员体验</text>
        <view class="plan-check" v-if="selectedPlan === 'week'">✓</view>
      </view>
      
      <view class="pricing-card popular" :class="{ selected: selectedPlan === 'month' }" @tap="selectedPlan = 'month'">
        <view class="popular-badge">推荐</view>
        <view class="plan-badge">月卡</view>
        <text class="plan-price">16.8</text>
        <text class="plan-unit">元</text>
        <text class="plan-desc">30天会员服务</text>
        <view class="plan-check" v-if="selectedPlan === 'month'">✓</view>
      </view>
      
      <view class="pricing-card" :class="{ selected: selectedPlan === 'quarter' }" @tap="selectedPlan = 'quarter'">
        <view class="plan-badge">季卡</view>
        <text class="plan-price">38.8</text>
        <text class="plan-unit">元</text>
        <text class="plan-desc">90天会员服务</text>
        <view class="plan-check" v-if="selectedPlan === 'quarter'">✓</view>
      </view>
      
      <view class="pricing-card" :class="{ selected: selectedPlan === 'year' }" @tap="selectedPlan = 'year'">
        <view class="plan-badge">年卡</view>
        <text class="plan-price">98</text>
        <text class="plan-unit">元</text>
        <text class="plan-desc">365天会员服务</text>
        <view class="plan-check" v-if="selectedPlan === 'year'">✓</view>
      </view>
    </view>
    
    <view class="benefits-section">
      <text class="section-title">会员权益</text>
      
      <view class="benefits-list">
        <view class="benefit-item">
          <text class="benefit-check">✓</text>
          <text class="benefit-text">全玩法解锁（斯诺克、自定义球数等）</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-check">✓</text>
          <text class="benefit-text">多人联机同步计分</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-check">✓</text>
          <text class="benefit-text">线下赛事创建与可视化图谱</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-check">✓</text>
          <text class="benefit-text">击球计时功能（震动+语音提醒）</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-check">✓</text>
          <text class="benefit-text">对局记录云端存储与导出</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-check">✓</text>
          <text class="benefit-text">全局屏蔽广告</text>
        </view>
      </view>
    </view>
    
    <view class="pay-btn" @tap="handlePay">
      <text>立即支付 {{ getPrice() }} 元</text>
    </view>
    
    <view class="pay-tips">
      <text>支付即表示同意《会员服务协议》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedPlan = ref('month')

const prices: Record<string, number> = {
  week: 6.8,
  month: 16.8,
  quarter: 38.8,
  year: 98
}

function getPrice(): number {
  return prices[selectedPlan.value]
}

function goBack() {
  uni.navigateBack()
}

function handlePay() {
  uni.showModal({
    title: '支付提示',
    content: `确定支付 ${getPrice()} 元开通${getPlanName()}吗？`,
    confirmText: '确认支付',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '支付中...' })
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({ title: '开通成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }, 1500)
      }
    }
  })
}

function getPlanName(): string {
  const names: Record<string, string> = {
    week: '周卡',
    month: '月卡',
    quarter: '季卡',
    year: '年卡'
  }
  return names[selectedPlan.value]
}
</script>

<style lang="scss" scoped>
.pay-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding-bottom: 120rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 30rpx 30rpx;
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
  font-size: 36rpx;
  font-weight: bold;
}

.placeholder {
  width: 60rpx;
}

.pricing-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 30rpx 20rpx;
}

.pricing-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  position: relative;
  border: 2rpx solid transparent;
  
  &.popular {
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.2) 0%, rgba(45, 90, 138, 0.2) 100%);
    border-color: rgba(74, 158, 255, 0.3);
  }
  
  &.selected {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.15);
  }
}

.popular-badge {
  position: absolute;
  top: -1rpx;
  right: 20rpx;
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
  padding: 5rpx 15rpx;
  border-radius: 0 0 10rpx 10rpx;
  
  text {
    color: #fff;
    font-size: 20rpx;
  }
}

.plan-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 5rpx 15rpx;
  border-radius: 10rpx;
  display: inline-block;
  margin-bottom: 15rpx;
  
  text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 22rpx;
  }
}

.plan-price {
  display: block;
  color: #fff;
  font-size: 56rpx;
  font-weight: bold;
  line-height: 1;
}

.plan-unit {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-left: 5rpx;
}

.plan-desc {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 22rpx;
  margin-top: 10rpx;
}

.plan-check {
  position: absolute;
  top: 15rpx;
  right: 15rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #4a9eff;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: #fff;
    font-size: 22rpx;
    font-weight: bold;
  }
}

.benefits-section {
  padding: 0 20rpx;
  margin-bottom: 40rpx;
}

.section-title {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.benefits-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 20rpx;
}

.benefit-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
}

.benefit-check {
  color: #4cd964;
  font-size: 28rpx;
  margin-right: 15rpx;
}

.benefit-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
}

.pay-btn {
  background: linear-gradient(135deg, #4a9eff 0%, #2d5a8a 100%);
  margin: 0 20rpx;
  padding: 30rpx;
  border-radius: 30rpx;
  text-align: center;
  
  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.pay-tips {
  text-align: center;
  margin-top: 20rpx;
  
  text {
    color: rgba(255, 255, 255, 0.4);
    font-size: 22rpx;
  }
}
</style>

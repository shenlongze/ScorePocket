<template>
  <view class="game-timer" :class="{ warning: isWarning, danger: isDanger }">
    <view class="timer-display">
      <text class="timer-icon">⏱️</text>
      <text class="timer-text">{{ formattedTime }}</text>
    </view>
    <view class="timer-controls" v-if="showControls">
      <view class="control-btn" @tap="toggleTimer">
        <text>{{ isRunning ? '暂停' : '开始' }}</text>
      </view>
      <view class="control-btn reset" @tap="resetTimer">
        <text>重置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps<{
  duration: number;
  showControls?: boolean;
  autoStart?: boolean;
}>();

const emit = defineEmits<{
  timeout: [];
  tick: [remaining: number];
}>();

const remaining = ref(props.duration);
const isRunning = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  const mins = Math.floor(remaining.value / 60);
  const secs = remaining.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const isWarning = computed(() => remaining.value <= 10 && remaining.value > 3);
const isDanger = computed(() => remaining.value <= 3);

function toggleTimer() {
  if (isRunning.value) {
    stopTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (remaining.value <= 0) return;
  isRunning.value = true;
  timer = setInterval(() => {
    remaining.value--;
    emit('tick', remaining.value);

    if (remaining.value <= 3 && remaining.value > 0) {
      uni.vibrateShort({});
    }

    if (remaining.value <= 0) {
      stopTimer();
      uni.vibrateLong({});
      emit('timeout');
    }
  }, 1000);
}

function stopTimer() {
  isRunning.value = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resetTimer() {
  stopTimer();
  remaining.value = props.duration;
}

function restart() {
  remaining.value = props.duration;
  if (props.autoStart) {
    startTimer();
  }
}

watch(
  () => props.duration,
  (newVal) => {
    remaining.value = newVal;
  }
);

onUnmounted(() => {
  stopTimer();
});

defineExpose({ restart });
</script>

<style lang="scss" scoped>
.game-timer {
  background: linear-gradient(135deg, #1e3a5f 0%, #16213e 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  margin: 20rpx;
  border: 2rpx solid rgba(74, 158, 255, 0.3);
  transition: all 0.3s ease;

  &.warning {
    border-color: #ff9500;
    background: linear-gradient(135deg, #3d2a1a 0%, #2a1f10 100%);
  }

  &.danger {
    border-color: #ff3b30;
    background: linear-gradient(135deg, #3d1a1a 0%, #2a1010 100%);
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
}

.timer-icon {
  font-size: 40rpx;
  margin-right: 15rpx;
}

.timer-text {
  color: #fff;
  font-size: 56rpx;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 20rpx;
}

.control-btn {
  background: #4a9eff;
  color: #fff;
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;

  &.reset {
    background: rgba(255, 255, 255, 0.2);
  }
}
</style>

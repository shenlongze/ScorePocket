import type { Player } from '@/data/types';

let currentPlayOrder: number[] = [];

export function initPlayOrder(playerCount: number): number[] {
  currentPlayOrder = Array.from({ length: playerCount }, (_, i) => i + 1);
  return currentPlayOrder;
}

export function updatePlayOrder(winnerId: number): void {
  const winnerIndex = currentPlayOrder.findIndex((id) => id === winnerId);
  if (winnerIndex === -1) return;

  const prevPlayerId = getPrevPlayer(winnerId);
  const others = currentPlayOrder.filter((id) => id !== winnerId && id !== prevPlayerId);

  currentPlayOrder = [winnerId, prevPlayerId, ...others];
}

export function getNextPlayer(currentPlayerId: number): number {
  const currentIndex = currentPlayOrder.findIndex((id) => id === currentPlayerId);
  const nextIndex = (currentIndex + 1) % currentPlayOrder.length;
  return currentPlayOrder[nextIndex];
}

export function getPrevPlayer(currentPlayerId: number): number {
  const currentIndex = currentPlayOrder.findIndex((id) => id === currentPlayerId);
  const prevIndex = (currentIndex - 1 + currentPlayOrder.length) % currentPlayOrder.length;
  return currentPlayOrder[prevIndex];
}

export function getPlayOrder(): number[] {
  if (currentPlayOrder.length === 0) {
    const players = getCurrentPlayers();
    if (players.length > 0) {
      currentPlayOrder = players.map((p) => p.id).sort((a, b) => a - b);
    }
  }
  return [...currentPlayOrder];
}

export function getCurrentPlayers(): Player[] {
  try {
    const data = uni.getStorageSync('nineball_players');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getPlayer(playerId: number): Player | undefined {
  const players = getCurrentPlayers();
  return players.find((p) => p.id === playerId);
}

export function resetPlayOrder(): void {
  currentPlayOrder = [];
}

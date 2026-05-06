export function assignBalls(playerCount: number, totalBalls: number = 15): Map<number, number[]> {
  const ballsPerPlayer = Math.floor(totalBalls / playerCount)
  const remainder = totalBalls % playerCount
  const allBalls = Array.from({ length: totalBalls }, (_, i) => i + 1)
  
  for (let i = allBalls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allBalls[i], allBalls[j]] = [allBalls[j], allBalls[i]]
  }
  
  const playerBalls = new Map<number, number[]>()
  let ballIndex = 0
  
  for (let i = 0; i < playerCount; i++) {
    const count = ballsPerPlayer + (i < remainder ? 1 : 0)
    playerBalls.set(i, allBalls.slice(ballIndex, ballIndex + count))
    ballIndex += count
  }
  
  return playerBalls
}

export function checkWinCondition(playerBalls: Map<number, number[]>, remainingBalls: number[]): number | null {
  let lastPlayer: number | null = null
  let remainingCount = 0
  
  for (const [playerId, balls] of playerBalls) {
    const playerRemaining = balls.filter(b => remainingBalls.includes(b))
    if (playerRemaining.length > 0) {
      lastPlayer = playerId
      remainingCount++
    }
  }
  
  return remainingCount === 1 ? lastPlayer : null
}

export function calculateSnookerFoul(foulType: string): number {
  const foulPoints: Record<string, number> = {
    'miss': 4,
    'cue_ball_fall': 4,
    'wrong_ball': 4,
    'no_contact': 4,
    'foul_red': 4,
    'foul_yellow': 2,
    'foul_green': 3,
    'foul_brown': 4,
    'foul_blue': 5,
    'foul_pink': 6,
    'foul_black': 7
  }
  return foulPoints[foulType] || 4
}

export function getNextBall(balls: number[], gameType: string, currentPlayer?: number): number | null {
  if (gameType === 'nineball') {
    const sorted = [...balls].sort((a, b) => a - b)
    return sorted.length > 0 ? sorted[0] : null
  }
  return null
}

export function generateRoomCode(): string {
  const chars = '0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function calculateWinner(player1Score: number, player2Score: number, bestOf: number): number | null {
  const needed = Math.ceil(bestOf / 2)
  if (player1Score >= needed) return 1
  if (player2Score >= needed) return 2
  return null
}

export interface Player {
  id: string
  name: string
  avatar: string
}

export interface Match {
  id: string
  round: number
  player1: Player | null
  player2: Player | null
  score1: number
  score2: number
  winner: Player | null
  isBye: boolean
}

export interface Tournament {
  id: string
  name: string
  type: 'single' | 'double'
  bestOf: number
  gameType: string
  players: Player[]
  matches: Match[]
  winner: Player | null
  status: 'pending' | 'ongoing' | 'finished'
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateSingleEliminationBracket(players: Player[]): Match[] {
  const matches: Match[] = []
  const shuffled = shuffleArray(players)
  const rounds = Math.ceil(Math.log2(shuffled.length))
  const totalSlots = Math.pow(2, rounds)
  
  while (shuffled.length < totalSlots) {
    shuffled.push({ id: 'bye', name: '轮空', avatar: '' })
  }
  
  let round = 1
  let currentPlayers = [...shuffled]
  
  while (currentPlayers.length > 1) {
    const roundMatches: Match[] = []
    for (let i = 0; i < currentPlayers.length; i += 2) {
      const player1 = currentPlayers[i].id === 'bye' ? null : currentPlayers[i]
      const player2 = currentPlayers[i + 1]?.id === 'bye' ? null : currentPlayers[i + 1]
      
      roundMatches.push({
        id: `match-${round}-${i / 2}`,
        round,
        player1,
        player2,
        score1: 0,
        score2: 0,
        winner: null,
        isBye: !player1 || !player2
      })
    }
    matches.push(...roundMatches)
    round++
    currentPlayers = roundMatches.map(m => m.winner).filter((p): p is Player => p !== null)
  }
  
  return matches
}

export function generateDoubleEliminationBracket(players: Player[]): { winners: Match[]; losers: Match[] } {
  const winners: Match[] = []
  const losers: Match[] = []
  
  const shuffled = shuffleArray(players)
  const rounds = Math.ceil(Math.log2(shuffled.length))
  const totalSlots = Math.pow(2, rounds)
  
  while (shuffled.length < totalSlots) {
    shuffled.push({ id: 'bye', name: '轮空', avatar: '' })
  }
  
  let winnerRound = 1
  let loserRound = 1
  let currentWinners = [...shuffled]
  let currentLosers: Player[] = []
  
  while (currentWinners.length > 1 || currentLosers.length > 0) {
    const winnerMatches: Match[] = []
    for (let i = 0; i < currentWinners.length; i += 2) {
      const player1 = currentWinners[i].id === 'bye' ? null : currentWinners[i]
      const player2 = currentWinners[i + 1]?.id === 'bye' ? null : currentWinners[i + 1]
      
      winnerMatches.push({
        id: `winner-${winnerRound}-${i / 2}`,
        round: winnerRound,
        player1,
        player2,
        score1: 0,
        score2: 0,
        winner: null,
        isBye: !player1 || !player2
      })
    }
    winners.push(...winnerMatches)
    
    const newWinners = winnerMatches.map(m => {
      const winner = m.player1 && (!m.player2 || m.score1 > m.score2) ? m.player1 : m.player2
      const loser = m.player1 && (!m.player2 || m.score1 > m.score2) ? m.player2 : m.player1
      if (loser && loser.id !== 'bye') {
        currentLosers.push(loser)
      }
      return winner
    }).filter((p): p is Player => p !== null && p.id !== 'bye')
    
    if (currentLosers.length > 1) {
      const loserMatches: Match[] = []
      for (let i = 0; i < currentLosers.length; i += 2) {
        const player1 = currentLosers[i]
        const player2 = currentLosers[i + 1]
        
        loserMatches.push({
          id: `loser-${loserRound}-${i / 2}`,
          round: loserRound,
          player1,
          player2,
          score1: 0,
          score2: 0,
          winner: null,
          isBye: false
        })
      }
      losers.push(...loserMatches)
      currentLosers = loserMatches.map(m => m.score1 > m.score2 ? m.player1! : m.player2!)
    }
    
    winnerRound++
    loserRound++
    currentWinners = newWinners
  }
  
  return { winners, losers }
}

export function determineMatchWinner(match: Match, bestOf: number): Player | null {
  const needed = Math.ceil(bestOf / 2)
  if (match.score1 >= needed) return match.player1
  if (match.score2 >= needed) return match.player2
  return null
}

export function getNextRoundPlayers(matches: Match[]): Player[] {
  return matches
    .map(m => m.winner)
    .filter((p): p is Player => p !== null)
}

export function findChampion(tournament: Tournament): Player | null {
  if (tournament.type === 'single') {
    return tournament.matches[ tournament.matches.length - 1 ]?.winner || null
  }
  
  const winnerBracketWinner = tournament.matches.find(m => 
    m.round === Math.max(...tournament.matches.map(m => m.round)) && 
    m.id.startsWith('winner')
  )?.winner
  
  const loserBracketWinner = tournament.matches.find(m => 
    m.round === Math.max(...tournament.matches.map(m => m.round)) && 
    m.id.startsWith('loser')
  )?.winner
  
  if (!winnerBracketWinner || !loserBracketWinner) {
    return winnerBracketWinner || loserBracketWinner || null
  }
  
  return winnerBracketWinner
}

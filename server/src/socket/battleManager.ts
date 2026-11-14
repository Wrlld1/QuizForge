import { calculateElo } from '../services/ratingService'
import { shuffleOptions } from '../utils/shuffleOptions'
import prisma from '../prismaClient'

export interface BattlePlayer {
  id: number
  socketId: string
  username: string
  rating: number
  score: number
  answers: number[]
}

export interface BattleRoom {
  id: string
  players: BattlePlayer[]
  questions: any[]
  shuffledData: { options: string[]; answer: number }[]
  currentRound: number
  totalRounds: number
  category: string
  status: 'waiting' | 'countdown' | 'playing' | 'finished'
}

const rooms = new Map<string, BattleRoom>()
const queue: BattlePlayer[] = []

function generateRoomId(): string {
  return 'room_' + Math.random().toString(36).slice(2, 10)
}

export function addToQueue(player: BattlePlayer): BattleRoom | null {
  // Check if already in queue
  const existing = queue.findIndex((p) => p.id === player.id)
  if (existing !== -1) queue.splice(existing, 1)

  queue.push(player)

  if (queue.length >= 2) {
    const p1 = queue.shift()!
    const p2 = queue.shift()!
    return createRoom(p1, p2)
  }

  return null
}

export function removeFromQueue(socketId: string) {
  const idx = queue.findIndex((p) => p.socketId === socketId)
  if (idx !== -1) queue.splice(idx, 1)
}

function createRoom(p1: BattlePlayer, p2: BattlePlayer): BattleRoom {
  const room: BattleRoom = {
    id: generateRoomId(),
    players: [p1, p2],
    questions: [],
    shuffledData: [],
    currentRound: 0,
    totalRounds: 5,
    category: 'javascript',
    status: 'waiting',
  }
  rooms.set(room.id, room)
  return room
}

export function getRoom(roomId: string): BattleRoom | undefined {
  return rooms.get(roomId)
}

export function getRoomBySocket(socketId: string): BattleRoom | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.socketId === socketId)) {
      return room
    }
  }
  return undefined
}

export async function loadQuestions(room: BattleRoom) {
  const questions = await prisma.question.findMany({
    where: { category: room.category },
    orderBy: { id: 'asc' },
  })
  // Fisher-Yates shuffle questions
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]
  }
  room.questions = questions.slice(0, room.totalRounds)

  // Shuffle options for each question
  room.shuffledData = room.questions.map((q) => {
    let options: string[]
    try { options = JSON.parse(q.options) } catch { options = [q.options] }
    return shuffleOptions(options, q.answer)
  })
}

export function submitBattleAnswer(roomId: string, socketId: string, answerIndex: number): {
  correct: boolean
  correctAnswer: number
  bothAnswered: boolean
} | null {
  const room = rooms.get(roomId)
  if (!room || room.currentRound >= room.questions.length) return null

  const player = room.players.find((p) => p.socketId === socketId)
  if (!player) return null

  const shuffled = room.shuffledData[room.currentRound]
  const correct = shuffled.answer === answerIndex

  if (correct) player.score++
  player.answers.push(answerIndex)

  const bothAnswered = room.players.every((p) => p.answers.length > room.currentRound)

  return { correct, correctAnswer: shuffled.answer, bothAnswered }
}

export function advanceRound(roomId: string): boolean {
  const room = rooms.get(roomId)
  if (!room) return false

  room.currentRound++
  return room.currentRound >= room.totalRounds
}

export async function finishBattle(roomId: string) {
  const room = rooms.get(roomId)
  if (!room) return null

  room.status = 'finished'

  const [p1, p2] = room.players
  const winner = p1.score > p2.score ? p1 : p2.score > p1.score ? p2 : null

  if (winner) {
    const loser = winner === p1 ? p2 : p1
    const { newWinnerRating, newLoserRating } = calculateElo(winner.rating, loser.rating)

    await Promise.all([
      prisma.user.update({ where: { id: winner.id }, data: { rating: newWinnerRating } }),
      prisma.user.update({ where: { id: loser.id }, data: { rating: newLoserRating } }),
    ])
  }

  rooms.delete(roomId)

  return {
    players: room.players.map((p) => ({ id: p.id, username: p.username, score: p.score })),
    winnerId: winner?.id || null,
    isDraw: !winner,
  }
}

export function cleanupDisconnect(socketId: string) {
  removeFromQueue(socketId)
  const room = getRoomBySocket(socketId)
  if (room) {
    rooms.delete(room.id)
    return room
  }
  return null
}

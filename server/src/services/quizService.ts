import prisma from '../prismaClient'

export async function generateQuestions(category: string, difficulty: string, count: number = 10) {
  const questions = await prisma.question.findMany({
    where: { category, difficulty },
    orderBy: { id: 'asc' },
  })

  // Fisher-Yates shuffle and take `count`
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]]
  }
  return questions.slice(0, count)
}

export function calculateScore(correct: number, total: number, difficulty: string, timeTaken: number): number {
  const basePoints = correct * 10
  const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.0 : 0.7
  const timeBonus = Math.max(0, Math.floor((total * 30 - timeTaken) / 10))
  return Math.round(basePoints * difficultyMultiplier + timeBonus)
}

export async function updateUserProgress(userId: number, xpEarned: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null

  let xp = user.xp + xpEarned
  let level = user.level
  let xpToNext = user.xpToNext

  while (xp >= xpToNext) {
    xp -= xpToNext
    level++
    xpToNext = Math.floor(xpToNext * 1.2)
  }

  return prisma.user.update({
    where: { id: userId },
    data: { xp, level, xpToNext },
  })
}

export async function saveGameSession(data: {
  userId: number
  mode: string
  category: string
  difficulty: string
  score: number
  totalQuestions: number
  correctCount: number
  timeTaken: number
  streak: number
  xpEarned: number
  isBattle?: boolean
  isWin?: boolean
}) {
  return prisma.gameSession.create({ data })
}

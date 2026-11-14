import { updateUserProgress } from './quizService'
import prisma from '../prismaClient'

interface CheckContext {
  userId: number
}

type AchievementChecker = (ctx: CheckContext) => Promise<boolean>

const checkers: Record<string, AchievementChecker> = {
  first_blood: async ({ userId }) => {
    const count = await prisma.gameSession.count({ where: { userId } })
    return count >= 1
  },

  perfect_round: async ({ userId }) => {
    const session = await prisma.gameSession.findFirst({
      where: { userId, correctCount: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
    })
    return session !== null && session.correctCount === session.totalQuestions
  },

  speed_demon: async ({ userId }) => {
    // Check last session: total time < 5s * totalQuestions
    const session = await prisma.gameSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    if (!session || session.totalQuestions === 0) return false
    return session.timeTaken > 0 && session.timeTaken < session.totalQuestions * 5
  },

  marathon_runner: async ({ userId }) => {
    const session = await prisma.gameSession.findFirst({
      where: { userId, mode: 'MARATHON', score: { gte: 500 } },
    })
    return session !== null
  },

  battle_winner: async ({ userId }) => {
    const win = await prisma.gameSession.findFirst({
      where: { userId, isBattle: true, isWin: true },
    })
    return win !== null
  },

  on_fire: async ({ userId }) => {
    const session = await prisma.gameSession.findFirst({
      where: { userId, streak: { gte: 10 } },
    })
    return session !== null
  },

  scholar: async ({ userId }) => {
    const categories = await prisma.gameSession.groupBy({
      by: ['category'],
      where: { userId },
    })
    return categories.length >= 6
  },

  veteran: async ({ userId }) => {
    const count = await prisma.gameSession.count({ where: { userId } })
    return count >= 50
  },

  elite: async ({ userId }) => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { rating: true } })
    return (user?.rating || 0) >= 1500
  },

  grandmaster: async ({ userId }) => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { rating: true } })
    return (user?.rating || 0) >= 2000
  },
}

export async function checkAndUnlockAchievements(userId: number) {
  const allAchievements = await prisma.achievement.findMany()
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId))

  const newlyUnlocked: { key: string; name: string; xpReward: number }[] = []

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue

    const checker = checkers[achievement.key]
    if (!checker) continue

    const passed = await checker({ userId })
    if (!passed) continue

    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    })

    // Award XP with level-up check
    await updateUserProgress(userId, achievement.xpReward)

    newlyUnlocked.push({
      key: achievement.key,
      name: achievement.name,
      xpReward: achievement.xpReward,
    })
  }

  return newlyUnlocked
}

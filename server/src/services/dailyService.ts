import prisma from '../prismaClient'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Ensure UserDailyProgress rows exist for today for all active challenges.
 */
export async function ensureDailyProgress(userId: number) {
  const date = todayStr()
  const challenges = await prisma.dailyChallenge.findMany({ where: { isActive: true } })

  for (const ch of challenges) {
    await prisma.userDailyProgress.upsert({
      where: { userId_challengeId_date: { userId, challengeId: ch.id, date } },
      update: {},
      create: { userId, challengeId: ch.id, date, progress: 0 },
    })
  }
}

/**
 * Get today's challenges with user progress.
 */
export async function getDailyChallenges(userId: number) {
  await ensureDailyProgress(userId)
  const date = todayStr()

  const challenges = await prisma.dailyChallenge.findMany({
    where: { isActive: true },
    include: {
      progress: {
        where: { userId, date },
      },
    },
  })

  return challenges.map((ch) => {
    const p = ch.progress[0]
    return {
      id: ch.id,
      title: ch.title,
      description: ch.description,
      type: ch.type,
      target: ch.target,
      xpReward: ch.xpReward,
      progress: p?.progress ?? 0,
      completed: p?.completed ?? false,
      claimed: p?.claimed ?? false,
    }
  })
}

/**
 * Claim reward for a completed challenge.
 */
export async function claimReward(userId: number, challengeId: number) {
  const date = todayStr()
  const progress = await prisma.userDailyProgress.findUnique({
    where: { userId_challengeId_date: { userId, challengeId, date } },
    include: { challenge: true },
  })

  if (!progress || !progress.completed || progress.claimed) {
    return null
  }

  await prisma.userDailyProgress.update({
    where: { id: progress.id },
    data: { claimed: true },
  })

  // Grant XP
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null

  let xp = user.xp + progress.challenge.xpReward
  let level = user.level
  let xpToNext = user.xpToNext
  let levelUp = false

  while (xp >= xpToNext) {
    xp -= xpToNext
    level++
    xpToNext = Math.floor(xpToNext * 1.2)
    levelUp = true
  }

  await prisma.user.update({
    where: { id: userId },
    data: { xp, level, xpToNext },
  })

  return { xpGained: progress.challenge.xpReward, levelUp, newLevel: level }
}

interface DailyEvent {
  type: 'GAME_FINISHED' | 'SCORE_POINTS' | 'CORRECT_ANSWERS' | 'WIN_BATTLE' | 'CATEGORY_PLAYED' | 'STREAK'
  value: number
}

/**
 * Update daily progress after a game event.
 */
export async function updateDailyProgress(userId: number, events: DailyEvent[]) {
  const date = todayStr()
  await ensureDailyProgress(userId)

  const typeMap: Record<string, string> = {
    GAME_FINISHED: 'PLAY_GAMES',
    SCORE_POINTS: 'SCORE_POINTS',
    CORRECT_ANSWERS: 'CORRECT_ANSWERS',
    WIN_BATTLE: 'WIN_BATTLE',
    CATEGORY_PLAYED: 'PLAY_CATEGORY',
    STREAK: 'STREAK',
  }

  for (const event of events) {
    const challengeType = typeMap[event.type]
    if (!challengeType) continue

    const challenge = await prisma.dailyChallenge.findFirst({
      where: { type: challengeType, isActive: true },
    })
    if (!challenge) continue

    const progress = await prisma.userDailyProgress.findUnique({
      where: { userId_challengeId_date: { userId, challengeId: challenge.id, date } },
    })
    if (!progress || progress.completed) continue

    const newProgress = event.type === 'STREAK'
      ? Math.max(progress.progress, event.value)
      : progress.progress + event.value

    const completed = newProgress >= challenge.target

    await prisma.userDailyProgress.update({
      where: { id: progress.id },
      data: { progress: newProgress, completed },
    })
  }
}

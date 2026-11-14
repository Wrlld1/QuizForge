import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { checkAndUnlockAchievements } from '../services/achievementService'
import prisma from '../prismaClient'

export async function getAllAchievements(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!

    const achievements = await prisma.achievement.findMany({
      orderBy: { id: 'asc' },
    })

    const unlocked = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    })
    const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]))

    const result = achievements.map((a) => ({
      id: a.id,
      key: a.key,
      name: a.name,
      description: a.description,
      icon: a.icon,
      xpReward: a.xpReward,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) || null,
    }))

    return res.json(result)
  } catch (err) {
    console.error('getAllAchievements error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function checkAchievements(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const newlyUnlocked = await checkAndUnlockAchievements(userId)
    return res.json({ newlyUnlocked })
  } catch (err) {
    console.error('checkAchievements error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

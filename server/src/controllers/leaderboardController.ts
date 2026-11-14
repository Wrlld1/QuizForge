import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../prismaClient'

export async function getLeaderboard(req: AuthRequest, res: Response) {
  try {
    const period = (req.query.period as string) || 'all'

    let dateFilter: Date | undefined
    const now = new Date()
    if (period === 'week') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    if (dateFilter) {
      // For period-based, aggregate from game sessions
      const sessions = await prisma.gameSession.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: dateFilter } },
        _sum: { score: true },
        orderBy: { _sum: { score: 'desc' } },
        take: 50,
      })

      const userIds = sessions.map((s) => s.userId)
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, avatar: true, avatarIcon: true, avatarColor: true, avatarImage: true, rating: true, level: true, xp: true },
      })

      const userMap = new Map(users.map((u) => [u.id, u]))
      const leaderboard = sessions.map((s, i) => ({
        position: i + 1,
        ...userMap.get(s.userId),
        periodScore: s._sum.score || 0,
      }))

      return res.json(leaderboard)
    }

    // All-time: order by rating
    const users = await prisma.user.findMany({
      select: { id: true, username: true, avatar: true, avatarIcon: true, avatarColor: true, avatarImage: true, rating: true, level: true, xp: true },
      orderBy: { rating: 'desc' },
      take: 50,
    })

    const leaderboard = users.map((u, i) => ({
      position: i + 1,
      ...u,
    }))

    return res.json(leaderboard)
  } catch (err) {
    console.error('getLeaderboard error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function getMyPosition(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const position = await prisma.user.count({
      where: { rating: { gt: user.rating } },
    })

    return res.json({ position: position + 1, rating: user.rating })
  } catch (err) {
    console.error('getMyPosition error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

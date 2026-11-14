import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../prismaClient'
import path from 'path'
import fs from 'fs'

const TITLES: { key: string; label: string; requirement: { type: string; value: number } }[] = [
  { key: 'Новичок', label: 'Новичок', requirement: { type: 'level', value: 1 } },
  { key: 'Ученик', label: 'Ученик', requirement: { type: 'level', value: 5 } },
  { key: 'Знаток', label: 'Знаток', requirement: { type: 'level', value: 10 } },
  { key: 'Эксперт', label: 'Эксперт', requirement: { type: 'level', value: 20 } },
  { key: 'Мастер', label: 'Мастер', requirement: { type: 'level', value: 30 } },
  { key: 'Гроссмейстер', label: 'Гроссмейстер', requirement: { type: 'rating', value: 2000 } },
  { key: 'Легенда', label: 'Легенда', requirement: { type: 'level', value: 50 } },
  { key: 'Боец', label: 'Боец', requirement: { type: 'wins', value: 10 } },
  { key: 'Чемпион', label: 'Чемпион', requirement: { type: 'wins', value: 50 } },
  { key: 'Марафонец', label: 'Марафонец', requirement: { type: 'games', value: 100 } },
]

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id === 'me' ? req.userId! : parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' })
    if (id !== req.userId) return res.status(403).json({ message: 'Access denied' })

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatar: true,
        avatarIcon: true,
        avatarColor: true,
        avatarImage: true,
        bannerColor: true,
        bio: true,
        title: true,
        rating: true,
        level: true,
        xp: true,
        xpToNext: true,
        role: true,
        createdAt: true,
      },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const stats = await prisma.gameSession.aggregate({
      where: { userId: id },
      _count: true,
      _avg: { score: true },
      _max: { streak: true },
    })

    const wins = await prisma.gameSession.count({
      where: { userId: id, isWin: true },
    })

    const catGroups = await prisma.gameSession.groupBy({
      by: ['category'],
      where: { userId: id },
      _count: true,
      orderBy: { _count: { category: 'desc' } },
      take: 1,
    })

    const totalGames = stats._count
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

    return res.json({
      ...user,
      totalGames,
      totalWins: wins,
      winRate,
      avgScore: Math.round(stats._avg.score || 0),
      bestStreak: stats._max.streak || 0,
      favoriteCategory: catGroups[0]?.category || null,
    })
  } catch (err) {
    console.error('getProfile error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { username, bio, avatarIcon, avatarColor, bannerColor } = req.body

    const data: Record<string, any> = {}

    if (username && typeof username === 'string' && username.trim().length >= 3) {
      data.username = username.trim()
    }
    if (typeof bio === 'string') {
      data.bio = bio.slice(0, 200)
    }
    if (avatarIcon && typeof avatarIcon === 'string') {
      data.avatarIcon = avatarIcon
    }
    if (avatarColor && typeof avatarColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(avatarColor)) {
      data.avatarColor = avatarColor
    }
    if (bannerColor && typeof bannerColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(bannerColor)) {
      data.bannerColor = bannerColor
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        avatar: true,
        avatarIcon: true,
        avatarColor: true,
        avatarImage: true,
        bannerColor: true,
        bio: true,
        title: true,
        rating: true,
        level: true,
        xp: true,
        xpToNext: true,
        role: true,
      },
    })

    return res.json(user)
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Username already taken' })
    }
    console.error('updateProfile error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function uploadAvatarImage(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Delete old avatar image if exists
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarImage: true },
    })
    if (currentUser?.avatarImage) {
      const oldPath = path.join(__dirname, '../../uploads/avatars', path.basename(currentUser.avatarImage))
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    const avatarImage = `/uploads/avatars/${req.file.filename}`
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarImage },
      select: { avatarImage: true },
    })

    return res.json({ avatarImage: user.avatarImage })
  } catch (err) {
    console.error('uploadAvatarImage error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function deleteAvatarImage(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarImage: true },
    })

    if (currentUser?.avatarImage) {
      const filePath = path.join(__dirname, '../../uploads/avatars', path.basename(currentUser.avatarImage))
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatarImage: null },
    })

    return res.json({ message: 'Avatar image deleted' })
  } catch (err) {
    console.error('deleteAvatarImage error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function getTitles(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, rating: true, title: true },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const wins = await prisma.gameSession.count({
      where: { userId, isWin: true },
    })
    const games = await prisma.gameSession.count({
      where: { userId },
    })

    const titles = TITLES.map((t) => {
      let unlocked = false
      const r = t.requirement
      if (r.type === 'level') unlocked = user.level >= r.value
      else if (r.type === 'rating') unlocked = user.rating >= r.value
      else if (r.type === 'wins') unlocked = wins >= r.value
      else if (r.type === 'games') unlocked = games >= r.value

      return {
        key: t.key,
        label: t.label,
        requirement: r,
        unlocked,
        current: user.title === t.key,
      }
    })

    return res.json(titles)
  } catch (err) {
    console.error('getTitles error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function updateTitle(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { title } = req.body

    const titleDef = TITLES.find((t) => t.key === title)
    if (!titleDef) return res.status(400).json({ message: 'Invalid title' })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, rating: true },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Check eligibility
    const r = titleDef.requirement
    let eligible = false
    if (r.type === 'level') eligible = user.level >= r.value
    else if (r.type === 'rating') eligible = user.rating >= r.value
    else {
      const count = r.type === 'wins'
        ? await prisma.gameSession.count({ where: { userId, isWin: true } })
        : await prisma.gameSession.count({ where: { userId } })
      eligible = count >= r.value
    }

    if (!eligible) return res.status(403).json({ message: 'Title not unlocked' })

    await prisma.user.update({
      where: { id: userId },
      data: { title },
    })

    return res.json({ title })
  } catch (err) {
    console.error('updateTitle error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function getGameHistory(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id === 'me' ? req.userId! : parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' })
    if (id !== req.userId) return res.status(403).json({ message: 'Access denied' })

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50)
    const offset = parseInt(req.query.offset as string) || 0

    const [sessions, total] = await Promise.all([
      prisma.gameSession.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          mode: true,
          category: true,
          difficulty: true,
          score: true,
          totalQuestions: true,
          correctCount: true,
          timeTaken: true,
          xpEarned: true,
          isBattle: true,
          isWin: true,
          createdAt: true,
        },
      }),
      prisma.gameSession.count({ where: { userId: id } }),
    ])

    return res.json({ sessions, total, limit, offset })
  } catch (err) {
    console.error('getGameHistory error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

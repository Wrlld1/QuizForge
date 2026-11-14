import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../prismaClient'

// GET /api/admin/stats
export async function getStats(_req: AuthRequest, res: Response) {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalUsers, totalGames, totalQuestions, avgScore, activeToday, activeWeek] =
      await Promise.all([
        prisma.user.count(),
        prisma.gameSession.count(),
        prisma.question.count(),
        prisma.gameSession.aggregate({ _avg: { score: true } }),
        prisma.gameSession.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: todayStart } },
        }),
        prisma.gameSession.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: weekStart } },
        }),
      ])

    return res.json({
      totalUsers,
      totalGames,
      totalQuestions,
      avgScore: Math.round(avgScore._avg.score || 0),
      activeToday: activeToday.length,
      activeWeek: activeWeek.length,
    })
  } catch (err) {
    console.error('getStats error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/admin/questions
export async function getQuestions(req: AuthRequest, res: Response) {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = parseInt(req.query.offset as string) || 0
    const category = req.query.category as string | undefined
    const difficulty = req.query.difficulty as string | undefined
    const search = req.query.search as string | undefined

    const where: any = {}
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (search) where.text = { contains: search }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { id: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.question.count({ where }),
    ])

    return res.json({ questions, total, limit, offset })
  } catch (err) {
    console.error('getQuestions error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/admin/questions
export async function createQuestion(req: AuthRequest, res: Response) {
  try {
    const { text, category, difficulty, options, answer, codeSnippet, codeLanguage } = req.body

    if (!text || !category || !options) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const question = await prisma.question.create({
      data: {
        text,
        category,
        difficulty: difficulty || 'medium',
        options: typeof options === 'string' ? options : JSON.stringify(options),
        answer: answer ?? 0,
        codeSnippet: codeSnippet || null,
        codeLanguage: codeLanguage || null,
      },
    })

    return res.status(201).json(question)
  } catch (err) {
    console.error('createQuestion error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/admin/questions/:id
export async function updateQuestion(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' })

    const { text, category, difficulty, options, answer, codeSnippet, codeLanguage } = req.body
    const data: any = {}
    if (text !== undefined) data.text = text
    if (category !== undefined) data.category = category
    if (difficulty !== undefined) data.difficulty = difficulty
    if (options !== undefined) data.options = typeof options === 'string' ? options : JSON.stringify(options)
    if (answer !== undefined) data.answer = answer
    if (codeSnippet !== undefined) data.codeSnippet = codeSnippet || null
    if (codeLanguage !== undefined) data.codeLanguage = codeLanguage || null

    const question = await prisma.question.update({ where: { id }, data })
    return res.json(question)
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Question not found' })
    console.error('updateQuestion error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/admin/questions/:id
export async function deleteQuestion(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' })

    await prisma.question.delete({ where: { id } })
    return res.json({ message: 'Deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Question not found' })
    console.error('deleteQuestion error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/admin/users
export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = parseInt(req.query.offset as string) || 0
    const search = req.query.search as string | undefined

    const where: any = {}
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          rating: true,
          level: true,
          createdAt: true,
        },
        orderBy: { id: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ])

    return res.json({ users, total, limit, offset })
  } catch (err) {
    console.error('getUsers error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/admin/users/:id/role
export async function updateUserRole(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' })

    if (id === req.userId) {
      return res.status(403).json({ message: 'Cannot change your own role' })
    }

    const { role } = req.body
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be USER or ADMIN' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    })

    return res.json(user)
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'User not found' })
    console.error('updateUserRole error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/admin/analytics
export async function getAnalytics(_req: AuthRequest, res: Response) {
  try {
    // Category distribution
    const categoryDist = await prisma.gameSession.groupBy({
      by: ['category'],
      _count: true,
      orderBy: { _count: { category: 'desc' } },
    })

    // Activity for last 7 days
    const now = new Date()
    const days: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      const count = await prisma.gameSession.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      })
      days.push({
        date: dayStart.toISOString().slice(5, 10),
        count,
      })
    }

    // Top 5 hardest/easiest questions (random sample from hard/easy difficulty)
    // Note: per-question accuracy stats are not tracked, so we sample by difficulty
    const hardQuestions = await prisma.question.findMany({
      where: { difficulty: 'hard' },
      select: { id: true, text: true, category: true, difficulty: true },
    })
    const easyQuestions = await prisma.question.findMany({
      where: { difficulty: 'easy' },
      select: { id: true, text: true, category: true, difficulty: true },
    })

    // Fisher-Yates shuffle for fair sampling
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    const hardest = shuffle(hardQuestions).slice(0, 5)
    const easiest = shuffle(easyQuestions).slice(0, 5)

    return res.json({
      categoryDistribution: categoryDist.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      activityDays: days,
      hardestQuestions: hardest,
      easiestQuestions: easiest,
    })
  } catch (err) {
    console.error('getAnalytics error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

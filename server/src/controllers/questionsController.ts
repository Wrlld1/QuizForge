import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../prismaClient'

export async function getQuestions(req: AuthRequest, res: Response) {
  try {
    const category = req.query.category as string | undefined
    const difficulty = req.query.difficulty as string | undefined

    const where: any = {}
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty

    const questions = await prisma.question.findMany({
      where,
      select: { id: true, text: true, category: true, difficulty: true, options: true, codeSnippet: true, codeLanguage: true },
      orderBy: { id: 'asc' },
    })

    const result = questions.map((q) => {
      let options: string[]
      try { options = JSON.parse(q.options) } catch { options = [q.options] }
      return { ...q, options }
    })

    return res.json(result)
  } catch (err) {
    console.error('getQuestions error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function getQuestionById(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid id' })

    const question = await prisma.question.findUnique({ where: { id } })
    if (!question) return res.status(404).json({ message: 'Question not found' })

    let options: string[]
    try { options = JSON.parse(question.options) } catch { options = [question.options] }

    return res.json({ ...question, options })
  } catch (err) {
    console.error('getQuestionById error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

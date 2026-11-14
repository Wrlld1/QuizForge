import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import prisma from '../prismaClient'

export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    next()
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

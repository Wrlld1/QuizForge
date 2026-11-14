import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../middleware/auth'
import prisma from '../prismaClient'
import { JWT_SECRET } from '../config'

function userToResponse(user: any) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    level: user.level,
    xp: user.xp,
    xpToNext: user.xpToNext,
    rating: user.rating,
    avatar: user.avatar,
    avatarIcon: user.avatarIcon,
    avatarColor: user.avatarColor,
    avatarImage: user.avatarImage,
    bannerColor: user.bannerColor,
    bio: user.bio,
    title: user.title,
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: userToResponse(user), token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username'
      return res.status(409).json({ message: `${field} already taken` })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, email, password: hashed },
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user: userToResponse(user), token })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user: userToResponse(user) })
  } catch (error) {
    console.error('Me error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

import authRoutes from './routes/auth'
import questionsRoutes from './routes/questions'
import quizRoutes from './routes/quiz'
import leaderboardRoutes from './routes/leaderboard'
import profileRoutes from './routes/profile'
import achievementsRoutes from './routes/achievements'
import adminRoutes from './routes/admin'
import dailyRoutes from './routes/daily'
import { setupSocketHandlers } from './socket/socketHandler'

dotenv.config()

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN },
})

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/', (_req, res) => {
  res.json({ message: 'QuizForge API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/achievements', achievementsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/daily', dailyRoutes)

setupSocketHandlers(io)

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

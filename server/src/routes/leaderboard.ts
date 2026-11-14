import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getLeaderboard, getMyPosition } from '../controllers/leaderboardController'

const router = Router()

router.get('/', authMiddleware, getLeaderboard)
router.get('/position', authMiddleware, getMyPosition)

export default router

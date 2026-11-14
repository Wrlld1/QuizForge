import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getAllAchievements, checkAchievements } from '../controllers/achievementsController'

const router = Router()

router.get('/', authMiddleware, getAllAchievements)
router.post('/check', authMiddleware, checkAchievements)

export default router

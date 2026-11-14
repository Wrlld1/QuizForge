import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getChallenges, claim } from '../controllers/dailyController'

const router = Router()

router.get('/', authMiddleware, getChallenges)
router.post('/claim/:id', authMiddleware, claim)

export default router

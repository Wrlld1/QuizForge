import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { adminMiddleware } from '../middleware/adminAuth'
import {
  getStats,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getUsers,
  updateUserRole,
  getAnalytics,
} from '../controllers/adminController'

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/stats', getStats)
router.get('/questions', getQuestions)
router.post('/questions', createQuestion)
router.put('/questions/:id', updateQuestion)
router.delete('/questions/:id', deleteQuestion)
router.get('/users', getUsers)
router.put('/users/:id/role', updateUserRole)
router.get('/analytics', getAnalytics)

export default router

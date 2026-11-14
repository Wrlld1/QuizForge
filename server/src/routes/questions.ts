import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { getQuestions, getQuestionById } from '../controllers/questionsController'

const router = Router()

router.get('/', authMiddleware, getQuestions)
router.get('/:id', authMiddleware, getQuestionById)

export default router

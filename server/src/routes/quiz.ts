import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { nextQuestion, startRound, submitAnswer, finishQuiz, saveBattleResult, getSkillStats } from '../controllers/quizController'

const router = Router()

router.post('/next-question', authMiddleware, nextQuestion)
router.post('/start-round', authMiddleware, startRound)
router.post('/answer', authMiddleware, submitAnswer)
router.post('/finish', authMiddleware, finishQuiz)
router.post('/battle-result', authMiddleware, saveBattleResult)
router.get('/skill-stats', authMiddleware, getSkillStats)

export default router

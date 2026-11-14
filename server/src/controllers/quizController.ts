import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { getNextQuestion, updateSkillLevel, getQuizBatch } from '../services/adaptiveService'
import { updateDailyProgress } from '../services/dailyService'
import { calculateScore, updateUserProgress, saveGameSession } from '../services/quizService'
import { checkAndUnlockAchievements } from '../services/achievementService'
import { shuffleOptions } from '../utils/shuffleOptions'
import prisma from '../prismaClient'

// Map: "userId:questionId" -> shuffled correct answer index
const shuffledAnswerMap = new Map<string, number>()

/**
 * POST /api/quiz/next-question
 * Body: { category, mode, excludeIds?, difficulty? }
 * Returns the next question, using adaptive difficulty when appropriate.
 */
export async function nextQuestion(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { category, mode, excludeIds = [], difficulty } = req.body

    if (!category) {
      return res.status(400).json({ message: 'Category is required' })
    }

    // Use explicit difficulty only for CLASSIC/MARATHON when user selected one.
    // TIMED always uses adaptive.
    const useExplicit = mode !== 'TIMED' && difficulty
    const question = await getNextQuestion(userId, category, excludeIds, useExplicit || undefined)

    if (!question) {
      return res.json({ question: null, finished: true })
    }

    let options: string[]
    try {
      options = JSON.parse(question.options)
    } catch {
      options = [question.options]
    }

    // Shuffle options so correct answer isn't always at the same index
    const shuffled = shuffleOptions(options, question.answer)
    const key = `${userId}:${question.id}`
    shuffledAnswerMap.set(key, shuffled.answer)

    return res.json({
      question: {
        id: question.id,
        text: question.text,
        options: shuffled.options,
        difficulty: question.difficulty,
        codeSnippet: question.codeSnippet || null,
        codeLanguage: question.codeLanguage || null,
      },
      finished: false,
    })
  } catch (err) {
    console.error('nextQuestion error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

/**
 * POST /api/quiz/start-round
 * Body: { category, difficulty }
 * Returns 10 questions with difficulty distribution.
 */
export async function startRound(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { category, difficulty } = req.body

    if (!category) {
      return res.status(400).json({ message: 'Category is required' })
    }

    const questions = await getQuizBatch(category, difficulty || 'medium')

    const parsed = questions.map((q) => {
      let options: string[]
      try {
        options = JSON.parse(q.options)
      } catch {
        options = [q.options]
      }

      const shuffled = shuffleOptions(options, q.answer)
      const key = `${userId}:${q.id}`
      shuffledAnswerMap.set(key, shuffled.answer)

      return {
        id: q.id,
        text: q.text,
        options: shuffled.options,
        difficulty: q.difficulty,
        codeSnippet: q.codeSnippet || null,
        codeLanguage: q.codeLanguage || null,
      }
    })

    return res.json({ questions: parsed })
  } catch (err) {
    console.error('startRound error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

/**
 * POST /api/quiz/answer
 * Body: { questionId, answerIndex, mode, difficulty }
 * Checks answer, updates skill level, returns result.
 */
export async function submitAnswer(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { questionId, answerIndex, difficulty } = req.body

    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question) {
      return res.status(404).json({ message: 'Question not found' })
    }

     const key = `${userId}:${questionId}`
    const shuffledCorrect = shuffledAnswerMap.get(key)
    const correctAnswer = shuffledCorrect !== undefined ? shuffledCorrect : question.answer
    const isCorrect = correctAnswer === answerIndex


    shuffledAnswerMap.delete(key)


    const newSkillLevel = await updateSkillLevel(userId, isCorrect, difficulty || question.difficulty)

    return res.json({
      correct: isCorrect,
      correctAnswer,
      skillLevel: newSkillLevel,
    })
  } catch (err) {
    console.error('submitAnswer error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

/**
 * POST /api/quiz/finish
 * Body: { mode, category, difficulty, score, totalQuestions, correctCount, timeTaken, streak }
 * Saves game session, updates user progress, checks achievements.
 */
export async function finishQuiz(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { mode, category, difficulty, totalQuestions, correctCount, timeTaken, streak } = req.body

    const score = calculateScore(correctCount, totalQuestions, difficulty, timeTaken || 0)
    const xpEarned = correctCount * 10

    const session = await saveGameSession({
      userId,
      mode: mode || 'CLASSIC',
      category: category || 'javascript',
      difficulty: difficulty || 'medium',
      score,
      totalQuestions: totalQuestions || 0,
      correctCount: correctCount || 0,
      timeTaken: timeTaken || 0,
      streak: streak || 0,
      xpEarned,
    })

    await updateUserProgress(userId, xpEarned)
    const newAchievements = await checkAndUnlockAchievements(userId)

    // Update daily challenges
    await updateDailyProgress(userId, [
      { type: 'GAME_FINISHED', value: 1 },
      { type: 'SCORE_POINTS', value: score },
      { type: 'CORRECT_ANSWERS', value: correctCount || 0 },
      { type: 'CATEGORY_PLAYED', value: 1 },
      { type: 'STREAK', value: streak || 0 },
    ])

    return res.json({
      session,
      xpEarned,
      newAchievements,
    })
  } catch (err) {
    console.error('finishQuiz error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

/**
 * POST /api/quiz/battle-result
 * Body: { score, correctAnswers, totalQuestions, timeSpent, opponentScore }
 * Saves AI battle result, updates XP/rating, checks achievements.
 */
export async function saveBattleResult(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { score, correctAnswers, totalQuestions, timeSpent, opponentScore } = req.body

    const isWin = score > opponentScore
    const isDraw = score === opponentScore
    const ratingChange = isWin ? 15 : isDraw ? 5 : -10
    const xpEarned = correctAnswers * 10

    const session = await saveGameSession({
      userId,
      mode: 'BATTLE_AI',
      category: 'mixed',
      difficulty: 'medium',
      score: score || 0,
      totalQuestions: totalQuestions || 0,
      correctCount: correctAnswers || 0,
      timeTaken: timeSpent || 0,
      streak: 0,
      xpEarned,
      isBattle: true,
      isWin,
    })

    await updateUserProgress(userId, xpEarned)

    // Update daily challenges
    const dailyEvents: { type: 'GAME_FINISHED' | 'SCORE_POINTS' | 'CORRECT_ANSWERS' | 'WIN_BATTLE' | 'CATEGORY_PLAYED' | 'STREAK'; value: number }[] = [
      { type: 'GAME_FINISHED', value: 1 },
      { type: 'CORRECT_ANSWERS', value: correctAnswers || 0 },
      { type: 'SCORE_POINTS', value: score || 0 },
    ]
    if (isWin) dailyEvents.push({ type: 'WIN_BATTLE', value: 1 })
    await updateDailyProgress(userId, dailyEvents)

    // Update rating (clamp to 0 minimum)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true },
    })
    const newRatingValue = Math.max(0, (currentUser?.rating || 0) + ratingChange)
    const user = await prisma.user.update({
      where: { id: userId },
      data: { rating: newRatingValue },
      select: { rating: true, xp: true, level: true, xpToNext: true },
    })

    const newAchievements = await checkAndUnlockAchievements(userId)

    return res.json({
      session,
      xpEarned,
      ratingChange,
      newRating: user.rating,
      newLevel: user.level,
      newXp: user.xp,
      newXpToNext: user.xpToNext,
      newAchievements,
    })
  } catch (err) {
    console.error('saveBattleResult error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

/**
 * GET /api/quiz/skill-stats
 * Returns the user's skill level and recommended difficulty.
 */
export async function getSkillStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skillLevel: true },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const { skillLevelToDifficulty } = await import('../services/adaptiveService')
    const recommended = skillLevelToDifficulty(user.skillLevel)

    return res.json({
      skillLevel: user.skillLevel,
      recommendedDifficulty: recommended,
    })
  } catch (err) {
    console.error('getSkillStats error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

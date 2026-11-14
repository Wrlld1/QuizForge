import { create } from 'zustand'
import api from '../services/api'
import { useAuthStore } from './authStore'

export type QuizMode = 'CLASSIC' | 'TIMED' | 'MARATHON' | 'DUEL'

export interface QuizQuestion {
  id: number
  text: string
  options: string[]
  difficulty: string
  codeSnippet?: string | null
  codeLanguage?: string | null
}

export interface AnswerResult {
  questionId: number
  answerIndex: number | null
  correct: boolean
  correctAnswer: number
  timeMs: number
}

export interface QuizResults {
  session: Record<string, unknown>
  xpEarned: number
  newAchievements: { key: string; name: string; description: string; icon: string }[]
}

interface QuizState {
  questions: QuizQuestion[]
  currentQuestion: QuizQuestion | null
  currentIndex: number
  totalQuestions: number
  score: number
  lives: number
  mode: QuizMode
  category: string
  difficulty: string
  answersHistory: AnswerResult[]
  isFinished: boolean
  isLoading: boolean
  results: QuizResults | null
  streak: number
  excludeIds: number[]
  timeTaken: number

  startQuiz: (category: string, mode: QuizMode, difficulty: string) => Promise<void>
  fetchNextQuestion: () => Promise<void>
  submitAnswer: (answerIndex: number | null, timeMs: number) => Promise<void>
  finishQuiz: () => Promise<void>
  reset: () => void
}

const initialState = {
  questions: [] as QuizQuestion[],
  currentQuestion: null as QuizQuestion | null,
  currentIndex: 0,
  totalQuestions: 10,
  score: 0,
  lives: 3,
  mode: 'CLASSIC' as QuizMode,
  category: '',
  difficulty: '',
  answersHistory: [] as AnswerResult[],
  isFinished: false,
  isLoading: false,
  results: null as QuizResults | null,
  streak: 0,
  excludeIds: [] as number[],
  timeTaken: 0,
}

export const useQuizStore = create<QuizState>((set, get) => ({
  ...initialState,

  startQuiz: async (category, mode, difficulty) => {
    set({
      ...initialState,
      mode,
      category,
      difficulty,
      lives: mode === 'MARATHON' ? 3 : Infinity,
      isLoading: true,
    })

    if (mode === 'MARATHON') {
      // Marathon: load one question at a time, play until lives run out
      set({ totalQuestions: 0 })
      await get().fetchNextQuestion()
    } else {
      // CLASSIC / TIMED / DUEL: load batch of 10
      try {
        const { data } = await api.post('/quiz/start-round', { category, difficulty })
        const questions: QuizQuestion[] = data.questions || []

        if (questions.length === 0) {
          set({ isFinished: true, isLoading: false })
          return
        }

        set({
          questions,
          totalQuestions: questions.length,
          currentQuestion: questions[0],
          currentIndex: 0,
          excludeIds: questions.map((q) => q.id),
          isLoading: false,
        })
      } catch {
        set({ isLoading: false })
      }
    }
  },

  fetchNextQuestion: async () => {
    const { mode, questions, currentIndex, category, excludeIds, difficulty } = get()

    if (mode === 'MARATHON') {
      // Marathon: fetch one at a time from server
      set({ isLoading: true })
      try {
        const { data } = await api.post('/quiz/next-question', {
          category,
          mode,
          excludeIds,
          difficulty,
        })

        if (data.finished || !data.question) {
          set({ isFinished: true, isLoading: false })
          await get().finishQuiz()
          return
        }

        set((s) => ({
          currentQuestion: data.question,
          currentIndex: s.currentIndex + (s.currentQuestion ? 1 : 0),
          totalQuestions: s.totalQuestions + 1,
          excludeIds: [...s.excludeIds, data.question.id],
          isLoading: false,
        }))
      } catch {
        set({ isLoading: false })
      }
    } else {
      // CLASSIC / TIMED: advance through pre-loaded batch
      const nextIdx = currentIndex + 1

      if (nextIdx >= questions.length) {
        set({ isFinished: true })
        await get().finishQuiz()
        return
      }

      set({
        currentQuestion: questions[nextIdx],
        currentIndex: nextIdx,
      })
    }
  },

  submitAnswer: async (answerIndex, timeMs) => {
    const { currentQuestion, mode, lives } = get()
    if (!currentQuestion) return

    set({ isLoading: true })
    try {
      const { data } = await api.post('/quiz/answer', {
        questionId: currentQuestion.id,
        answerIndex,
        difficulty: currentQuestion.difficulty,
      })

      const result: AnswerResult = {
        questionId: currentQuestion.id,
        answerIndex,
        correct: data.correct,
        correctAnswer: data.correctAnswer,
        timeMs,
      }

      const newStreak = data.correct ? get().streak + 1 : 0
      const newLives = !data.correct && mode === 'MARATHON' ? lives - 1 : lives
      const newScore = data.correct ? get().score + 1 : get().score

      set((s) => ({
        answersHistory: [...s.answersHistory, result],
        score: newScore,
        streak: newStreak,
        lives: newLives,
        timeTaken: s.timeTaken + timeMs,
        isLoading: false,
      }))

      if (mode === 'MARATHON' && newLives <= 0) {
        await get().finishQuiz()
      } else {
        await get().fetchNextQuestion()
      }
    } catch {
      set({ isLoading: false })
    }
  },

  finishQuiz: async () => {
    const { mode, category, difficulty, score, answersHistory, timeTaken, streak } = get()
    const correctCount = answersHistory.filter((a) => a.correct).length
    const total = answersHistory.length

    set({ isFinished: true, isLoading: true })
    try {
      const { data } = await api.post('/quiz/finish', {
        mode,
        category,
        difficulty,
        score,
        totalQuestions: total,
        correctCount,
        timeTaken,
        streak,
      })
      set({ results: data, isLoading: false })
      useAuthStore.getState().refreshUser()
    } catch {
      set({ isLoading: false })
    }
  },

  reset: () => set(initialState),
}))

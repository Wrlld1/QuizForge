import { useCallback, useRef, useEffect } from 'react'
import { useQuizStore, QuizMode } from '../stores/quizStore'
import { useTimer } from './useTimer'

const TIMED_SECONDS = 10

export function useQuiz() {
  const store = useQuizStore()
  const timerActionsRef = useRef<{ reset: (s?: number) => void; start: () => void }>({
    reset: () => {},
    start: () => {},
  })

  const handleExpire = useCallback(async () => {
    const s = useQuizStore.getState()
    if (s.mode === 'TIMED' && !s.isFinished && !s.isLoading && s.currentQuestion) {
      await s.submitAnswer(null, TIMED_SECONDS * 1000)
      if (!useQuizStore.getState().isFinished) {
        timerActionsRef.current.reset(TIMED_SECONDS)
        timerActionsRef.current.start()
      }
    }
  }, [])

  const timer = useTimer(TIMED_SECONDS, handleExpire)
  const { start, pause, reset: timerReset } = timer

  useEffect(() => {
    timerActionsRef.current = { reset: timerReset, start }
  }, [timerReset, start])

  const startQuiz = useCallback(async (category: string, mode: QuizMode, difficulty: string) => {
    await useQuizStore.getState().startQuiz(category, mode, difficulty)
    if (mode === 'TIMED') {
      timerReset(TIMED_SECONDS)
      start()
    }
  }, [timerReset, start])

  const submitAnswer = useCallback(async (answerIndex: number | null, timeMs: number) => {
    const s = useQuizStore.getState()
    if (s.mode === 'TIMED') {
      pause()
    }
    await s.submitAnswer(answerIndex, timeMs)
    if (s.mode === 'TIMED' && !useQuizStore.getState().isFinished) {
      timerReset(TIMED_SECONDS)
      start()
    }
  }, [pause, timerReset, start])

  const reset = useCallback(() => {
    timerReset()
    useQuizStore.getState().reset()
  }, [timerReset])

  return {
    ...store,
    timerSeconds: timer.timeLeft,
    timerRunning: timer.isRunning,
    startQuiz,
    submitAnswer,
    reset,
  }
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Timer, Heart, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import CodeBlock from '../components/CodeBlock'
import { useQuiz } from '../hooks/useQuiz'
import { useQuizStore, QuizMode } from '../stores/quizStore'
import { useRipple } from '../hooks/useRipple'

const labels = ['A', 'B', 'C', 'D']
const confettiColors = ['bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-blue-400']

const diffBadge: Record<string, { label: string; cls: string }> = {
  easy: { label: 'Лёгкий', cls: 'bg-green-500/20 text-green-400' },
  medium: { label: 'Средний', cls: 'bg-yellow-500/20 text-yellow-400' },
  hard: { label: 'Сложный', cls: 'bg-red-500/20 text-red-400' },
}

export default function Quiz() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { mode?: string; category?: string; difficulty?: string } | null
  const mode = (state?.mode || 'CLASSIC') as QuizMode
  const category = state?.category || 'javascript'
  const difficulty = state?.difficulty || 'medium'

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    lives,
    answersHistory,
    isFinished,
    isLoading,
    timerSeconds,
    startQuiz,
    submitAnswer,
  } = useQuiz()

  // Local UI state for answer animation
  const [selected, setSelected] = useState<number | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [displayQuestion, setDisplayQuestion] = useState<typeof currentQuestion>(null)
  const [animKey, setAnimKey] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [shakeWrong, setShakeWrong] = useState(false)
  const [started, setStarted] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [questionCount, setQuestionCount] = useState(0)
  const [slideOut, setSlideOut] = useState(false)
  const answerTimeRef = useRef(Date.now())
  const ripple = useRipple()

  // Start quiz on mount
  useEffect(() => {
    if (!started) {
      setStarted(true)
      startQuiz(category, mode, difficulty)
    }
  }, [started, startQuiz, category, mode, difficulty])

  // Track when new question appears to measure answer time
  const prevQuestionIdRef = useRef<number | null>(null)
  useEffect(() => {
    if (currentQuestion && currentQuestion.id !== prevQuestionIdRef.current) {
      prevQuestionIdRef.current = currentQuestion.id
      answerTimeRef.current = Date.now()
      setQuestionCount((c) => c + 1)
    }
  }, [currentQuestion])

  // Navigate to results when finished (after animation completes)
  const navigatedRef = useRef(false)
  const navigateToResult = useCallback(() => {
    if (navigatedRef.current) return
    navigatedRef.current = true
    const store = useQuizStore.getState()
    navigate('/quiz/result', {
      replace: true,
      state: {
        score: store.score,
        total: store.answersHistory.length,
        totalQuestions: store.answersHistory.length,
        mode,
        streak: bestStreak,
        category,
        difficulty,
        newAchievements: store.results?.newAchievements || [],
      },
    })
  }, [navigate, mode, bestStreak, category, difficulty])

  const handleAnswer = async (idx: number) => {
    if (selected !== null || !currentQuestion) return

    const timeMs = Date.now() - answerTimeRef.current
    setSelected(idx)

    // Save current question for display during animation
    const savedQuestion = { ...currentQuestion }
    setDisplayQuestion(savedQuestion)

    // Submit to store (this will call API, update state, and fetch next question)
    await submitAnswer(idx, timeMs)

    // Get result from store's answersHistory
    const history = useQuizStore.getState().answersHistory
    const lastResult = history[history.length - 1]

    if (lastResult) {
      setCorrectAnswer(lastResult.correctAnswer)
      setShowResult(true)

      if (lastResult.correct) {
        setStreak((prev) => {
          const newStreak = prev + 1
          setBestStreak((b) => Math.max(b, newStreak))
          return newStreak
        })
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 800)
      } else {
        setStreak(0)
        setShakeWrong(true)
        setTimeout(() => setShakeWrong(false), 400)
      }
    }

    // After animation delay, slide out then show next question
    setTimeout(() => {
      setSlideOut(true)
      setTimeout(() => {
        setShowResult(false)
        setDisplayQuestion(null)
        setSelected(null)
        setCorrectAnswer(null)
        setSlideOut(false)
        setAnimKey((k) => k + 1)

        if (useQuizStore.getState().isFinished) {
          navigateToResult()
        }
      }, 300)
    }, 1200)
  }

  // If quiz finishes without animation (e.g. timer expiry in TIMED mode)
  useEffect(() => {
    if (isFinished && !showResult && started && questionCount > 0) {
      navigateToResult()
    }
  }, [isFinished, showResult, started, questionCount, navigateToResult])

  const question = showResult ? displayQuestion : currentQuestion
  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0

  const optionClass = (idx: number) => {
    const base =
      'w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-3 border-2'
    if (!showResult) {
      return `${base} bg-neutral-900 border-transparent hover:border-purple-500 hover:bg-gray-750 cursor-pointer`
    }
    if (correctAnswer !== null && idx === correctAnswer) {
      return `${base} bg-green-600/20 border-green-500 text-green-300`
    }
    if (idx === selected && correctAnswer !== null && idx !== correctAnswer) {
      return `${base} bg-red-600/20 border-red-500 text-red-300 ${shakeWrong ? 'animate-shake' : ''}`
    }
    return `${base} bg-neutral-900 border-transparent opacity-50`
  }

  if (isLoading && !question) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="text-purple-500 animate-spin" />
      </div>
    )
  }

  if (!question && !isLoading && started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-400 text-lg">Нет доступных вопросов для этой категории.</p>
        <button
          onClick={() => navigate('/quiz/setup')}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-xl"
        >
          Назад
        </button>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6 relative">
        {/* Confetti particles */}
        {showConfetti && (
          <div className="absolute inset-x-0 top-1/2 flex justify-center pointer-events-none">
            {confettiColors.map((color, i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full ${color} animate-confetti absolute`}
                style={{
                  left: `${40 + i * 5}%`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Вопрос {currentIndex + 1}{mode !== 'MARATHON' ? `/${totalQuestions}` : ''}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-purple-400">Счёт: {score}</span>
            {streak > 1 && (
              <span className="text-sm font-semibold text-orange-400">Серия: {streak}</span>
            )}
            {mode === 'TIMED' && (
              <span className="flex items-center gap-1 text-sm text-orange-400">
                <Timer size={16} />
                {timerSeconds}s
              </span>
            )}
            {mode === 'MARATHON' && (
              <span className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    size={18}
                    className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                  />
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar (not shown in marathon) */}
        {mode !== 'MARATHON' && (
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Question */}
        {question && (
          <div key={animKey} className={slideOut ? 'animate-slideOutLeft' : 'animate-slideInRight'}>
            {/* Difficulty badge */}
            {question.difficulty && diffBadge[question.difficulty] && (
              <div className="flex justify-center mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${diffBadge[question.difficulty].cls}`}>
                  {diffBadge[question.difficulty].label}
                </span>
              </div>
            )}

            <h2 className="text-xl font-bold text-center py-4">{question.text}</h2>

            {/* Code snippet */}
            {question.codeSnippet && question.codeLanguage && (
              <div className="mb-5">
                <CodeBlock code={question.codeSnippet} language={question.codeLanguage} />
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { ripple(e); handleAnswer(idx) }}
                  disabled={showResult}
                  className={`${optionClass(idx)} ripple-container`}
                >
                  <span className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-sm font-bold shrink-0">
                    {labels[idx]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {showResult && correctAnswer !== null && idx === correctAnswer && (
                    <CheckCircle size={20} className="text-green-400" />
                  )}
                  {showResult && idx === selected && correctAnswer !== null && idx !== correctAnswer && (
                    <XCircle size={20} className="text-red-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

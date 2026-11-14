import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Home,
  RotateCcw,
} from 'lucide-react'
import { useToastStore } from '../stores/toastStore'
import PageTransition from '../components/PageTransition'
import Confetti from '../components/Confetti'

export default function QuizResult() {
  const addToast = useToastStore((s) => s.addToast)
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {
    score: number
    total: number
    totalQuestions: number
    mode: string
    newAchievements?: { key: string; name: string }[]
  } | null

  const score = state?.score ?? 0
  const total = state?.total ?? 0
  const percent = total > 0 ? Math.round((score / total) * 100) : 0

  const [displayScore, setDisplayScore] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Animated counter
  useEffect(() => {
    if (displayScore >= percent) return
    const timeout = setTimeout(
      () => setDisplayScore((d) => Math.min(d + 1, percent)),
      15
    )
    return () => clearTimeout(timeout)
  }, [displayScore, percent])

  // Level up for score > 80%
  useEffect(() => {
    if (percent >= 80) {
      const timeout = setTimeout(() => {
        setShowLevelUp(true)
      }, 1200)
      return () => clearTimeout(timeout)
    }
  }, [percent])

  // Achievement toasts
  useEffect(() => {
    if (state?.newAchievements) {
      state.newAchievements.forEach((a, i) => {
        setTimeout(() => {
          addToast('achievement', a.name)
        }, 2000 + i * 800)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Confetti for 70%+ score
  useEffect(() => {
    if (percent >= 70) {
      const t = setTimeout(() => setShowConfetti(true), 500)
      return () => clearTimeout(t)
    }
  }, [percent])

  // Game complete toast
  useEffect(() => {
    addToast('info', `Игра завершена! Счёт: ${score}/${total}`)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const xpEarned = score * 10

  return (
    <PageTransition>
    {showConfetti && <Confetti />}
    <div className="max-w-lg mx-auto text-center space-y-8 py-8">
      {/* Score circle */}
      <div className="relative inline-flex items-center justify-center w-40 h-40 rounded-full bg-neutral-900 border border-white/10 shadow-xl">
        <svg className="absolute inset-0 w-40 h-40 -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={percent >= 70 ? '#a855f7' : percent >= 40 ? '#eab308' : '#ef4444'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(displayScore / 100) * 440} 440`}
            className="transition-all duration-300"
          />
        </svg>
        <span className="text-4xl font-bold">{displayScore}%</span>
      </div>

      <h1 className="text-2xl font-bold">
        {percent >= 80 ? 'Отлично!' : percent >= 50 ? 'Хорошо!' : 'Продолжайте тренироваться!'}
      </h1>

      {/* Level up animation */}
      {showLevelUp && (
        <div className="animate-levelUp">
          <div className="bg-purple-600/20 border border-purple-500 rounded-xl p-4 flex items-center justify-center gap-3 animate-levelGlow">
            <span className="text-2xl">⭐</span>
            <TrendingUp size={24} className="text-purple-400" />
            <span className="font-bold text-purple-300">Новый уровень!</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400 shrink-0" />
          <div className="text-left">
            <p className="text-sm text-gray-400">Верно</p>
            <p className="font-bold">
              {score}/{total}
            </p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={20} className="text-red-400 shrink-0" />
          <div className="text-left">
            <p className="text-sm text-gray-400">Ошибки</p>
            <p className="font-bold">
              {total - score}/{total}
            </p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <Clock size={20} className="text-blue-400 shrink-0" />
          <div className="text-left">
            <p className="text-sm text-gray-400">Время</p>
            <p className="font-bold">--</p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <Star size={20} className="text-yellow-400 shrink-0" />
          <div className="text-left">
            <p className="text-sm text-gray-400">Получено XP</p>
            <p className="font-bold text-purple-400">+{xpEarned}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/quiz/setup', { replace: true })}
          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          Играть снова
        </button>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="flex-1 bg-neutral-800 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Главная
        </button>
      </div>
    </div>
    </PageTransition>
  )
}

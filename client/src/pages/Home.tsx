import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  Flame,
  Shuffle,
  Swords,
  Trophy,
  Target,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import PageTransition from '../components/PageTransition'
import { SkeletonCard } from '../components/Skeleton'
import DailyChallenges from '../components/DailyChallenges'

const modes = [
  {
    key: 'CLASSIC',
    label: 'Классика',
    desc: 'Отвечайте в своём темпе',
    icon: BookOpen,
    color: 'from-blue-600 to-blue-800',
  },
  {
    key: 'TIMED',
    label: 'На время',
    desc: 'Гонка со временем',
    icon: Clock,
    color: 'from-orange-600 to-orange-800',
  },
  {
    key: 'MARATHON',
    label: 'Марафон',
    desc: '3 жизни, бесконечные вопросы',
    icon: Flame,
    color: 'from-red-600 to-red-800',
  },
  {
    key: 'DUEL',
    label: 'Дуэль знаний',
    desc: 'Микс из 2 категорий',
    icon: Shuffle,
    color: 'from-emerald-600 to-teal-800',
  },
]

interface RecentResult {
  category: string
  score: number
  total: number
  correct: boolean
}

interface Stats {
  games: number
  avgScore: number
  bestStreak: number
}

function useParallax() {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.03)`
  }, [])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = ''
  }, [])

  return { handleMouseMove, handleMouseLeave }
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { handleMouseMove, handleMouseLeave } = useParallax()
  const [loading, setLoading] = useState(true)
  const [recentResults, setRecentResults] = useState<RecentResult[]>([])
  const [stats, setStats] = useState<Stats>({ games: 0, avgScore: 0, bestStreak: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, profileRes] = await Promise.allSettled([
          api.get(`/profile/${user?.id}/history?limit=5`),
          api.get(`/profile/${user?.id}`),
        ])

        if (historyRes.status === 'fulfilled' && historyRes.value.data.sessions) {
          const sessions = historyRes.value.data.sessions as {
            category: string
            mode: string
            isBattle: boolean
            score: number
            totalQuestions: number
            correctCount: number
          }[]
          setRecentResults(
            sessions.map((s) => ({
              category: s.mode === 'BATTLE_AI' ? 'Батл AI' : s.category,
              score: s.correctCount,
              total: s.totalQuestions,
              correct: s.correctCount / s.totalQuestions >= 0.5,
            }))
          )
        }

        if (profileRes.status === 'fulfilled') {
          const p = profileRes.value.data
          setStats({
            games: p.totalGames ?? 0,
            avgScore: p.avgScore ?? 0,
            bestStreak: p.bestStreak ?? 0,
          })
        }
      } catch {
        // Use empty defaults
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold">
            Привет, <span className="text-purple-400">{user?.username || 'Игрок'}</span>!
          </h1>
          <p className="text-gray-400 mt-1">Выберите режим и начните игру</p>
        </div>

        {/* Game modes */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => navigate('/quiz/setup', { state: { mode: mode.key } })}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`bg-gradient-to-br ${mode.color} rounded-xl p-5 text-left parallax-card hover:shadow-xl`}
              >
                <mode.icon size={28} className="mb-3" />
                <h3 className="text-lg font-bold">{mode.label}</h3>
                <p className="text-sm text-white/70 mt-1">{mode.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Daily challenges */}
        <DailyChallenges />

        {/* Battle card */}
        <button
          onClick={() => navigate('/battle')}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl p-6 flex items-center gap-5 parallax-card hover:shadow-xl hover:shadow-purple-900/30 text-left"
        >
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Swords size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              Батл
              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">DEMO</span>
            </h3>
            <p className="text-sm text-white/70 mt-0.5">Бросьте вызов AI-противнику</p>
          </div>
          <span className="bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">
            Найти соперника
          </span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent results */}
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-400" />
              Последние результаты
            </h2>
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 bg-neutral-800 rounded-lg px-4 py-3">
                    <div className="w-5 h-5 rounded-full bg-neutral-700 animate-pulse" />
                    <div className="flex-1 h-3 bg-neutral-700 rounded animate-pulse" />
                    <div className="w-10 h-3 bg-neutral-700 rounded animate-pulse" />
                  </div>
                ))
              ) : recentResults.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-3">Нет результатов</p>
              ) : (
                recentResults.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {r.correct ? (
                        <CheckCircle size={18} className="text-green-400" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                      <span className="text-sm">{r.category}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {r.score}/{r.total}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-purple-400" />
              Статистика
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-neutral-800 rounded-lg p-4 text-center">
                <Zap size={20} className="mx-auto text-yellow-400 mb-2" />
                <p className="text-2xl font-bold">{stats.games}</p>
                <p className="text-xs text-gray-400 mt-1">Игры</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4 text-center">
                <Target size={20} className="mx-auto text-green-400 mb-2" />
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
                <p className="text-xs text-gray-400 mt-1">Ср. балл</p>
              </div>
              <div className="bg-neutral-800 rounded-lg p-4 text-center">
                <Flame size={20} className="mx-auto text-orange-400 mb-2" />
                <p className="text-2xl font-bold">{stats.bestStreak}</p>
                <p className="text-xs text-gray-400 mt-1">Лучшая серия</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

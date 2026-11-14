import { useState, useEffect } from 'react'
import { CalendarCheck, Gift, CheckCircle, Target, Flame, Swords, Brain, Zap } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface DailyChallenge {
  id: number
  title: string
  description: string
  type: string
  target: number
  xpReward: number
  progress: number
  completed: boolean
  claimed: boolean
}

const typeIcons: Record<string, typeof Target> = {
  PLAY_GAMES: Target,
  SCORE_POINTS: Zap,
  CORRECT_ANSWERS: Brain,
  WIN_BATTLE: Swords,
  PLAY_CATEGORY: CalendarCheck,
  STREAK: Flame,
}

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<number | null>(null)

  useEffect(() => {
    api.get('/daily')
      .then((res) => setChallenges(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleClaim = async (id: number) => {
    setClaimingId(id)
    try {
      await api.post(`/daily/claim/${id}`)
      setChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, claimed: true } : c))
      )
      useAuthStore.getState().refreshUser()
    } catch {
      // ignore
    }
    setClaimingId(null)
  }

  if (loading) {
    return (
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck size={20} className="text-purple-400" />
          <h2 className="text-lg font-bold">Ежедневные задания</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-neutral-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (challenges.length === 0) return null

  const completedCount = challenges.filter((c) => c.completed).length

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarCheck size={20} className="text-purple-400" />
          <h2 className="text-lg font-bold">Ежедневные задания</h2>
        </div>
        <span className="text-sm text-gray-400">
          {completedCount}/{challenges.length}
        </span>
      </div>

      <div className="space-y-3">
        {challenges.map((ch) => {
          const Icon = typeIcons[ch.type] || Target
          const percent = Math.min((ch.progress / ch.target) * 100, 100)

          return (
            <div
              key={ch.id}
              className="flex items-center gap-3 bg-neutral-800 rounded-lg px-4 py-3"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                ch.completed ? 'bg-purple-600/20' : 'bg-neutral-700'
              }`}>
                <Icon size={18} className={ch.completed ? 'text-purple-400' : 'text-gray-500'} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{ch.title}</span>
                  <span className="text-xs text-purple-400 shrink-0 ml-2">+{ch.xpReward} XP</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ch.completed ? 'bg-purple-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-0.5">
                  {ch.progress}/{ch.target}
                </span>
              </div>

              <div className="shrink-0 ml-2">
                {ch.claimed ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : ch.completed ? (
                  <button
                    onClick={() => handleClaim(ch.id)}
                    disabled={claimingId === ch.id}
                    className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors animate-pulse"
                  >
                    <Gift size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

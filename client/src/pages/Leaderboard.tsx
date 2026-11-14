import { useState, useEffect } from 'react'
import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import PageTransition from '../components/PageTransition'
import { SkeletonList } from '../components/Skeleton'
import UserAvatar from '../components/UserAvatar'

interface LeaderboardEntry {
  position: number
  id: number
  username: string
  avatar?: string
  avatarIcon?: string
  avatarColor?: string
  avatarImage?: string | null
  rating: number
  level: number
  xp: number
  periodScore?: number
}

const tabs = [
  { key: 'all', label: 'Всё время' },
  { key: 'month', label: 'За месяц' },
  { key: 'week', label: 'За неделю' },
]

const demoData: LeaderboardEntry[] = [
  { position: 1, id: 1, username: 'ProCoder', rating: 2150, level: 25, xp: 4800 },
  { position: 2, id: 2, username: 'QuizMaster', rating: 1980, level: 22, xp: 3900 },
  { position: 3, id: 3, username: 'BrainStorm', rating: 1875, level: 20, xp: 3500 },
  { position: 4, id: 4, username: 'CodeNinja', rating: 1720, level: 18, xp: 3100 },
  { position: 5, id: 5, username: 'DevHero', rating: 1650, level: 16, xp: 2800 },
  { position: 6, id: 6, username: 'ByteRunner', rating: 1580, level: 15, xp: 2500 },
  { position: 7, id: 7, username: 'PixelWiz', rating: 1490, level: 14, xp: 2200 },
  { position: 8, id: 8, username: 'StackLord', rating: 1420, level: 13, xp: 1900 },
  { position: 9, id: 9, username: 'ReactFan', rating: 1350, level: 12, xp: 1700 },
  { position: 10, id: 10, username: 'NodeMaster', rating: 1280, level: 11, xp: 1500 },
]

export default function Leaderboard() {
  const { user } = useAuthStore()
  const [period, setPeriod] = useState('all')
  const [entries, setEntries] = useState<LeaderboardEntry[]>(demoData)
  const [myPosition, setMyPosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/leaderboard?period=${period}`)
        if (data.length > 0) setEntries(data)
      } catch {
        // Use demo data
      }
      setLoading(false)
    }

    const fetchPosition = async () => {
      try {
        const { data } = await api.get('/leaderboard/position')
        setMyPosition(data.position)
      } catch {}
    }

    fetchLeaderboard()
    fetchPosition()
  }, [period])

  const positionIcon = (pos: number) => {
    if (pos === 1) return <Crown size={20} className="text-yellow-400" />
    if (pos === 2) return <Medal size={20} className="text-gray-300" />
    if (pos === 3) return <Medal size={20} className="text-orange-400" />
    return <span className="text-sm text-gray-500 w-5 text-center">{pos}</span>
  }

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const getScore = (entry: LeaderboardEntry) =>
    period !== 'all' && entry.periodScore !== undefined ? entry.periodScore : entry.rating

  const scoreLabel = period === 'all' ? 'рейтинг' : 'очков'

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy size={24} className="text-purple-400" />
            Рейтинг
          </h1>
          {myPosition && (
            <span className="flex items-center gap-1.5 text-sm bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-lg">
              <TrendingUp size={14} />
              Ваша позиция: #{myPosition}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-900 border border-white/10 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                period === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonList count={8} />
        ) : (
          <>
            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-3">
              {top3[1] && (
                <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 text-center mt-6">
                  <Medal size={24} className="mx-auto text-gray-300 mb-2" />
                  <div className="flex justify-center mb-2">
                    <UserAvatar avatarImage={top3[1].avatarImage} avatarIcon={top3[1].avatarIcon} avatarColor={top3[1].avatarColor} size={48} />
                  </div>
                  <p className="font-bold text-sm truncate">{top3[1].username}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Lvl {top3[1].level}</p>
                  <p className="text-lg font-bold text-gray-300 mt-1">{getScore(top3[1])}</p>
                </div>
              )}
              {top3[0] && (
                <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 text-center border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/10">
                  <Crown size={28} className="mx-auto text-yellow-400 mb-2" />
                  <div className="flex justify-center mb-2">
                    <UserAvatar avatarImage={top3[0].avatarImage} avatarIcon={top3[0].avatarIcon} avatarColor={top3[0].avatarColor} size={56} />
                  </div>
                  <p className="font-bold truncate">{top3[0].username}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Lvl {top3[0].level}</p>
                  <p className="text-xl font-bold text-yellow-400 mt-1">{getScore(top3[0])}</p>
                </div>
              )}
              {top3[2] && (
                <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 text-center mt-6">
                  <Medal size={24} className="mx-auto text-orange-400 mb-2" />
                  <div className="flex justify-center mb-2">
                    <UserAvatar avatarImage={top3[2].avatarImage} avatarIcon={top3[2].avatarIcon} avatarColor={top3[2].avatarColor} size={48} />
                  </div>
                  <p className="font-bold text-sm truncate">{top3[2].username}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Lvl {top3[2].level}</p>
                  <p className="text-lg font-bold text-orange-400 mt-1">{getScore(top3[2])}</p>
                </div>
              )}
            </div>

            {/* Rest of the list */}
            <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
              {rest.map((entry) => {
                const isMe = user?.id === entry.id
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-5 py-3 border-b border-white/10/50 last:border-0 transition-colors ${
                      isMe ? 'bg-purple-600/10' : 'hover:bg-gray-750'
                    }`}
                  >
                    <div className="w-8 flex justify-center shrink-0">
                      {positionIcon(entry.position)}
                    </div>
                    <UserAvatar avatarImage={entry.avatarImage} avatarIcon={entry.avatarIcon} avatarColor={entry.avatarColor} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isMe ? 'text-purple-300' : ''}`}>
                        {entry.username}
                        {isMe && <span className="text-xs text-purple-400 ml-2">(вы)</span>}
                      </p>
                      <p className="text-xs text-gray-500">Lvl {entry.level}</p>
                    </div>
                    <span className="text-sm font-bold text-purple-400 shrink-0">
                      {getScore(entry)}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}

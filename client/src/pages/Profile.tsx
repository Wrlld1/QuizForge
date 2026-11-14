import { useState, useEffect } from 'react'
import {
  Star,
  Target,
  Award,
  Lock,
  Unlock,
  Edit,
  Calendar,
  Gamepad2,
  Trophy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import PageTransition from '../components/PageTransition'
import { SkeletonCard } from '../components/Skeleton'
import UserAvatar from '../components/UserAvatar'
import ProfileEditor from '../components/ProfileEditor'

interface ProfileData {
  id: number
  username: string
  avatar?: string
  avatarIcon: string
  avatarColor: string
  avatarImage?: string | null
  rating: number
  level: number
  xp: number
  xpToNext: number
  role: string
  createdAt: string
  totalGames: number
  totalWins: number
  winRate: number
  avgScore: number
  bestStreak: number
  favoriteCategory: string | null
}

interface AchievementData {
  id: number
  key: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt: string | null
}

interface GameSessionData {
  id: number
  mode: string
  category: string
  difficulty: string
  score: number
  totalQuestions: number
  correctCount: number
  timeTaken: number
  xpEarned: number
  isBattle: boolean
  isWin: boolean
  createdAt: string
}

export default function Profile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [achievements, setAchievements] = useState<AchievementData[]>([])
  const [history, setHistory] = useState<GameSessionData[]>([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyOffset, setHistoryOffset] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [skillLevel, setSkillLevel] = useState(0.5)
  const [recommendedDiff, setRecommendedDiff] = useState('medium')
  const [loading, setLoading] = useState(true)
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false)

  const historyLimit = 5
  const userId = user?.id || 1

  const fetchAll = async () => {
    try {
      const [profileRes, achRes, histRes, skillRes] = await Promise.allSettled([
        api.get(`/profile/${userId}`),
        api.get('/achievements'),
        api.get(`/profile/${userId}/history?limit=${historyLimit}&offset=${historyOffset}`),
        api.get('/quiz/skill-stats'),
      ])

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data)
      if (achRes.status === 'fulfilled') setAchievements(achRes.value.data)
      if (histRes.status === 'fulfilled') {
        setHistory(histRes.value.data.sessions)
        setHistoryTotal(histRes.value.data.total)
      }
      if (skillRes.status === 'fulfilled') {
        setSkillLevel(skillRes.value.data.skillLevel)
        setRecommendedDiff(skillRes.value.data.recommendedDifficulty)
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [userId, historyOffset])

  const handleSaveUsername = async () => {
    if (!editName.trim() || editName.trim().length < 3) return
    try {
      await api.put('/profile', { username: editName.trim() })
      setProfile((p) => p ? { ...p, username: editName.trim() } : p)
      useAuthStore.getState().refreshUser()
    } catch { /* ignore */ }
    setEditing(false)
  }

  const xpPercent = profile ? (profile.xpToNext > 0 ? Math.round((profile.xp / profile.xpToNext) * 100) : 0) : 0
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const formatDate = (d: string) => new Date(d).toLocaleDateString()

  if (loading || !profile) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonCard />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
          </div>
          <SkeletonCard />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile card */}
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
          <div className="flex items-start gap-5">
            {/* Avatar — clickable to edit */}
            <button
              onClick={() => setAvatarEditorOpen(true)}
              className="relative group shrink-0"
            >
              <UserAvatar
                avatarImage={profile.avatarImage}
                avatarIcon={profile.avatarIcon}
                avatarColor={profile.avatarColor}
                size={80}
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Edit size={20} className="text-white" />
              </div>
            </button>

            <div className="flex-1 min-w-0">
              {/* Username + edit */}
              <div className="flex items-center gap-2 mb-1">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-neutral-800 rounded-lg px-3 py-1 text-white outline-none border border-purple-500 text-lg"
                      autoFocus
                    />
                    <button onClick={handleSaveUsername} className="p-1 text-green-400 hover:text-green-300">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:text-red-400">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{profile.username}</h1>
                    <button
                      onClick={() => { setEditName(profile.username); setEditing(true) }}
                      className="p-1 text-gray-500 hover:text-purple-400 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Level + XP bar */}
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1 text-sm text-yellow-400 font-bold">
                  <Star size={14} className="fill-yellow-400" /> Lvl {profile.level}
                </span>
                <div className="flex-1 max-w-xs">
                  <div className="h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full animate-xpFill shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                      style={{ '--xp-from': '0%', '--xp-to': `${xpPercent}%`, width: `${xpPercent}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">{profile.xp}/{profile.xpToNext} XP</span>
              </div>

              {/* Rating + date */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Trophy size={14} className="text-purple-400" /> {profile.rating} rating
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> Дата регистрации: {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={<Gamepad2 size={18} className="text-blue-400" />} label="Игры" value={profile.totalGames} />
          <StatCard icon={<Trophy size={18} className="text-green-400" />} label="Победы" value={profile.totalWins} />
          <StatCard icon={<Target size={18} className="text-orange-400" />} label="% побед" value={`${profile.winRate}%`} />
          <StatCard icon={<Star size={18} className="text-yellow-400" />} label="Ср. балл" value={profile.avgScore} />
          <StatCard icon={<Gamepad2 size={18} className="text-purple-400" />} label="Любимая" value={profile.favoriteCategory || '—'} small />
        </div>

        {/* Skill Level */}
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Brain size={20} className="text-purple-400" />
            Адаптивная сложность
          </h2>
          <div className="space-y-3">
            <div className="relative h-4 rounded-full overflow-hidden flex">
              <div className="flex-1 bg-green-600/40" />
              <div className="flex-1 bg-yellow-600/40" />
              <div className="flex-1 bg-red-600/40" />
              <div
                className="absolute top-0 h-full w-1 bg-white rounded shadow-white/30 transition-all duration-500"
                style={{ left: `${skillLevel * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Лёгкий</span>
              <span>Средний</span>
              <span>Сложный</span>
            </div>
            <p className="text-sm text-gray-400">
              Уровень навыка: <span className="text-white font-semibold">{(skillLevel * 100).toFixed(0)}%</span>
              {' | '}
              Рекомендуемый: <span className={`font-semibold ${
                recommendedDiff === 'easy' ? 'text-green-400' : recommendedDiff === 'hard' ? 'text-red-400' : 'text-yellow-400'
              }`}>{recommendedDiff.charAt(0).toUpperCase() + recommendedDiff.slice(1)}</span>
            </p>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award size={20} className="text-purple-400" />
            Достижения
            <span className="text-sm font-normal text-gray-400 ml-auto">
              {unlockedCount}/{achievements.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`tooltip-container rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] cursor-default ${
                  a.unlocked
                    ? 'bg-neutral-800/50 border-purple-500/30 hover:border-purple-500/60'
                    : 'bg-neutral-900 border-white/10 opacity-50 hover:opacity-70'
                }`}
              >
                {/* Tooltip */}
                <div className="tooltip">
                  <p className="text-white font-semibold">{a.name}</p>
                  <p className="text-gray-400 mt-0.5">{a.description}</p>
                  <p className="text-purple-400 mt-1">+{a.xpReward} XP</p>
                  {a.unlocked && a.unlockedAt && (
                    <p className="text-gray-500 mt-1">Получено: {formatDate(a.unlockedAt)}</p>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      a.unlocked ? 'bg-purple-600/20' : 'bg-neutral-800'
                    }`}
                  >
                    {a.unlocked ? (
                      <Unlock size={18} className="text-purple-400" />
                    ) : (
                      <Lock size={18} className="text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm ${a.unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {a.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.description}</p>
                    <p className="text-xs text-purple-400 mt-1">+{a.xpReward} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game history */}
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Gamepad2 size={20} className="text-purple-400" />
            История игр
          </h2>

          <div className="space-y-2">
            {history.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 bg-neutral-800/40 rounded-lg px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        s.isBattle
                          ? 'bg-red-500/20 text-red-400'
                          : s.mode === 'MARATHON'
                            ? 'bg-orange-500/20 text-orange-400'
                            : s.mode === 'TIMED'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {s.isBattle ? 'БАТЛ AI' : s.mode}
                    </span>
                    <span className="text-sm text-gray-300">
                      {s.mode === 'BATTLE_AI' ? 'Батл AI' : s.category}
                    </span>
                    {s.isBattle && s.isWin && (
                      <span className="text-xs text-green-400 font-semibold">ПОБЕДА</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {s.correctCount}/{s.totalQuestions} верно | +{s.xpEarned} XP
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-purple-400">{s.score}</p>
                  <p className="text-xs text-gray-500">{formatDate(s.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {historyTotal > historyLimit && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setHistoryOffset(Math.max(0, historyOffset - historyLimit))}
                disabled={historyOffset === 0}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-400">
                {historyOffset + 1}-{Math.min(historyOffset + historyLimit, historyTotal)} of {historyTotal}
              </span>
              <button
                onClick={() => setHistoryOffset(historyOffset + historyLimit)}
                disabled={historyOffset + historyLimit >= historyTotal}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Avatar Editor Modal */}
        {avatarEditorOpen && (
          <ProfileEditor
            open={avatarEditorOpen}
            onClose={() => setAvatarEditorOpen(false)}
            onSaved={fetchAll}
            currentData={{
              avatarIcon: profile.avatarIcon,
              avatarColor: profile.avatarColor,
              avatarImage: profile.avatarImage,
            }}
          />
        )}
      </div>
    </PageTransition>
  )
}

function StatCard({
  icon,
  label,
  value,
  small,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  small?: boolean
}) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className={`font-bold ${small ? 'text-sm' : 'text-xl'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

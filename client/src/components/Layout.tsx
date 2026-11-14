import { useEffect, useRef, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { connectSocket, disconnectSocket } from '../services/socket'
import UserAvatar from './UserAvatar'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/quiz/setup', label: 'Quiz' },
  { to: '/battle', label: 'Battle' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/profile', label: 'Profile' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()

  const prevXpRef = useRef({ xp: user?.xp || 0, level: user?.level || 1 })
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [xpAnimating, setXpAnimating] = useState(false)

  useEffect(() => {
    if (token) {
      connectSocket(token)
    }
    return () => {
      disconnectSocket()
    }
  }, [token])

  // Detect XP/level changes for animations
  useEffect(() => {
    if (!user) return
    const prev = prevXpRef.current

    if (user.level > prev.level) {
      setShowLevelUp(true)
      setTimeout(() => setShowLevelUp(false), 4500)
    }

    if (user.xp !== prev.xp) {
      setXpAnimating(true)
      setTimeout(() => setXpAnimating(false), 1000)
    }

    prevXpRef.current = { xp: user.xp, level: user.level }
  }, [user?.xp, user?.level])

  const xpPercent = user && user.xpToNext > 0 ? Math.round((user.xp / user.xpToNext) * 100) : 0

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium uppercase tracking-wide transition-colors pb-2 ${
      isActive
        ? 'text-white border-b-2 border-white'
        : 'text-gray-400 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top navbar */}
      <header className="fixed top-8 left-0 right-0 z-50 h-16 px-8 flex items-center justify-between bg-transparent">
        {/* Left — logo */}
        <span className="text-lg font-bold text-white">QuizForge</span>

        {/* Center — nav links */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
          {(user?.role === 'admin' || user?.role === 'ADMIN') && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right — avatar + XP bar + logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="hover:opacity-80 transition-opacity"
          >
            <UserAvatar
              avatarImage={user?.avatarImage}
              avatarIcon={user?.avatarIcon}
              avatarColor={user?.avatarColor}
              size={28}
            />
          </button>

          {/* Level badge with glow on level-up */}
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            showLevelUp
              ? 'bg-purple-600 text-white animate-levelGlow'
              : 'bg-neutral-800 text-gray-400'
          }`}>
            Lvl {user?.level || 1}
          </span>

          {/* XP progress bar */}
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  xpAnimating ? 'duration-1000 bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'duration-300 bg-purple-600'
                }`}
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">
              {user?.xp || 0}/{user?.xpToNext || 100}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors text-gray-400 hover:text-red-400"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Level-up notification */}
      {showLevelUp && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[60] animate-levelUp">
          <div className="bg-purple-600/90 backdrop-blur-md border border-purple-400 rounded-xl px-6 py-3 flex items-center gap-3 shadow-2xl shadow-purple-900/50">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-sm font-bold text-white">Новый уровень!</p>
              <p className="text-xs text-purple-200">Уровень {user?.level}</p>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="pt-32 px-6 pb-6">
        <Outlet />
      </main>
    </div>
  )
}

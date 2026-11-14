import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Home,
  Minus,
  Star,
  Zap,
} from 'lucide-react'
import { useBattleStore } from '../stores/battleStore'
import BattleCard from '../components/BattleCard'
import Confetti from '../components/Confetti'

export default function BattleResult() {
  const navigate = useNavigate()
  const { player, opponent, roundResults, ratingChange, serverResult, reset } = useBattleStore()
  const [showConfetti, setShowConfetti] = useState(false)

  const pScore = player?.score || 0
  const oScore = opponent?.score || 0
  const isWin = pScore > oScore
  const isLose = pScore < oScore
  const isDraw = pScore === oScore

  useEffect(() => {
    if (isWin) {
      const t = setTimeout(() => setShowConfetti(true), 500)
      return () => clearTimeout(t)
    }
  }, [isWin])

  const handleRematch = () => {
    reset()
    navigate('/battle/lobby')
  }

  const handleHome = () => {
    reset()
    navigate('/')
  }

  return (
    <>
    {showConfetti && <Confetti />}
    <div className="max-w-2xl mx-auto space-y-8 py-4 animate-fadeInUp">
      {/* Result text */}
      <div className="text-center">
        {isWin && (
          <h1 className="text-4xl font-black text-green-400">Победа!</h1>
        )}
        {isLose && (
          <h1 className="text-4xl font-black text-red-400">Поражение</h1>
        )}
        {isDraw && (
          <h1 className="text-4xl font-black text-yellow-400">Ничья</h1>
        )}
      </div>

      {/* Players face-off */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <BattleCard
            player={player || { id: 0, username: 'Вы', level: 1, rating: 0, score: 0, ready: false, answers: [] }}
            highlight={isWin ? 'win' : isLose ? 'lose' : 'draw'}
            showScore
          />
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <Trophy
            size={32}
            className={
              isWin
                ? 'text-green-400'
                : isLose
                  ? 'text-red-400'
                  : 'text-yellow-400'
            }
          />
          <span className="text-xs text-gray-500">VS</span>
        </div>

        <div className="flex-1">
          <BattleCard
            player={opponent || { id: 0, username: '???', level: 1, rating: 0, score: 0, ready: false, answers: [] }}
            highlight={isLose ? 'win' : isWin ? 'lose' : 'draw'}
            showScore
          />
        </div>
      </div>

      {/* Rating change */}
      <div className="flex justify-center">
        <div
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-lg font-bold ${
            ratingChange > 0
              ? 'bg-green-500/10 text-green-400'
              : ratingChange < 0
                ? 'bg-red-500/10 text-red-400'
                : 'bg-neutral-800 text-gray-400'
          }`}
        >
          {ratingChange > 0 && <ArrowUp size={20} />}
          {ratingChange < 0 && <ArrowDown size={20} />}
          {ratingChange === 0 && <Minus size={20} />}
          <span>
            {ratingChange > 0 ? '+' : ''}
            {ratingChange} рейтинг
          </span>
        </div>
      </div>

      {/* XP & Achievements from server */}
      {serverResult && (
        <div className="space-y-3">
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-sm font-semibold">
              <Zap size={16} />
              +{serverResult.xpEarned} XP
            </div>
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold">
              <Star size={16} />
              Уровень {serverResult.newLevel}
            </div>
          </div>

          {serverResult.newAchievements.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-400 mb-2">Новые достижения!</p>
              {serverResult.newAchievements.map((a) => (
                <div key={a.key} className="flex items-center justify-between text-sm">
                  <span className="text-yellow-300">{a.name}</span>
                  <span className="text-yellow-500">+{a.xpReward} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rounds table */}
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Результаты по раундам</h3>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_1fr] gap-2 text-xs text-gray-500 px-2">
            <span>#</span>
            <span>Вы</span>
            <span className="text-right">{opponent?.username || 'Соперник'}</span>
          </div>

          {roundResults.map((r) => (
            <div
              key={r.round}
              className="grid grid-cols-[40px_1fr_1fr] gap-2 items-center bg-neutral-800/40 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-gray-400">{r.round}</span>
              <div className="flex items-center gap-2">
                {r.playerCorrect ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <XCircle size={16} className="text-red-400" />
                )}
                <span className="text-xs text-gray-400">+{r.playerPoints}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-gray-400">+{r.opponentPoints}</span>
                {r.opponentCorrect ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <XCircle size={16} className="text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleRematch}
          className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Реванш
        </button>
        <button
          onClick={handleHome}
          className="flex-1 bg-neutral-800 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Главная
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm">
        Demo батл vs AI · {serverResult ? 'Результат сохранён' : 'Сохранение...'}
      </p>
    </div>
    </>
  )
}

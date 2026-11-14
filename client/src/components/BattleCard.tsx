import { User, Star, Trophy } from 'lucide-react'
import type { BattlePlayer } from '../stores/battleStore'

interface BattleCardProps {
  player: BattlePlayer
  highlight?: 'win' | 'lose' | 'draw' | null
  showScore?: boolean
  size?: 'sm' | 'md'
}

export default function BattleCard({
  player,
  highlight = null,
  showScore = false,
  size = 'md',
}: BattleCardProps) {
  const borderColor =
    highlight === 'win'
      ? 'border-green-500 shadow-green-500/20'
      : highlight === 'lose'
        ? 'border-red-500 shadow-red-500/20'
        : highlight === 'draw'
          ? 'border-yellow-500 shadow-yellow-500/20'
          : 'border-white/10'

  const isSmall = size === 'sm'

  return (
    <div
      className={`bg-neutral-900 rounded-xl border-2 ${borderColor} shadow-lg transition-all duration-300 ${
        isSmall ? 'p-3' : 'p-5'
      }`}
    >
      <div className={`flex flex-col items-center ${isSmall ? 'gap-2' : 'gap-3'}`}>
        {/* Avatar */}
        <div
          className={`rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center ${
            isSmall ? 'w-10 h-10' : 'w-16 h-16'
          }`}
        >
          <User size={isSmall ? 20 : 32} className="text-white" />
        </div>

        {/* Username */}
        <p className={`font-bold ${isSmall ? 'text-sm' : 'text-lg'}`}>{player.username}</p>

        {/* Level & Rating */}
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-gray-400">
            <Star size={14} className="text-yellow-400" />
            Lvl {player.level}
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <Trophy size={14} className="text-orange-400" />
            {player.rating}
          </span>
        </div>

        {/* Score */}
        {showScore && (
          <p className={`font-bold text-orange-400 ${isSmall ? 'text-lg' : 'text-3xl'}`}>
            {player.score}
          </p>
        )}
      </div>
    </div>
  )
}

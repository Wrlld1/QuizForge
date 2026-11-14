import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Swords,
  Plus,
  Search,
  Copy,
  Check,
  Loader,
  Bot,
} from 'lucide-react'
import { useBattle } from '../hooks/useBattle'
import BattleCard from '../components/BattleCard'

export default function BattleLobby() {
  const navigate = useNavigate()
  const {
    phase,
    roomCode,
    opponent,
    player,
    createRoom,
    findMatch,
    setReady,
    reset,
  } = useBattle()

  // Reset on mount
  useEffect(() => {
    reset()
  }, [reset])

  // Navigate to play when countdown starts
  useEffect(() => {
    if (phase === 'countdown') {
      navigate('/battle/play')
    }
  }, [phase, navigate])

  const copyCode = () => {
    if (roomCode) navigator.clipboard.writeText(roomCode)
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 mb-4">
          <Swords size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold">Батл</h1>
        <p className="text-gray-400 mt-1">Бросьте вызов другому игроку</p>
      </div>

      {/* Demo banner */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3">
        <Bot size={24} className="text-purple-400 shrink-0" />
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-purple-300">Demo Mode</span> — в данный момент доступна игра с AI-противником.
        </p>
      </div>

      {/* Idle — show two options */}
      {phase === 'idle' && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={createRoom}
            className="bg-neutral-900 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 border-2 border-transparent hover:border-orange-500 transition-all duration-300 hover:scale-[1.03]"
          >
            <Plus size={28} className="text-orange-400" />
            <span className="font-semibold text-sm">Создать комнату</span>
          </button>
          <button
            onClick={findMatch}
            className="bg-neutral-900 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3 border-2 border-transparent hover:border-red-500 transition-all duration-300 hover:scale-[1.03]"
          >
            <Search size={28} className="text-red-400" />
            <span className="font-semibold text-sm">Найти соперника</span>
          </button>
        </div>
      )}

      {/* Creating — show room code */}
      {phase === 'creating' && (
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 text-center space-y-4">
          <p className="text-gray-400 text-sm">Код комнаты</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-mono font-bold tracking-widest text-orange-400">
              {roomCode}
            </span>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-gray-600 transition-colors"
              title="Copy"
            >
              <Copy size={18} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Loader size={16} className="animate-spin" />
            <span className="text-sm">Ожидание соперника...</span>
          </div>
        </div>
      )}

      {/* Searching — pulsing animation */}
      {phase === 'searching' && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-red-500/20 animate-ping absolute inset-0" />
            <div className="w-24 h-24 rounded-full bg-neutral-900 border border-white/10 border-2 border-red-500 flex items-center justify-center relative">
              <Swords size={36} className="text-red-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Loader size={16} className="animate-spin" />
            <span>Поиск соперника...</span>
          </div>
        </div>
      )}

      {/* Found — show opponent card + ready button */}
      {phase === 'found' && opponent && (
        <div className="space-y-6 animate-fadeInUp">
          <p className="text-center text-green-400 font-semibold">Соперник найден!</p>
          <BattleCard player={opponent} />

          <button
            onClick={setReady}
            disabled={player?.ready}
            className={`w-full font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              player?.ready
                ? 'bg-green-600 cursor-default'
                : 'bg-orange-600 hover:bg-orange-500'
            }`}
          >
            <Check size={20} />
            {player?.ready ? 'Ожидание соперника...' : 'Готов'}
          </button>
        </div>
      )}
    </div>
  )
}

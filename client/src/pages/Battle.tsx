import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Swords,
  Timer,
  Loader,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react'
import { useBattle } from '../hooks/useBattle'
import { useBattleStore } from '../stores/battleStore'
import CountdownOverlay from '../components/CountdownOverlay'
import CodeBlock from '../components/CodeBlock'

const labels = ['A', 'B', 'C', 'D']

export default function Battle() {
  const navigate = useNavigate()
  const {
    phase,
    player,
    opponent,
    questions,
    currentRound,
    totalRounds,
    timeLeft,
    selectedAnswer,
    waitingForOpponent,
    roundResults,
    submitAnswer,
  } = useBattle()
  const { nextRound, setTimeLeft, setPhase } = useBattleStore()

  const [showCountdown, setShowCountdown] = useState(true)
  const [showRoundResult, setShowRoundResult] = useState(false)

  const question = questions[currentRound]
  const progressPercent = ((currentRound + 1) / totalRounds) * 100

  // Handle countdown completion
  const handleCountdownDone = useCallback(() => {
    setShowCountdown(false)
    setPhase('playing')
  }, [setPhase])

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing' || showCountdown || !question) return
    if (selectedAnswer !== null || waitingForOpponent) return

    const id = setInterval(() => {
      const current = useBattleStore.getState().timeLeft
      if (current <= 1) {
        clearInterval(id)
        setTimeLeft(0)
        submitAnswer(-1, 20000)
      } else {
        setTimeLeft(current - 1)
      }
    }, 1000)

    return () => clearInterval(id)
  }, [phase, showCountdown, selectedAnswer, waitingForOpponent, setTimeLeft, submitAnswer, question])

  // Show round result then advance
  const roundResultHandledRef = useRef(-1)
  useEffect(() => {
    if (phase !== 'round-result') return
    if (roundResultHandledRef.current === currentRound) return
    roundResultHandledRef.current = currentRound
    setShowRoundResult(true)
    const t = setTimeout(() => {
      setShowRoundResult(false)
      nextRound()
    }, 2000)
    return () => clearTimeout(t)
  }, [phase, currentRound, nextRound])

  // Navigate to result on finish
  useEffect(() => {
    if (phase === 'finished') {
      navigate('/battle/result')
    }
  }, [phase, navigate])

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null || waitingForOpponent || !question) return
    submitAnswer(idx, 0)
  }

  const optionClass = (idx: number) => {
    const base =
      'w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-3 border-2'
    if (!question || selectedAnswer === null) {
      return `${base} bg-neutral-900 border border-white/10 border-transparent hover:border-orange-500 hover:bg-gray-750 cursor-pointer`
    }
    if (idx === question.correctIndex) {
      return `${base} bg-green-600/20 border-green-500 text-green-300`
    }
    if (idx === selectedAnswer && idx !== question.correctIndex) {
      return `${base} bg-red-600/20 border-red-500 text-red-300`
    }
    return `${base} bg-neutral-900 border border-white/10 border-transparent opacity-50`
  }

  const lastResult = roundResults[roundResults.length - 1]

  return (
    <div className="max-w-2xl mx-auto space-y-5 relative">
      {/* Countdown overlay */}
      {showCountdown && <CountdownOverlay onComplete={handleCountdownDone} />}

      {/* Top bar — players + round */}
      <div className="flex items-center justify-between bg-neutral-900 border border-white/10 rounded-xl p-4">
        {/* Player */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">{player?.username || 'Вы'}</p>
            <p className="text-lg font-bold text-orange-400">{player?.score || 0}</p>
          </div>
        </div>

        {/* Center — round info */}
        <div className="flex flex-col items-center">
          <Swords size={20} className="text-red-400 mb-1" />
          <span className="text-xs text-gray-400">
            Раунд {currentRound + 1}/{totalRounds}
          </span>
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold flex items-center justify-end gap-1.5">
              {opponent?.username || '???'}
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded">AI</span>
            </p>
            <p className="text-lg font-bold text-red-400">{opponent?.score || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <User size={20} />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Timer */}
      <div className="flex justify-center">
        <span
          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${
            timeLeft <= 5 ? 'text-red-400 bg-red-500/10' : 'text-orange-400 bg-orange-500/10'
          }`}
        >
          <Timer size={14} />
          {timeLeft}s
        </span>
      </div>

      {/* Round result overlay */}
      {showRoundResult && lastResult && (
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-5 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lastResult.playerCorrect ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <XCircle size={20} className="text-red-400" />
              )}
              <span className="text-sm">Вы: +{lastResult.playerPoints}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {opponent?.username}: +{lastResult.opponentPoints}
              </span>
              {lastResult.opponentCorrect ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <XCircle size={20} className="text-red-400" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question + options (hide during round result) */}
      {!showRoundResult && question && (
        <div key={currentRound} className="animate-fadeInUp">
          <h2 className="text-xl font-bold text-center py-4">{question.text}</h2>

          {question.codeSnippet && question.codeLanguage && (
            <div className="mb-4">
              <CodeBlock code={question.codeSnippet} language={question.codeLanguage} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
                className={optionClass(idx)}
              >
                <span className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-sm font-bold shrink-0">
                  {labels[idx]}
                </span>
                <span className="flex-1">{opt}</span>
                {selectedAnswer !== null && idx === question.correctIndex && (
                  <CheckCircle size={20} className="text-green-400" />
                )}
                {selectedAnswer !== null &&
                  idx === selectedAnswer &&
                  idx !== question.correctIndex && (
                    <XCircle size={20} className="text-red-400" />
                  )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Waiting overlay */}
      {waitingForOpponent && (
        <div className="flex items-center justify-center gap-2 text-gray-400 py-4">
          <Loader size={18} className="animate-spin" />
          <span className="text-sm">Ожидание соперника...</span>
        </div>
      )}
    </div>
  )
}

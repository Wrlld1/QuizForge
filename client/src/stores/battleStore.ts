import { create } from 'zustand'
import api from '../services/api'
import { useAuthStore } from './authStore'

export interface BattlePlayer {
  id: number | string
  username: string
  level: number
  rating: number
  avatar?: string
  score: number
  ready: boolean
  answers: (number | null)[]
}

export interface BattleQuestion {
  id: number
  text: string
  options: string[]
  correctIndex: number
  codeSnippet?: string | null
  codeLanguage?: string | null
}

export type BattlePhase =
  | 'idle'
  | 'creating'
  | 'searching'
  | 'found'
  | 'countdown'
  | 'playing'
  | 'round-result'
  | 'finished'

export interface RoundResult {
  round: number
  playerCorrect: boolean
  opponentCorrect: boolean
  playerTime: number
  opponentTime: number
  playerPoints: number
  opponentPoints: number
}

export interface BattleServerResult {
  xpEarned: number
  ratingChange: number
  newRating: number
  newLevel: number
  newXp: number
  newXpToNext: number
  newAchievements: { key: string; name: string; xpReward: number }[]
}

interface BattleState {
  phase: BattlePhase
  roomCode: string | null
  isDemo: boolean
  player: BattlePlayer | null
  opponent: BattlePlayer | null
  questions: BattleQuestion[]
  currentRound: number
  totalRounds: number
  timeLeft: number
  roundResults: RoundResult[]
  ratingChange: number
  selectedAnswer: number | null
  waitingForOpponent: boolean
  serverResult: BattleServerResult | null

  createRoom: () => void
  searchOpponent: () => void
  setReady: () => void
  submitAnswer: (index: number) => void
  startCountdown: () => void
  nextRound: () => void
  reset: () => void
  setPhase: (phase: BattlePhase) => void
  setTimeLeft: (t: number) => void
  setSelectedAnswer: (a: number | null) => void
  setWaitingForOpponent: (w: boolean) => void
}

const sampleQuestions: BattleQuestion[] = [
  {
    id: 1,
    text: 'What does CSS stand for?',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets'],
    correctIndex: 1,
  },
  {
    id: 2,
    text: 'Which HTML tag is used for the largest heading?',
    options: ['<heading>', '<h6>', '<head>', '<h1>'],
    correctIndex: 3,
  },
  {
    id: 3,
    text: 'What is the correct way to declare a variable in JavaScript?',
    options: ['variable x', 'v x', 'let x', 'declare x'],
    correctIndex: 2,
  },
  {
    id: 4,
    text: 'Which method converts JSON string to a JavaScript object?',
    options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toObject()', 'JSON.convert()'],
    correctIndex: 0,
  },
  {
    id: 5,
    text: 'What does the === operator check in JavaScript?',
    options: ['Value only', 'Type only', 'Value and type', 'Reference'],
    correctIndex: 2,
  },
  {
    id: 6,
    text: 'Which React hook handles side effects?',
    options: ['useState', 'useEffect', 'useMemo', 'useRef'],
    correctIndex: 1,
  },
  {
    id: 7,
    text: 'What is the default port for a Node.js Express server?',
    options: ['8080', '3000', '5000', '443'],
    correctIndex: 1,
  },
  {
    id: 8,
    text: 'Which SQL command is used to retrieve data?',
    options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
    correctIndex: 2,
  },
  {
    id: 9,
    text: 'What does REST stand for?',
    options: [
      'Representational State Transfer',
      'Remote Execution Service Technology',
      'Rapid Endpoint Service Tool',
      'Resource State Tracker',
    ],
    correctIndex: 0,
  },
  {
    id: 10,
    text: 'Which HTTP status code means "Not Found"?',
    options: ['200', '301', '404', '500'],
    correctIndex: 2,
  },
]

const fakeOpponent: BattlePlayer = {
  id: 'opp-1',
  username: 'DarkCoder',
  level: 8,
  rating: 1450,
  score: 0,
  ready: false,
  answers: [],
}

export const useBattleStore = create<BattleState>((set, get) => ({
  phase: 'idle',
  roomCode: null,
  isDemo: true,
  player: null,
  opponent: null,
  questions: sampleQuestions,
  currentRound: 0,
  totalRounds: 10,
  timeLeft: 20,
  roundResults: [],
  ratingChange: 0,
  selectedAnswer: null,
  waitingForOpponent: false,
  serverResult: null,

  createRoom: () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    set({
      phase: 'creating',
      roomCode: code,
      player: {
        id: 'self',
        username: 'You',
        level: 5,
        rating: 1200,
        score: 0,
        ready: false,
        answers: [],
      },
    })
    // Simulate opponent joining after 3s
    setTimeout(() => {
      set({ opponent: { ...fakeOpponent, ready: false }, phase: 'found' })
    }, 3000)
  },

  searchOpponent: () => {
    set({
      phase: 'searching',
      player: {
        id: 'self',
        username: 'You',
        level: 5,
        rating: 1200,
        score: 0,
        ready: false,
        answers: [],
      },
    })
    // Simulate finding opponent after 2-4s
    setTimeout(() => {
      set({ opponent: { ...fakeOpponent, ready: false }, phase: 'found' })
    }, 2500)
  },

  setReady: () => {
    const { player } = get()
    if (!player) return
    set({ player: { ...player, ready: true } })
    // Simulate opponent ready after 1s
    setTimeout(() => {
      const { opponent } = get()
      if (opponent) {
        set({ opponent: { ...opponent, ready: true } })
      }
      // Start countdown
      get().startCountdown()
    }, 1000)
  },

  startCountdown: async () => {
    set({ phase: 'countdown' })

    // Load questions from server for demo mode
    if (get().isDemo) {
      try {
        const { data } = await api.post('/quiz/start-round', { category: 'javascript', difficulty: 'medium' })
        const loaded: BattleQuestion[] = (data.questions || []).map((q: any) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctIndex: -1,
          codeSnippet: q.codeSnippet || null,
          codeLanguage: q.codeLanguage || null,
        }))
        if (loaded.length > 0) {
          set({ questions: loaded, totalRounds: loaded.length })
        }
      } catch {
        // fallback to sampleQuestions
      }
    }

    setTimeout(() => {
      set({ phase: 'playing', currentRound: 0, timeLeft: 20 })
    }, 4000) // 3-2-1-GO
  },

  submitAnswer: async (index: number) => {
    const { currentRound, questions, player, opponent, isDemo } = get()
    if (!player || !opponent) return

    const q = questions[currentRound]
    if (!q) return

    let isCorrect: boolean
    let correctIdx = q.correctIndex
    if (isDemo && q.correctIndex === -1) {
      // Check answer via server API
      try {
        const { data } = await api.post('/quiz/answer', {
          questionId: q.id,
          answerIndex: index,
          difficulty: 'medium',
        })
        isCorrect = data.correct
        correctIdx = data.correctAnswer
      } catch {
        isCorrect = false
      }
    } else {
      isCorrect = index === q.correctIndex
    }

    const points = isCorrect ? 100 : 0

    // Update question's correctIndex so the UI can highlight correct/incorrect
    const updatedQuestions = [...questions]
    updatedQuestions[currentRound] = { ...q, correctIndex: correctIdx }

    set({
      questions: updatedQuestions,
      selectedAnswer: index,
      waitingForOpponent: true,
      player: { ...player, score: player.score + points },
    })

    // Simulate opponent answering after 1-2s
    setTimeout(() => {
      const currentState = get()
      const oppCorrect = Math.random() > 0.4
      const oppPoints = oppCorrect ? 100 : 0
      const result: RoundResult = {
        round: currentRound + 1,
        playerCorrect: isCorrect,
        opponentCorrect: oppCorrect,
        playerTime: 3.2,
        opponentTime: 4.1,
        playerPoints: points,
        opponentPoints: oppPoints,
      }

      set({
        waitingForOpponent: false,
        opponent: { ...currentState.opponent!, score: currentState.opponent!.score + oppPoints },
        roundResults: [...currentState.roundResults, result],
        phase: 'round-result',
      })
    }, 1500)
  },

  nextRound: () => {
    const { currentRound, totalRounds, questions, player, opponent, roundResults } = get()
    if (currentRound + 1 >= totalRounds || currentRound + 1 >= questions.length) {
      const pScore = player?.score || 0
      const oScore = opponent?.score || 0
      const correctAnswers = roundResults.filter((r) => r.playerCorrect).length
      const totalQuestions = roundResults.length

      // Save to server
      api
        .post('/quiz/battle-result', {
          score: pScore,
          correctAnswers,
          totalQuestions,
          timeSpent: 0,
          opponentScore: oScore,
        })
        .then((res) => {
          set({
            ratingChange: res.data.ratingChange,
            serverResult: {
              xpEarned: res.data.xpEarned,
              ratingChange: res.data.ratingChange,
              newRating: res.data.newRating,
              newLevel: res.data.newLevel,
              newXp: res.data.newXp,
              newXpToNext: res.data.newXpToNext,
              newAchievements: res.data.newAchievements,
            },
          })
          useAuthStore.getState().refreshUser()
        })
        .catch((err) => {
          console.error('Failed to save battle result:', err)
        })

      // Set finished immediately with estimated rating change
      const estimatedChange = pScore > oScore ? 15 : pScore < oScore ? -10 : 5
      set({ phase: 'finished', ratingChange: estimatedChange })
      return
    }
    set({
      phase: 'playing',
      currentRound: currentRound + 1,
      timeLeft: 20,
      selectedAnswer: null,
      waitingForOpponent: false,
    })
  },

  reset: () => {
    set({
      phase: 'idle',
      roomCode: null,
      isDemo: true,
      player: null,
      opponent: null,
      currentRound: 0,
      timeLeft: 20,
      roundResults: [],
      ratingChange: 0,
      selectedAnswer: null,
      waitingForOpponent: false,
      serverResult: null,
    })
  },

  setPhase: (phase) => set({ phase }),
  setTimeLeft: (t) => set({ timeLeft: t }),
  setSelectedAnswer: (a) => set({ selectedAnswer: a }),
  setWaitingForOpponent: (w) => set({ waitingForOpponent: w }),
}))

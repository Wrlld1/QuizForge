import { useEffect, useCallback } from 'react'
import { useBattleStore } from '../stores/battleStore'
import { getSocket } from '../services/socket'

export function useBattle() {
  const store = useBattleStore()

  const createRoom = useCallback(() => {
    useBattleStore.getState().createRoom()
  }, [])

  const joinRoom = useCallback((roomId: string) => {
    const socket = getSocket()
    if (socket) {
      socket.emit('battle:join', { roomId })
    }
  }, [])

  const findMatch = useCallback(() => {
    useBattleStore.getState().searchOpponent()
  }, [])

  const setReady = useCallback(() => {
    useBattleStore.getState().setReady()
  }, [])

  const submitAnswer = useCallback((answerIndex: number, _timeMs: number) => {
    const state = useBattleStore.getState()
    if (!state.isDemo) {
      // Real multiplayer — server handles opponent logic
      const socket = getSocket()
      if (socket?.connected && state.roomCode) {
        socket.emit('battle:answer', { roomId: state.roomCode, answerIndex })
      }
    } else {
      // Demo mode — simulate opponent locally
      state.submitAnswer(answerIndex)
    }
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onMatched = (data: { roomId: string; players: { id: string; username: string; rating: number }[] }) => {
      useBattleStore.setState({
        roomCode: data.roomId,
        isDemo: false,
        phase: 'found',
        opponent: data.players[1]
          ? {
              id: data.players[1].id,
              username: data.players[1].username,
              level: 0,
              rating: data.players[1].rating,
              score: 0,
              ready: false,
              answers: [],
            }
          : null,
      })
    }

    const onQuestion = (data: { round: number; totalRounds: number; question: { id: number; text: string; options: string[] } }) => {
      useBattleStore.setState({
        phase: 'playing',
        currentRound: data.round - 1,
        totalRounds: data.totalRounds,
        timeLeft: 20,
        selectedAnswer: null,
        waitingForOpponent: false,
      })
      const questions = useBattleStore.getState().questions
      if (!questions.find((q) => q.id === data.question.id)) {
        useBattleStore.setState({
          questions: [...questions, { ...data.question, correctIndex: -1 }],
        })
      }
    }

    const onRoundResult = (data: { players: { id: string; username: string; score: number }[] }) => {
      const state = useBattleStore.getState()
      const opponent = state.opponent
      if (opponent && data.players[1]) {
        useBattleStore.setState({
          phase: 'round-result',
          opponent: { ...opponent, score: data.players[1].score },
        })
      }
    }

    const onFinished = (data: { players: { id: string; username: string; score: number }[]; winnerId: number | null; isDraw: boolean }) => {
      const state = useBattleStore.getState()
      const pScore = data.players[0]?.score ?? state.player?.score ?? 0
      const oScore = data.players[1]?.score ?? state.opponent?.score ?? 0
      const change = pScore > oScore ? 32 : pScore < oScore ? -28 : 0
      useBattleStore.setState({ phase: 'finished', ratingChange: change })
    }

    const onOpponentDisconnected = () => {
      useBattleStore.setState({ phase: 'finished' })
    }

    socket.on('battle:found', onMatched)
    socket.on('battle:question', onQuestion)
    socket.on('battle:round-result', onRoundResult)
    socket.on('battle:finished', onFinished)
    socket.on('battle:opponent-disconnected', onOpponentDisconnected)

    return () => {
      socket.off('battle:found', onMatched)
      socket.off('battle:question', onQuestion)
      socket.off('battle:round-result', onRoundResult)
      socket.off('battle:finished', onFinished)
      socket.off('battle:opponent-disconnected', onOpponentDisconnected)
    }
  }, [])

  return {
    ...store,
    createRoom,
    joinRoom,
    findMatch,
    setReady,
    submitAnswer,
  }
}

import { Server, Socket } from 'socket.io'
import {
  addToQueue,
  removeFromQueue,
  getRoom,
  getRoomBySocket,
  loadQuestions,
  submitBattleAnswer,
  advanceRound,
  finishBattle,
  cleanupDisconnect,
  BattlePlayer,
} from './battleManager'

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id)

    // Join matchmaking queue
    socket.on('battle:search', async (data: { userId: number; username: string; rating: number }) => {
      const player: BattlePlayer = {
        id: data.userId,
        socketId: socket.id,
        username: data.username,
        rating: data.rating,
        score: 0,
        answers: [],
      }

      const room = addToQueue(player)
      if (room) {
        // Match found — both players join socket room
        for (const p of room.players) {
          const playerSocket = io.sockets.sockets.get(p.socketId)
          if (playerSocket) {
            playerSocket.join(room.id)
          }
        }

        // Load questions
        await loadQuestions(room)
        room.status = 'countdown'

        io.to(room.id).emit('battle:found', {
          roomId: room.id,
          players: room.players.map((p) => ({
            id: p.id,
            username: p.username,
            rating: p.rating,
          })),
        })

        // Start countdown, then begin
        setTimeout(() => {
          room.status = 'playing'
          const q = room.questions[0]
          const shuffled = room.shuffledData[0]

          io.to(room.id).emit('battle:question', {
            round: 1,
            totalRounds: room.totalRounds,
            question: { id: q.id, text: q.text, options: shuffled.options, codeSnippet: q.codeSnippet || null, codeLanguage: q.codeLanguage || null },
          })
        }, 4000) // 3-2-1-GO = ~4s
      } else {
        socket.emit('battle:searching')
      }
    })

    // Cancel search
    socket.on('battle:cancel', () => {
      removeFromQueue(socket.id)
      socket.emit('battle:cancelled')
    })

    // Submit answer in battle
    socket.on('battle:answer', async (data: { roomId: string; answerIndex: number }) => {
      const result = submitBattleAnswer(data.roomId, socket.id, data.answerIndex)
      if (!result) return

      socket.emit('battle:answer-result', {
        correct: result.correct,
        correctAnswer: result.correctAnswer,
      })

      if (result.bothAnswered) {
        const room = getRoom(data.roomId)
        if (!room) return

        const isFinished = advanceRound(data.roomId)

        // Send round result to both
        io.to(data.roomId).emit('battle:round-result', {
          players: room.players.map((p) => ({ id: p.id, username: p.username, score: p.score })),
        })

        if (isFinished) {
          const finalResult = await finishBattle(data.roomId)
          if (finalResult) {
            io.to(data.roomId).emit('battle:finished', finalResult)
          }
        } else {
          // Next question after a brief delay
          setTimeout(() => {
            const q = room.questions[room.currentRound]
            if (!q) return
            const shuffled = room.shuffledData[room.currentRound]

            io.to(data.roomId).emit('battle:question', {
              round: room.currentRound + 1,
              totalRounds: room.totalRounds,
              question: { id: q.id, text: q.text, options: shuffled.options, codeSnippet: q.codeSnippet || null, codeLanguage: q.codeLanguage || null },
            })
          }, 2000)
        }
      }
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      const room = cleanupDisconnect(socket.id)
      if (room) {
        io.to(room.id).emit('battle:opponent-disconnected')
      }
    })
  })
}

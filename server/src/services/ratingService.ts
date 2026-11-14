import prisma from '../prismaClient'

const K_FACTOR = 32

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

export function calculateElo(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
  const expectedWin = expectedScore(winnerRating, loserRating)
  const expectedLose = expectedScore(loserRating, winnerRating)

  const newWinnerRating = Math.round(winnerRating + K_FACTOR * (1 - expectedWin))
  const newLoserRating = Math.round(loserRating + K_FACTOR * (0 - expectedLose))

  return {
    newWinnerRating: Math.max(0, newWinnerRating),
    newLoserRating: Math.max(0, newLoserRating),
  }
}

export async function updateRatings(winnerId: number, loserId: number) {
  const [winner, loser] = await Promise.all([
    prisma.user.findUnique({ where: { id: winnerId }, select: { rating: true } }),
    prisma.user.findUnique({ where: { id: loserId }, select: { rating: true } }),
  ])

  if (!winner || !loser) return null

  const { newWinnerRating, newLoserRating } = calculateElo(winner.rating, loser.rating)

  await Promise.all([
    prisma.user.update({ where: { id: winnerId }, data: { rating: newWinnerRating } }),
    prisma.user.update({ where: { id: loserId }, data: { rating: newLoserRating } }),
  ])

  return { newWinnerRating, newLoserRating }
}

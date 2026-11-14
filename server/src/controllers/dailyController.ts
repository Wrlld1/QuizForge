import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { getDailyChallenges, claimReward } from '../services/dailyService'

export async function getChallenges(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const challenges = await getDailyChallenges(userId)
    return res.json(challenges)
  } catch (err) {
    console.error('getChallenges error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export async function claim(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const challengeId = parseInt(req.params.id, 10)

    if (isNaN(challengeId)) {
      return res.status(400).json({ message: 'Invalid challenge ID' })
    }

    const result = await claimReward(userId, challengeId)
    if (!result) {
      return res.status(400).json({ message: 'Cannot claim this reward' })
    }

    return res.json(result)
  } catch (err) {
    console.error('claim error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

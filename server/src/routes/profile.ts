import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getProfile,
  updateProfile,
  getGameHistory,
  uploadAvatarImage,
  deleteAvatarImage,
  getTitles,
  updateTitle,
} from '../controllers/profileController'
import { uploadAvatar } from '../middleware/upload'

const router = Router()

router.get('/titles', authMiddleware, getTitles)
router.put('/title', authMiddleware, updateTitle)
router.post('/avatar', authMiddleware, uploadAvatar, uploadAvatarImage)
router.delete('/avatar', authMiddleware, deleteAvatarImage)
router.get('/:id', authMiddleware, getProfile)
router.put('/', authMiddleware, updateProfile)
router.get('/:id/history', authMiddleware, getGameHistory)

export default router

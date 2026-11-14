import { create } from 'zustand'
import api from '../services/api'

interface User {
  id: number
  username: string
  email: string
  role: 'player' | 'admin' | 'USER' | 'ADMIN'
  level: number
  xp: number
  xpToNext: number
  rating: number
  avatar?: string
  avatarIcon: string
  avatarColor: string
  avatarImage?: string | null
  bannerColor: string
  bio?: string | null
  title: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed'
      set({ error: message, isLoading: false })
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { username, email, password })
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration failed'
      set({ error: message, isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ user: null, token: null })
      return
    }
    set({ isLoading: true })
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, token, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isLoading: false })
    }
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user })
    } catch {
      // ignore
    }
  },

  clearError: () => set({ error: null }),
}))

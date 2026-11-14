import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'achievement'

export interface Toast {
  id: string
  type: ToastType
  message: string
  icon?: string
}

interface ToastState {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, icon?: string) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (type, message, icon) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    set((s) => ({ toasts: [...s.toasts, { id, type, message, icon }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, type === 'achievement' ? 5000 : 3000)
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

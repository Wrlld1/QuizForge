import { CheckCircle, XCircle, Info, X, Award } from 'lucide-react'
import { useToastStore } from '../stores/toastStore'
import type { ToastType } from '../stores/toastStore'

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  achievement: Award,
}

const colors: Record<ToastType, string> = {
  success: 'border-green-500 bg-green-500/10 text-green-300',
  error: 'border-red-500 bg-red-500/10 text-red-300',
  info: 'border-blue-500 bg-blue-500/10 text-blue-300',
  achievement: 'border-yellow-500 bg-yellow-500/10 text-yellow-300',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-slideIn ${colors[toast.type]}`}
          >
            {toast.type === 'achievement' ? (
              <div className="animate-achievementBounce">
                <Icon size={22} className="shrink-0 text-yellow-400" />
              </div>
            ) : (
              <Icon size={18} className="shrink-0" />
            )}
            <div className="flex flex-col">
              {toast.type === 'achievement' && (
                <span className="text-xs text-yellow-400/70 font-semibold uppercase tracking-wider">Достижение</span>
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-0.5 rounded hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

import { Minus, Square, X } from 'lucide-react'

declare global {
  interface Window {
    electronAPI?: {
      windowMinimize: () => void
      windowMaximize: () => void
      windowClose: () => void
    }
  }
}

export default function TitleBar() {
  const api = window.electronAPI

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] h-8 bg-black flex items-center justify-between select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left — app name */}
      <span className="text-[11px] text-gray-500 font-medium pl-3 tracking-wide">
        QuizForge
      </span>

      {/* Right — window controls */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => api?.windowMinimize()}
          className="h-full w-11 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => api?.windowMaximize()}
          className="h-full w-11 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors"
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => api?.windowClose()}
          className="h-full w-11 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Globe,
  Palette,
  Braces,
  Atom,
  Server,
  Database,
  Star,
  Stars,
  Zap,
  Play,
  BookOpen,
  Clock,
  Flame,
  Shuffle,
} from 'lucide-react'

const modes = [
  { id: 'CLASSIC', label: 'Классика', desc: 'Отвечайте в своём темпе', icon: BookOpen, color: 'from-blue-600 to-blue-800', border: 'border-blue-500' },
  { id: 'TIMED', label: 'На время', desc: 'Гонка со временем', icon: Clock, color: 'from-orange-600 to-orange-800', border: 'border-orange-500' },
  { id: 'MARATHON', label: 'Марафон', desc: '3 жизни, бесконечные вопросы', icon: Flame, color: 'from-red-600 to-red-800', border: 'border-red-500' },
  { id: 'DUEL', label: 'Дуэль знаний', desc: 'Микс из 2 категорий', icon: Shuffle, color: 'from-emerald-600 to-teal-800', border: 'border-emerald-500' },
]

const categories = [
  { id: 'html', label: 'HTML', icon: Globe, color: 'text-orange-400' },
  { id: 'css', label: 'CSS', icon: Palette, color: 'text-blue-400' },
  { id: 'javascript', label: 'JavaScript', icon: Braces, color: 'text-yellow-400' },
  { id: 'react', label: 'React', icon: Atom, color: 'text-cyan-400' },
  { id: 'nodejs', label: 'Node.js', icon: Server, color: 'text-green-400' },
  { id: 'databases', label: 'Базы данных', icon: Database, color: 'text-purple-400' },
]

const difficulties = [
  { id: 'easy', label: 'Лёгкий', icon: Star, color: 'text-green-400', border: 'border-green-500' },
  { id: 'medium', label: 'Средний', icon: Stars, color: 'text-yellow-400', border: 'border-yellow-500' },
  { id: 'hard', label: 'Сложный', icon: Zap, color: 'text-red-400', border: 'border-red-500' },
]

export default function QuizSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialMode = (location.state as any)?.mode || 'CLASSIC'

  const [selectedMode, setSelectedMode] = useState(initialMode)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  const isDuel = selectedMode === 'DUEL'

  const canStart = isDuel
    ? selectedCategories.length === 2 && selectedDifficulty
    : selectedCategory && selectedDifficulty

  const handleCategoryClick = (catId: string) => {
    if (isDuel) {
      setSelectedCategories((prev) => {
        if (prev.includes(catId)) return prev.filter((c) => c !== catId)
        if (prev.length >= 2) return [prev[1], catId]
        return [...prev, catId]
      })
    } else {
      setSelectedCategory(catId)
    }
  }

  const handleModeChange = (modeId: string) => {
    setSelectedMode(modeId)
    // Reset category selections when switching modes
    if (modeId === 'DUEL') {
      setSelectedCategory(null)
    } else {
      setSelectedCategories([])
    }
  }

  const isCategorySelected = (catId: string) => {
    return isDuel ? selectedCategories.includes(catId) : selectedCategory === catId
  }

  const handleStart = () => {
    if (!canStart) return
    const category = isDuel ? selectedCategories.join(',') : selectedCategory
    navigate('/quiz/play', {
      state: { mode: selectedMode, category, difficulty: selectedDifficulty },
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeInUp">
      <h1 className="text-2xl font-bold">Настройка игры</h1>

      {/* Mode selection */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Режим</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`bg-gradient-to-br ${m.color} rounded-xl p-4 text-left transition-all duration-300 border-2 ${
                selectedMode === m.id
                  ? `${m.border} scale-[1.03]`
                  : 'border-transparent hover:border-white/20'
              }`}
            >
              <m.icon size={24} className="mb-2" />
              <h3 className="text-sm font-bold">{m.label}</h3>
              <p className="text-xs text-white/60 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Category selection */}
      <div>
        <h2 className="text-lg font-semibold mb-1">
          {isDuel ? 'Категории' : 'Категория'}
        </h2>
        {isDuel && (
          <p className="text-sm text-gray-400 mb-3">
            Выберите 2 категории для микса ({selectedCategories.length}/2)
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`bg-neutral-900 rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 border-2 ${
                isCategorySelected(cat.id)
                  ? isDuel
                    ? 'border-emerald-500 bg-emerald-500/10 scale-[1.03]'
                    : 'border-purple-500 bg-purple-500/10 scale-[1.03]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <cat.icon size={28} className={cat.color} />
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty selection */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Сложность</h2>
        <div className="grid grid-cols-3 gap-3">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`bg-neutral-900 rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 border-2 ${
                selectedDifficulty === diff.id
                  ? `${diff.border} scale-[1.03]`
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <diff.icon size={24} className={diff.color} />
              <span className="text-sm font-medium">{diff.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Play size={20} />
        Начать
      </button>
    </div>
  )
}

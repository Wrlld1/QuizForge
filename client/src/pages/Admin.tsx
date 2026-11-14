import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  HelpCircle,
  Users,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  TrendingUp,
  Gamepad2,
  Code,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import Modal from '../components/Modal'
import PageTransition from '../components/PageTransition'

const categories = ['html', 'css', 'javascript', 'react', 'nodejs', 'databases']
const difficulties = ['easy', 'medium', 'hard']

type Tab = 'dashboard' | 'questions' | 'users'

// ─── Dashboard Tab ───

interface StatsData {
  totalUsers: number
  totalGames: number
  totalQuestions: number
  avgScore: number
  activeToday: number
  activeWeek: number
}

interface AnalyticsData {
  categoryDistribution: { category: string; count: number }[]
  activityDays: { date: string; count: number }[]
  hardestQuestions: { id: number; text: string; category: string }[]
  easiestQuestions: { id: number; text: string; category: string }[]
}

function DashboardTab() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalGames: 0,
    totalQuestions: 0,
    avgScore: 0,
    activeToday: 0,
    activeWeek: 0,
  })
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    categoryDistribution: [],
    activityDays: [],
    hardestQuestions: [],
    easiestQuestions: [],
  })

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => {})
    api.get('/admin/analytics')
      .then((r) => setAnalytics(r.data))
      .catch(() => {})
  }, [])

  const maxActivity = Math.max(...analytics.activityDays.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} className="text-blue-400" />} label="Пользователи" value={stats.totalUsers} />
        <StatCard icon={<Gamepad2 size={20} className="text-green-400" />} label="Игры" value={stats.totalGames} />
        <StatCard icon={<HelpCircle size={20} className="text-orange-400" />} label="Вопросы" value={stats.totalQuestions} />
        <StatCard icon={<TrendingUp size={20} className="text-purple-400" />} label="Ср. балл" value={stats.avgScore} />
      </div>

      {/* Activity sub-stats */}
      <div className="flex gap-4">
        <div className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm">
          Активны сегодня: <span className="font-bold text-green-400">{stats.activeToday}</span>
        </div>
        <div className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm">
          Активны за неделю: <span className="font-bold text-blue-400">{stats.activeWeek}</span>
        </div>
      </div>

      {/* Activity chart */}
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Активность (последние 7 дней)</h3>
        <div className="flex items-end gap-2 h-32">
          {analytics.activityDays.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{d.count}</span>
              <div
                className="w-full bg-purple-600 rounded-t-md transition-all duration-500"
                style={{ height: `${(d.count / maxActivity) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
              />
              <span className="text-xs text-gray-500">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hardest / Easiest questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Самые сложные вопросы</h3>
          {analytics.hardestQuestions.length === 0 && (
            <p className="text-sm text-gray-500">Нет данных</p>
          )}
          {analytics.hardestQuestions.map((q) => (
            <div key={q.id} className="flex items-center gap-2 py-2 border-b border-white/10/50 last:border-0">
              <span className="text-xs text-gray-500">#{q.id}</span>
              <span className="text-sm truncate flex-1">{q.text}</span>
              <span className="text-xs text-gray-500">{q.category}</span>
            </div>
          ))}
        </div>
        <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-green-400 mb-3">Самые лёгкие вопросы</h3>
          {analytics.easiestQuestions.length === 0 && (
            <p className="text-sm text-gray-500">Нет данных</p>
          )}
          {analytics.easiestQuestions.map((q) => (
            <div key={q.id} className="flex items-center gap-2 py-2 border-b border-white/10/50 last:border-0">
              <span className="text-xs text-gray-500">#{q.id}</span>
              <span className="text-sm truncate flex-1">{q.text}</span>
              <span className="text-xs text-gray-500">{q.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">{icon}<span className="text-sm text-gray-400">{label}</span></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

// ─── Questions Tab ───

interface QuestionRow {
  id: number
  text: string
  category: string
  difficulty: string
  options: string
  answer: number
  codeSnippet?: string | null
  codeLanguage?: string | null
}

interface QuestionForm {
  text: string
  category: string
  difficulty: string
  options: string[]
  answer: number
  codeSnippet: string
  codeLanguage: string
}

const codeLanguages = ['', 'javascript', 'html', 'css', 'sql']

const emptyForm: QuestionForm = { text: '', category: 'html', difficulty: 'medium', options: ['', '', '', ''], answer: 0, codeSnippet: '', codeLanguage: '' }

function QuestionsTab() {
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [filterCat, setFilterCat] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<QuestionForm>({ ...emptyForm })
  const limit = 10

  const fetchQuestions = useCallback(async () => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (filterCat) params.set('category', filterCat)
    if (filterDiff) params.set('difficulty', filterDiff)
    if (search) params.set('search', search)
    try {
      const { data } = await api.get(`/admin/questions?${params}`)
      setQuestions(data.questions)
      setTotal(data.total)
    } catch { /* ignore */ }
  }, [offset, filterCat, filterDiff, search])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const openCreate = () => {
    setEditId(null)
    setForm({ ...emptyForm })
    setShowModal(true)
  }

  const openEdit = (q: QuestionRow) => {
    let opts: string[] = []
    try { opts = JSON.parse(q.options) } catch { opts = [q.options] }
    setEditId(q.id)
    setForm({ text: q.text, category: q.category, difficulty: q.difficulty, options: opts, answer: q.answer, codeSnippet: q.codeSnippet || '', codeLanguage: q.codeLanguage || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    const payload = { text: form.text, category: form.category, difficulty: form.difficulty, options: form.options, answer: form.answer, codeSnippet: form.codeSnippet || null, codeLanguage: form.codeLanguage || null }
    if (editId) {
      await api.put(`/admin/questions/${editId}`, payload)
    } else {
      await api.post('/admin/questions', payload)
    }
    setShowModal(false)
    fetchQuestions()
  }

  const handleDelete = async (id: number) => {
    await api.delete(`/admin/questions/${id}`)
    fetchQuestions()
  }

  const addOption = () => setForm({ ...form, options: [...form.options, ''] })
  const removeOption = (i: number) => {
    const opts = form.options.filter((_, idx) => idx !== i)
    setForm({ ...form, options: opts, answer: form.answer >= opts.length ? 0 : form.answer })
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setOffset(0) }} className="bg-neutral-900 border border-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500">
          <option value="">Все категории</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterDiff} onChange={(e) => { setFilterDiff(e.target.value); setOffset(0) }} className="bg-neutral-900 border border-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500">
          <option value="">Все сложности</option>
          {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0) }}
            placeholder="Поиск..."
            className="w-full bg-neutral-900 border border-white/10 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-purple-500"
          />
        </div>
        <button onClick={openCreate} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors">
          <Plus size={16} /> Добавить вопрос
        </button>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-white/10">
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3">Текст</th>
              <th className="px-4 py-3 w-28">Категория</th>
              <th className="px-4 py-3 w-24">Сложность</th>
              <th className="px-4 py-3 w-20 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-b border-white/10/50 hover:bg-gray-750 transition-colors">
                <td className="px-4 py-3 text-gray-500">{q.id}</td>
                <td className="px-4 py-3 truncate max-w-xs">
                  <span className="flex items-center gap-1.5">
                    {q.codeSnippet && <Code size={14} className="text-cyan-400 shrink-0" />}
                    {q.text}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{q.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400'
                    : q.difficulty === 'easy' ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                  }`}>{q.difficulty}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-400 hover:text-blue-400 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Вопросы не найдены</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination total={total} limit={limit} offset={offset} setOffset={setOffset} />

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Редактировать вопрос' : 'Новый вопрос'}>
        <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Текст вопроса</label>
              <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3}
                className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-purple-500 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Категория</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-purple-500">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Сложность</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-purple-500">
                  {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Варианты ответов</label>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => setForm({ ...form, answer: i })}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                        form.answer === i ? 'border-green-500 bg-green-500/20' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      title="Отметить как правильный"
                    >
                      {form.answer === i && <Check size={14} className="text-green-400" />}
                    </button>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const opts = [...form.options]
                        opts[i] = e.target.value
                        setForm({ ...form, options: opts })
                      }}
                      placeholder={`Вариант ${i + 1}`}
                      className="flex-1 bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-purple-500"
                    />
                    {form.options.length > 2 && (
                      <button onClick={() => removeOption(i)} className="p-1 text-gray-500 hover:text-red-400 transition-colors"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
              {form.options.length < 6 && (
                <button onClick={addOption} className="mt-2 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                  <Plus size={14} /> Добавить вариант
                </button>
              )}
            </div>

            {/* Code snippet */}
            <div>
              <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1.5">
                <Code size={14} /> Код (необязательно)
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2 mb-2">
                <select value={form.codeLanguage} onChange={(e) => setForm({ ...form, codeLanguage: e.target.value })}
                  className="bg-neutral-800 rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-purple-500">
                  <option value="">Без кода</option>
                  {codeLanguages.filter(Boolean).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {form.codeLanguage && (
                <textarea
                  value={form.codeSnippet}
                  onChange={(e) => setForm({ ...form, codeSnippet: e.target.value })}
                  rows={5}
                  placeholder="Вставьте код..."
                  className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm font-mono outline-none border border-transparent focus:border-purple-500 resize-none"
                />
              )}
            </div>

            <button onClick={handleSave}
              className="w-full bg-purple-600 hover:bg-purple-500 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Check size={16} /> {editId ? 'Сохранить' : 'Создать вопрос'}
            </button>
        </div>
      </Modal>
    </div>
  )
}

// ─── Users Tab ───

interface UserRow {
  id: number
  username: string
  email: string
  role: string
  rating: number
  level: number
  createdAt: string
}

function UsersTab() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const limit = 10

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (search) params.set('search', search)
    try {
      const { data } = await api.get(`/admin/users?${params}`)
      setUsers(data.users)
      setTotal(data.total)
    } catch { /* ignore */ }
  }, [offset, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleRole = async (u: UserRow) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN'
    await api.put(`/admin/users/${u.id}/role`, { role: newRole })
    fetchUsers()
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString()

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0) }}
          placeholder="Поиск по имени или email..."
          className="w-full bg-neutral-900 border border-white/10 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-purple-500"
        />
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-white/10">
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 w-20">Роль</th>
              <th className="px-4 py-3 w-20">Рейтинг</th>
              <th className="px-4 py-3 w-16">Уровень</th>
              <th className="px-4 py-3 w-24">Регистрация</th>
              <th className="px-4 py-3 w-16 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/10/50 hover:bg-gray-750 transition-colors">
                <td className="px-4 py-3 text-gray-500">{u.id}</td>
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-800 text-gray-400'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-purple-400 font-medium">{u.rating}</td>
                <td className="px-4 py-3 text-gray-400">{u.level}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUser?.id ? (
                    <button onClick={() => toggleRole(u)} className="p-1.5 rounded-lg hover:bg-neutral-800 text-gray-400 hover:text-purple-400 transition-colors" title="Сменить роль">
                      <Shield size={14} />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-600">Вы</span>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Пользователи не найдены</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination total={total} limit={limit} offset={offset} setOffset={setOffset} />
    </div>
  )
}

// ─── Shared Pagination ───

function Pagination({ total, limit, offset, setOffset }: { total: number; limit: number; offset: number; setOffset: (n: number) => void }) {
  if (total <= limit) return null
  return (
    <div className="flex items-center justify-center gap-3">
      <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}
        className="p-2 rounded-lg bg-neutral-900 border border-white/10 hover:bg-neutral-800 disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
      <span className="text-sm text-gray-400">{offset + 1}-{Math.min(offset + limit, total)} из {total}</span>
      <button onClick={() => setOffset(offset + limit)} disabled={offset + limit >= total}
        className="p-2 rounded-lg bg-neutral-900 border border-white/10 hover:bg-neutral-800 disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
    </div>
  )
}

// ─── Main Admin Page ───

const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Панель', icon: LayoutDashboard },
  { key: 'questions', label: 'Вопросы', icon: HelpCircle },
  { key: 'users', label: 'Пользователи', icon: Users },
]

export default function Admin() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  // Redirect non-admins
  if (user && user.role !== 'ADMIN' && user.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Shield size={48} className="mx-auto text-gray-600 mb-4" />
        <h1 className="text-xl font-bold text-gray-400">Доступ запрещён</h1>
        <p className="text-gray-500 mt-1">Требуются права администратора</p>
      </div>
    )
  }

  return (
    <PageTransition>
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-900 border border-white/10 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'users' && <UsersTab />}
    </div>
    </PageTransition>
  )
}
